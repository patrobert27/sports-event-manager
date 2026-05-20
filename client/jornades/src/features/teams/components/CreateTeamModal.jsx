import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { createTeam } from "../teamThunks";
import TeacherAutocomplete from "../../../components/ui/TeacherAutocomplete";
import { createPortal } from "react-dom";
import { X, Trophy } from "lucide-react";

// Aquest modal serveix per configurar i crear un equip nou dins la jornada seleccionada
export default function CreateTeamModal({ competitionId, onClose }) {
  const dispatch = useDispatch();
  const [localError, setLocalError] = useState(null);

  // useForm preparat amb els valors de sortida de l'escut i colors corporatius per defecte
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { 
      errors, 
      isSubmitting 
    }
  } = useForm({
    defaultValues: {
      name: "",
      teacher_id: null,
      primary_color: "#000000",
      secondary_color: "#ffffff",
      shield: ""
    }
  });

  const shieldUrl = watch("shield");

  // handler de submit per enviar la informació de l'equip cap a Redux
  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        competition_id: parseInt(competitionId),
        teacher_id: data.teacher_id ? parseInt(data.teacher_id) : null
      };

      await dispatch(
        createTeam(payload, competitionId)
      );
      
      onClose();
      
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh] border border-blue-50/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Capçalera del modal */}
        <div className="px-6 py-5 sm:px-8 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Trophy size={22} strokeWidth={2.5} />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-dark">
                Configurar Nou Equip
              </h3>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-muted hover:text-dark p-2 hover:bg-gray-50 rounded-full transition-all active:scale-90"
            aria-label="Tancar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cos del modal (scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {localError && (
            <div className="bg-danger/5 text-danger p-4 rounded-2xl text-sm font-bold mb-6 border border-danger/20 animate-fade-in">
              {localError}
            </div>
          )}

          <form 
            onSubmit={handleSubmit(onSubmit)} 
            id="create-team-form"
            className="space-y-6"
          >
            {/* Nom de l'equip: obligatori per identificar-se a les graelles de partits */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">
                Nom de l'equip *
              </label>
              
              <input
                {...register("name", {
                  required: "El nom és obligatori",
                  minLength: { value: 3, message: "Mínim 3 caràcters" },
                  maxLength: { value: 30, message: "Màxim 30 caràcters" }
                })}
                className={`w-full p-3 rounded-xl border text-sm ${errors.name ? 'border-danger' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 outline-none`}
                placeholder="Ex: Els Guerrers"
              />
              
              {errors.name && (
                <p className="text-danger text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Escut de l'equip: comprovem opcionalment una extensió típica per a donar una millor UX */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">
                Escut (URL imatge)
              </label>
              
              <input
                {...register("shield", {
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                    message: "Introdueix una URL vàlida"
                  },
                  validate: {
                    isImage: async (value) => {
                      if (!value) {
                        return true;
                      }
                      
                      // Comprovem si té extensió d'imatge comuna per estalviar la petició de xarxa
                      const hasImageExtension = /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)(\?.*)?$/i.test(value);
                      if (hasImageExtension) {
                        return true;
                      }
                      
                      // Si no té extensió típica, intentem carregar-la
                      const isImg = await new Promise((resolve) => {
                        const img = new Image();
                        const timer = setTimeout(() => resolve(false), 2000);
                        
                        img.onload = () => {
                          clearTimeout(timer);
                          resolve(true);
                        };
                        
                        img.onerror = () => {
                          clearTimeout(timer);
                          resolve(false);
                        };
                        
                        img.src = value;
                      });
                      
                      return isImg || "La URL no apunta a una imatge vàlida";
                    }
                  }
                })}
                type="url"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder="https://..."
              />
              
              {errors.shield && (
                <p className="text-danger text-xs mt-1">
                  {errors.shield.message}
                </p>
              )}
              
              {shieldUrl && !errors.shield && (
                <div className="mt-3 flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 animate-fade-in">
                  
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={shieldUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-dark">
                      Vista prèvia de l'escut
                    </p>
                    <p className="text-[10px] text-muted font-medium truncate max-w-[200px]">
                      {shieldUrl}
                    </p>
                  </div>

                </div>
              )}
            </div>

            {/* Colors corporatius de l'equip per customitzar els badges */}
            <div className="grid grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">
                  Color Primari
                </label>
                
                <input 
                  {...register("primary_color")} 
                  type="color" 
                  className="w-full h-12 p-1 rounded-xl border border-gray-200 cursor-pointer" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">
                  Color Secundari
                </label>
                
                <input 
                  {...register("secondary_color")} 
                  type="color" 
                  className="w-full h-12 p-1 rounded-xl border border-gray-200 cursor-pointer" 
                />
              </div>

            </div>

            {/* Professor Tutor: Autocomplete d'ajuda per enllaçar un tutor al càrrec de l'equip */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">
                Professor Tutor
              </label>
              
              <Controller
                name="teacher_id"
                control={control}
                render={({ field }) => {
                  return (
                    <TeacherAutocomplete
                      value={field.value}
                      onChange={(id) => {
                        field.onChange(id);
                      }}
                    />
                  );
                }}
              />
            </div>

          </form>
        </div>

        {/* Accions finals del peu del modal */}
        <div className="px-6 py-5 sm:px-8 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50/50 rounded-b-3xl">
          
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-muted hover:bg-gray-100 transition-all cursor-pointer"
          >
            Tancar
          </button>
          
          <button
            type="submit"
            form="create-team-form"
            disabled={isSubmitting}
            className="bg-primary text-white font-black px-6 py-2.5 rounded-xl hover-lift shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creant...
              </>
            ) : (
              "Finalitzar"
            )}
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
}
