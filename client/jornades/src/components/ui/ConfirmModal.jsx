import React from "react";
import { createPortal } from "react-dom";

/**
 * Modal de confirmació reutilitzable per substituir window.confirm
 */
export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancel·lar",
  type = "danger"
}) {
  if (!isOpen) {
    return null;
  }

  const confirmColors = type === "danger" 
    ? "bg-danger hover:bg-danger/90 shadow-danger/20" 
    : "bg-primary hover:bg-primary/90 shadow-primary/20";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
          <p className="text-muted text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-dark hover:bg-gray-100 transition-all cursor-pointer active:scale-95"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-sm active:scale-95 ${confirmColors}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
