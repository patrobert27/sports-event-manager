import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Users } from "lucide-react";

// valors de sortida nets per quan creem l'esport o quan el profe tanca el formulari
const defaultValues = {
  name: "",
  color: "#4FA8F5",
  min_players: 1,
  max_players: 10,
};

// aquest formulari permet als administradors crear una modalitat esportiva nova per a les jornades
export default function AddActivity({ isOpen, onClose, onCreate }) {
  
  // fem servir react-hook-form per estalviar-nos codi repetitiu de validació de texts
  const {
    register,
    handleSubmit,
    reset,
    formState: { 
      errors, 
      isValid, 
      isSubmitting 
    },
  } = useForm({ 
    mode: "onChange", 
    defaultValues: defaultValues 
  });

  // handler de submit per enviar les dades cap al thunk de creacio de l'esport
  const submit = async (data) => {
    try {
      
      await onCreate(data);
      
      // buidem els camps perquè el formulari estigui net la propera vegada
      reset(defaultValues);
      
      // tanquem el desplegable quan el profe guarda o cancel·la correctament
      onClose();
      
    } catch (error) {
      // deixem passar perque l'error ja es gestiona des del thunk global de Redux
    }
  };

  // vigilem si es tanca el panell de creació per a fer un reset de seguretat
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mt-4 bg-white rounded-3xl p-8 border border-primary/10 shadow-[0_20px_50px_rgba(79,168,245,0.12)] animate-in slide-in-from-top-6 fade-in duration-300">
      
      {/* Capçalera del formulari desplegable */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Plus size={24} strokeWidth={2.5} />
        </div>
        
        <h3 className="text-2xl font-bold text-dark tracking-tight">
          Nova modalitat esportiva
        </h3>
      </div>
      
      <form 
        onSubmit={handleSubmit(submit)} 
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Nom de l'esport: Camp obligatori perquè no volem activitats sense nom a la llista */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-dark/70 ml-1">
              Nom de l'activitat *
            </label>
            
            <input
              {...register("name", { 
                required: "El nom és obligatori" 
              })}
              className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3.5 text-dark placeholder:text-muted/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
              placeholder="Ex: Futbol Sala, Bàdminton..."
            />
            
            {errors.name && (
              <p className="text-danger text-xs font-medium ml-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Color identificatiu: obligatori per a que les targetes mantinguin un estil diferenciat */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-dark/70 ml-1">
              Color identificatiu *
            </label>
            
            <div className="flex gap-3">
              <input
                type="color"
                {...register("color", { 
                  required: "El color és obligatori" 
                })}
                className="w-full h-14 p-1.5 bg-gray-50 border border-primary/10 rounded-2xl cursor-pointer focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

        </div>

        {/* Límits de jugadors per equip: decisió de context clau per estructurar la lligueta correctament */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Mínim de jugadors: si no es valida, es podrien crear partits inviables de pocs jugadors */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-dark/70 ml-1 flex items-center gap-1.5">
              <Users size={14} /> Mínim de jugadors *
            </label>
            
            <input
              type="number"
              min={1}
              {...register("min_players", { 
                required: "Camp obligatori",
                valueAsNumber: true,
                min: { value: 1, message: "Mínim 1" }
              })}
              className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3.5 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
            />
            
            {errors.min_players && (
              <p className="text-danger text-xs font-medium ml-1">
                {errors.min_players.message}
              </p>
            )}
          </div>

          {/* Màxim de jugadors: per seguretat d'espai i garantir que tothom jugui */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-dark/70 ml-1 flex items-center gap-1.5">
              <Users size={14} /> Màxim de jugadors *
            </label>
            
            <input
              type="number"
              min={1}
              {...register("max_players", { 
                required: "Camp obligatori",
                valueAsNumber: true,
                min: { value: 1, message: "Mínim 1" }
              })}
              className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3.5 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
            />
            
            {errors.max_players && (
              <p className="text-danger text-xs font-medium ml-1">
                {errors.max_players.message}
              </p>
            )}
          </div>

        </div>

        {/* Botons d'acció del formulari */}
        <div className="flex items-center gap-4 pt-6 border-t border-primary/5">
          
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex-1 md:flex-none bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creant activitat..." : "Guardar activitat"}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="flex-1 md:flex-none px-8 py-4 rounded-2xl border border-gray-200 text-dark font-bold hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            Cancel·lar
          </button>

        </div>

      </form>
    </div>
  );
}
