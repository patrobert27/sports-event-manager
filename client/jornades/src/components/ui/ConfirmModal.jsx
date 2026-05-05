import React from "react";

/**
 * Modal de confirmació reutilitzable per substituir window.confirm
 */
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
          <p className="text-muted text-sm">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-dark hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel·lar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-danger text-white hover:bg-danger/90 transition-colors cursor-pointer shadow-sm shadow-danger/20"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
