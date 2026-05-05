// 1. Imports de biblioteques externes
import { Routes, Route, Navigate } from "react-router-dom";

// 2. Imports de components de pàgines (Pages)
import LoginPage from "./pages/LoginPage";
import PrincipalPage from "./pages/PrincipalPage";
import CompetitionsPage from "./pages/CompetitionsPage";
import CompetitionDetailsPage from "./pages/CompetitionDetailsPage";
import UsersPage from "./pages/UsersPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import FieldsPage from "./pages/FieldsPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";

// 3. Imports de components de seguretat i disseny
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";

// 4. Imports de constants i dades
import { ROLES } from "./constants/roles";

/**
 * COMPONENT PRINCIPAL APP
 * 
 * Aquí definim el sistema de rutes (el mapa) de tota la nostra aplicació.
 * Fem servir React Router per decidir quin component s'ha de mostrar segons l'URL.
 */
function App() {
  return (
    <Routes>
      {/* 
          RUTA PÚBLICA:
          Aquesta ruta és accessible per tothom, fins i tot si no han fet login.
      */}
      <Route 
        path="/login" 
        element={<LoginPage />} 
      />

      {/* 
          RUTES PROTEGIDES (LOGIN REQUERIT):
          Fem servir el component 'RequireAuth' per comprovar si l'usuari ha iniciat sessió.
          Si no ho ha fet, el component RequireAuth el redirigirà automàticament al login.
      */}
      <Route 
        element={<RequireAuth />}
      >
        {/* 
            LAYOUT COMÚ:
            El component 'Layout' conté el menú lateral i la capçalera. 
            Totes les rutes de dins heretaran aquest disseny.
        */}
        <Route 
          element={<Layout />}
        >
          {/* Llista principal de les jornades disponibles */}
          <Route 
            path="/jornades" 
            element={<PrincipalPage />} 
          />
          
          {/* Pantalla per llistar i editar competicions (per a professors/admins) */}
          <Route 
            path="/jornades/competicions" 
            element={<CompetitionsPage />} 
          />
          
          {/* Vista del detall d'una competició concreta (pistes, equips, etc.) */}
          <Route 
            path="/jornades/competicions/:id" 
            element={<CompetitionDetailsPage />} 
          />
          
          {/* Vista d'un equip específic d'una competició (jugadors i resultats) */}
          <Route 
            path="/jornades/competicions/:competitionId/teams/:teamId" 
            element={<TeamDetailsPage />} 
          />

          {/* Pàgina que es mostra quan un usuari intenta entrar a un lloc on no té permís */}
          <Route 
            path="/403" 
            element={<ForbiddenPage />} 
          />
        </Route>
      </Route>

      {/* 
          RUTES D'ADMINISTRACIÓ (NOMÉS ADMINS):
          Aquestes rutes només són visibles per a usuaris amb el rol ADMIN.
      */}
      <Route 
        element={
          <RequireAuth 
            allowedRoles={[ROLES.ADMIN]} 
          />
        }
      >
        <Route 
          element={<Layout />}
        >
          {/* Gestió d'usuaris del sistema (donar d'alta, canviar rols) */}
          <Route 
            path="/jornades/usuaris" 
            element={<UsersPage />} 
          />
          
          {/* Gestió del catàleg d'activitats i esports */}
          <Route 
            path="/jornades/activitats" 
            element={<ActivitiesPage />} 
          />
          
          {/* Gestió de les instal·lacions esportives (camps i pavellons) */}
          <Route 
            path="/jornades/camps" 
            element={<FieldsPage />} 
          />
        </Route>
      </Route>

      {/* 
          RUTA PER DEFECTE (CATCH-ALL):
          Si l'usuari posa una URL que no existeix, el portem sempre al login.
      */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to="/login" 
            replace 
          />
        } 
      />
    </Routes>
  );
}

export default App;
