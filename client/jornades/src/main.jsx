// 1. Imports de biblioteques externes
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

// 2. Imports de la nostra aplicació
import { store } from "./app/store";
import { UserProvider } from "./context/userContext.jsx";
import App from "./App.jsx";

// 3. Estils globals
import "./index.css";

/**
 * PUNT D'ENTRADA PRINCIPAL DE L'APLICACIÓ
 * 
 * En aquest fitxer inicialitzem React i configurem tots els embolcalls (Providers)
 * que necessitem perquè l'aplicació funcioni correctament.
 */

// Busquem l'element HTML amb l'ID 'root' (on es muntarà l'App)
const rootElement = document.getElementById("root");

// Creem l'arrel de React
const root = createRoot(rootElement);

// Renderitzem l'aplicació
root.render(
  <StrictMode>
    {/* 1. Provider de Redux: Permet que tota l'App tingui accés a l'estat global */}
    <Provider 
      store={store}
    >
      {/* 2. UserProvider: Context personalitzat per a dades de l'usuari (opcional segons la arquitectura) */}
      <UserProvider>
        {/* 3. BrowserRouter: Gestiona la navegació per URLs (rutes) */}
        <BrowserRouter>
          {/* L'App principal on hi ha tot el contingut */}
          <App />
        </BrowserRouter>
      </UserProvider>
    </Provider>
  </StrictMode>
);
