import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { X, MapPin, Layout } from 'lucide-react';

// Aquest modal permet als professors editar la ubicacio o número de pistes de joc del camp seleccionat
const EditFieldModal = ({ field, onClose, onUpdate }) => {
  
  // preparem react-hook-form sincronitzat amb els valors de la pista que rebem per prop
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
      name: field.name,
      location: field.location || "",
      number_of_courts: field.number_of_courts || 1,
    }
  });

  // efecte per a actualitzar els valors del formulari en calent si s'obre un camp diferent
  useEffect(() => {
    reset({
      name: field.name,
      location: field.location || "",
      number_of_courts: field.number_of_courts || 1,
    });
  }, [field, reset]);

  // handler de submit per actualitzar les pistes al backend a través del thunk d'actualització
  const onSubmit = async (data) => {
    try {
      await onUpdate(field.id, data);
      onClose();
    } catch (error) {
      // deixem passar l'error perque l'estat de Redux global ja ho reflectirà
    }
  };

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
              <MapPin size={22} strokeWidth={2.5} />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-dark">
                Editar camp
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

        {/* Formulari d'edició */}
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0"
        >
          <div className="space-y-6">
            
            {/* Nom del camp */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1">
                Nom del camp *
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

            {/* Ubicació del camp */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1">
                Ubicació / Adreça
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/40">
                  <MapPin size={18} />
                </div>
                
                <input
                  {...register("location", {
                    maxLength: { value: 100, message: "L'adreça és massa llarga" }
                  })}
                  className="w-full bg-gray-50 border border-primary/10 rounded-2xl pl-11 pr-4 py-3 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
                />
              </div>
              
              {errors.location && (
                <p className="text-danger text-xs font-medium ml-1">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Número de pistes */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1 flex items-center gap-1.5">
                <Layout size={14} /> Número de pistes *
              </label>
              
              <input
                type="number"
                {...register("number_of_courts", { 
                  required: "Camp obligatori",
                  valueAsNumber: true,
                  min: { value: 1, message: "Mínim 1" },
                  max: { value: 20, message: "Màxim 20" }
                })}
                className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
              />
              
              {errors.number_of_courts && (
                <p className="text-danger text-xs font-medium ml-1">
                  {errors.number_of_courts.message}
                </p>
              )}
            </div>

          </div>

          {/* Botons de tancat o desar */}
          <div className="flex gap-4 pt-4 border-t border-primary/5">
            
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
              className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-dark font-bold hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              Cancel·lar
            </button>

          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};

export default EditFieldModal;
