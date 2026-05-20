import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const useToasts = () => useContext(ToastContext);

/**
 * ToastProvider
 * Gestiona una cola de notificaciones visuales.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * addToast
   * @param {string} title
   * @param {string} message
   * @param {string} type - 'success' | 'info' | 'error'
   */
  const addToast = useCallback((title, message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto-eliminar después de 5 segundos solo si NO es un error
    if (type !== "error") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Contenedor de Toasts (A la dreta en PC, ajustat i centrat en mòbil) */}
      <div className="fixed top-5 right-4 left-4 sm:left-auto sm:right-5 z-[100] flex flex-col gap-3 pointer-events-none sm:w-full sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-primary/10 rounded-2xl shadow-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 toast-animate"
          >
            <div
              className={`p-2 rounded-xl flex-shrink-0 flex items-center justify-center ${
                toast.type === "success"
                  ? "bg-success/10 text-success"
                  : toast.type === "error"
                    ? "bg-danger/10 text-danger"
                    : "bg-primary/10 text-primary"
              }`}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-dark text-xs sm:text-sm truncate">
                {toast.title}
              </h4>
              <p className="text-muted text-[10px] sm:text-xs mt-0.5 sm:mt-1 line-clamp-2 leading-tight">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted/40 hover:text-dark p-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
