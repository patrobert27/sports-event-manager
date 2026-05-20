import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronDown, User } from "lucide-react";
import teamService from "../../features/teams/teamService";

/**
 * TeacherAutocomplete
 *
 * Camp d'autocompletat per a la selecció de professor tutor.
 * - Mostra input de text amb cerca en temps real (≥3 caràcters)
 * - Limita els resultats a 10
 * - Mostra el nom del professor seleccionat
 * - Permet esborrar la selecció
 *
 * @param {number|string} value - ID del professor seleccionat (controlat)
 * @param {function} onChange - Callback (id) => void
 * @param {string} initialName - Nom inicial (per al mode edició)
 */
export default function TeacherAutocomplete({ value, onChange, initialName = "" }) {
  const [inputText, setInputText]   = useState(initialName);
  const [results, setResults]       = useState([]);
  const [isOpen, setIsOpen]         = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [selectedName, setSelectedName] = useState(initialName);

  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Tancar el dropdown si es clica fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quan canvia el valor extern (reset de formulari), sincronitzem el text mostrat
  useEffect(() => {
    if (!value) {
      setInputText("");
      setSelectedName("");
    }
  }, [value]);

  const handleInputChange = useCallback((e) => {
    const text = e.target.value;
    setInputText(text);
    setSelectedName(""); // L'usuari ha canviat el text; deseleccionem

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const teachers = await teamService.searchTeachers(text);
        // L'API retorna { success, data: [...] } o directament un array
        const list = Array.isArray(teachers) ? teachers : (teachers?.data ?? []);
        setResults(list);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  }, []);

  const handleSelect = (teacher) => {
    const name = `${teacher.first_name} ${teacher.last_name}`;
    setSelectedName(name);
    setInputText(name);
    setIsOpen(false);
    setResults([]);
    onChange(teacher.id);
  };

  const handleClear = () => {
    setInputText("");
    setSelectedName("");
    setResults([]);
    setIsOpen(false);
    onChange(null);
  };

  const hasSelection = !!value && !!selectedName;

  return (
    <div ref={containerRef} className="relative">
      <div className={`relative flex items-center border rounded-xl transition-all ${
        isOpen ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
      } ${hasSelection ? "bg-primary/5" : "bg-white"}`}>
        {/* Icona esquerra */}
        <div className="pl-3 text-muted/60 shrink-0">
          {hasSelection ? <User size={15} className="text-primary" /> : <Search size={15} />}
        </div>

        {/* Input */}
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Escriu el nom del professor (mínim 3 lletres)..."
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted/40"
          autoComplete="off"
        />

        {/* Estat: loading / clear / chevron */}
        <div className="pr-3 shrink-0">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : hasSelection ? (
            <button type="button" onClick={handleClear} className="text-muted/50 hover:text-danger transition-colors">
              <X size={14} strokeWidth={2.5} />
            </button>
          ) : (
            <ChevronDown size={14} className="text-muted/40" />
          )}
        </div>
      </div>

      {/* Dropdown de resultats */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          {results.map((teacher) => (
            <li key={teacher.id}>
              <button
                type="button"
                onClick={() => handleSelect(teacher)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-primary/5 transition-colors text-left"
              >
                {/* Avatar amb inicials */}
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center shrink-0">
                  {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                </div>
                <div>
                  <div className="font-semibold">{teacher.first_name} {teacher.last_name}</div>
                  <div className="text-muted text-[11px]">{teacher.email}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Missatge si no hi ha resultats */}
      {isOpen && inputText.length >= 3 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3 text-sm text-muted animate-fade-in">
          Cap professor trobat amb &quot;{inputText}&quot;
        </div>
      )}

      {/* Hint mínim de caràcters */}
      {!isOpen && inputText.length > 0 && inputText.length < 3 && (
        <p className="text-muted/60 text-[11px] mt-1 px-1">
          Escriu {3 - inputText.length} lletra{3 - inputText.length !== 1 ? "s" : ""} més per cercar
        </p>
      )}
    </div>
  );
}
