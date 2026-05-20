import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { X, Palette, Users } from "lucide-react";

// Aquest modal permet als professors editar els paràmetres de límits o nom de l'esport seleccionat
export default function EditActivityModal({ activity, onClose, onUpdate }) {
  
  // preparem react-hook-form sincronitzat amb els valors de l'activitat que rebem per prop
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
    defaultValues: {
      name: activity.name,
      color: activity.color || "#4FA8F5",
      min_players: activity.min_players || 1,
      max_players: activity.max_players || 10,
    }
  });

  // Efecte per sincronitzar el formulari a l'acte si s'obre una altra activitat diferent
  useEffect(() => {
    if (activity) {
      reset({
        name: activity.name,
        color: activity.color || "#4FA8F5",
        min_players: activity.min_players || 1,
        max_players: activity.max_players || 10,
      });
    }
  }, [activity, reset]);

  // enviem els canvis editats cap al thunk d'actualització de Redux
  const submit = async (data) => {
    try {
      
      await onUpdate(activity.id, data);
      
      // tanquem el modal quan el profe guarda correctament
      onClose();
      
    } catch (error) {
      // deixem passar l'error perque l'estat global de Redux ja el captura
    }
  };

  // Escoltador per a tancar el modal còmodament prement la tecla Esc del teclat
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh] border border-blue-50/50"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        
        {/* Capçalera del modal */}
        <div className="px-6 py-5 sm:px-8 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Palette size={22} strokeWidth={2.5} />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-dark">
                Editar activitat
              </h3>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-muted hover:text-dark p-2 hover:bg-gray-50 rounded-full transition-all active:scale-90"
            aria-label="Tancar"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Formulari d'edició d'activitat */}
        <form 
          onSubmit={handleSubmit(submit)} 
          className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0"
        >
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nom de l'activitat esportiva */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1">
                Nom de l'activitat *
              </label>
              
              <input
                {...register("name", { 
                  required: "El nom és obligatori",
                  minLength: { value: 3, message: "Mínim 3 caràcters" },
                  maxLength: { value: 50, message: "Màxim 50 caràcters" }
                })}
                className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
              />
              
              {errors.name && (
                <p className="text-danger text-xs font-medium ml-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Color del badge */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1">
                Color *
              </label>
              
              <div className="flex gap-3">
                <input
                  type="color"
                  {...register("color", { 
                    required: "El color és obligatori" 
                  })}
                  className="w-12 h-12 p-1 bg-gray-50 border border-primary/10 rounded-xl cursor-pointer"
                />
                
                <div className="flex-1 flex items-center px-4 bg-gray-50 border border-primary/10 rounded-xl text-sm font-mono text-dark/60">
                  {activity.color || "#4FA8F5"}
                </div>
              </div>
            </div>

          </div>

          {/* Validacions de límits d'alumnes per equip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Mínim de jugadors */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1 flex items-center gap-1.5">
                <Users size={14} /> Mínim jugadors *
              </label>
              
              <input
                type="number"
                {...register("min_players", { 
                  required: "Obligatori",
                  valueAsNumber: true,
                  min: { value: 1, message: "Mínim 1" }
                })}
                className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
              />
              
              {errors.min_players && (
                <p className="text-danger text-xs font-medium ml-1">
                  {errors.min_players.message}
                </p>
              )}
            </div>

            {/* Màxim de jugadors */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1 flex items-center gap-1.5">
                <Users size={14} /> Màxim jugadors *
              </label>
              
              <input
                type="number"
                {...register("max_players", { 
                  required: "Obligatori",
                  valueAsNumber: true,
                  validate: (value, formValues) => {
                    if (value < formValues.min_players) {
                      return "Ha de ser >= al mínim";
                    }
                    if (value > 100) {
                      return "Màxim 100 jugadors";
                    }
                    return true;
                  }
                })}
                className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
              />
              
              {errors.max_players && (
                <p className="text-danger text-xs font-medium ml-1">
                  {errors.max_players.message}
                </p>
              )}
            </div>

          </div>

          {/* Botons de tancat o desat del formulari d'esports */}
          <div className="flex items-center gap-3 pt-6 border-t border-primary/5">
            
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 bg-primary text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? "Guardant..." : "Guardar canvis"}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-gray-200 text-dark font-bold hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              Cancel·lar
            </button>

          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
