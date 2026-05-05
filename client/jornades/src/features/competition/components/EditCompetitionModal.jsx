import React from "react";
import CompetitionForm from "./CompetitionForm";
import { ErrorAlert } from "../../../components/ui/Alerts";
/**
 * EditCompetitionModal - Smart Wrapper
 * Embolica el CompetitionForm per oferir una experiència consistent amb la resta de la app.
 */
export default function EditCompetitionModal({ competition, onClose }) {
  if (!competition) {
    return <ErrorAlert message="Error no s'ha pogut carregar la competició" />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark">Editar Jornada</h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-dark p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <CompetitionForm
            isEdit={true}
            initialData={competition}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
