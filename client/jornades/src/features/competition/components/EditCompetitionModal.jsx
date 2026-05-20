import React from "react";
import { createPortal } from "react-dom";
import CompetitionForm from "./CompetitionForm";
import { ErrorAlert } from "../../../components/ui/Alerts";

export default function EditCompetitionModal({ competition, onClose }) {
  
  if (!competition) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-blue-100">
          <ErrorAlert 
            message="Error no s'ha pogut carregar la competició" 
          />
          <button 
            onClick={onClose} 
            className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-dark font-bold py-3 rounded-2xl transition-all"
          >
            Tancar
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl animate-in duration-300 sm:zoom-in-95 relative flex flex-col max-h-[90vh] border border-blue-50/50"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Indicador de barra de lliscament només per a mòbil */}
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3 sm:hidden shrink-0" />

        {/* Capçalera del modal d'ajustaments de competició - Fixada a dalt de la targeta */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
              Editar Jornada
            </h2>
            
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">
              Ajustaments de la competició
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-muted hover:text-dark p-2 hover:bg-gray-50 rounded-full transition-all active:scale-90"
            aria-label="Tancar formulari"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Cos del modal scrollable per encabir tot el formulari a l'interior */}
        <div className="px-5 py-5 sm:px-8 sm:py-6 pb-8 sm:pb-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          <CompetitionForm
            isEdit={true}
            initialData={competition}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>

      </div>
    </div>,
    document.body
  );
}
