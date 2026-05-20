import React, { useState } from "react";
import { useForm } from "react-hook-form";

/**
 * AddAnnouncement
 * Formulari desplegable de control perquè els administradors i professors puguin crear comunicats.
 * S'acobla al disseny global i és súper visual.
 */
export default function AddAnnouncement({ onCreate }) {
  
  // controlem si el panell del formulari de creacio de comunicats esta obert o amagat
  const [open, setOpen] = useState(false);

  // fem servir react-hook-form per a estalviar-nos codi repetitiu de validacio de text
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
    mode: "onChange" 
  });

  // handler de submit per enviar la peticio de creacio cap al thunk de Redux
  const submit = async (data) => {
    try {
      
      await onCreate(data);
      
      // resetegem els camps del formulari per a que estiguin nets la propera vegada
      reset();
      
      // tanquem el panell automàticament
      setOpen(false);
      
    } catch (err) {
      // deixem passar l'error perque Redux Slice ja el guarda del thunk general
    }
  };

  return (
    <div className="w-full mb-8">
      
      {/* botó a la dreta per a desplegar o tancar el panell del formulari */}
      <div className="flex items-center justify-end mb-4">
        
        <button
          onClick={() => {
            setOpen((prev) => {
              return !prev;
            });
          }}
          className={`px-5 py-2.5 rounded-2xl font-bold transition-all cursor-pointer shadow-lg active:scale-95 ${
            open
              ? "bg-gray-100 text-dark hover:bg-gray-200"
              : "bg-primary text-white hover:bg-primary-hover shadow-primary/20"
          }`}
        >
          {open ? "Tancar formulari" : "+ Nou Comunicat"}
        </button>

      </div>

      {/* panell desplegable de creació amb els camps obligatoris */}
      {open && (
        <section className="bg-white p-5 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-primary/10 animate-in slide-in-from-top-4 fade-in duration-300 w-full overflow-hidden">
          
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                />
              </svg>
            </div>
            
            <h2 className="text-lg font-bold text-dark">
              Nou Comunicat
            </h2>
          </div>

          <form 
            onSubmit={handleSubmit(submit)} 
            className="space-y-4"
          >
            
            {/* camp del títol del comunicat */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase mb-1 ml-1 tracking-wider">
                Títol de l'avis
              </label>
              
              <input
                {...register("title", { 
                  required: "El títol és obligatori" 
                })}
                className="w-full px-4 py-3 bg-background/50 border border-transparent rounded-xl focus:bg-white focus:border-primary/30 focus:ring-0 transition-all outline-none"
                placeholder="Ex: Inscripcions obertes per al proper torneig"
              />
              
              {errors.title && (
                <p className="text-danger text-[10px] mt-1 ml-1 font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* camp del missatge complet que s'enviarà a tots els estudiants */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase mb-1 ml-1 tracking-wider">
                Missatge
              </label>
              
              <textarea
                {...register("content", { 
                  required: "El contingut és obligatori" 
                })}
                className="w-full px-4 py-3 bg-background/50 border border-transparent rounded-xl h-32 focus:bg-white focus:border-primary/30 focus:ring-0 transition-all outline-none resize-none"
                placeholder="Escriu aquí el que vulguis comunicar a tots els alumnes..."
              />
              
              {errors.content && (
                <p className="text-danger text-[10px] mt-1 ml-1 font-medium">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* botons de control per cancel·lar o trametre el formulari */}
            <div className="flex items-center justify-end gap-3 pt-2">
              
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
                className="px-6 py-3 rounded-2xl font-bold text-muted hover:bg-background/50 transition-all"
              >
                Cancel·lar
              </button>
              
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary-hover shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
              >
                {isSubmitting ? "Enviant..." : "Enviar Comunicat"}
                
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M13 5l7 7-7 7M5 5l7 7-7 7" 
                  />
                </svg>
              </button>

            </div>

          </form>

        </section>
      )}

    </div>
  );
}
