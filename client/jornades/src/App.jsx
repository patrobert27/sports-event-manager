import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PrincipalPage from "./pages/PrincipalPage";
import RequireAuth from "./components/RequireAuth";
import CompetitionsPage from "./pages/CompetitionsPage";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      {/* Ruta pública per defecte on l'usuari pot iniciar sessió */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutes protegides: només accessibles si l'usuari està autenticat */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          {/* Llista principal de jornades */}
          <Route path="/jornades" element={<PrincipalPage />} />
          {/* Llista i edició de competicions */}
          <Route path="/jornades/competicions" element={<CompetitionsPage />} />
        </Route>
      </Route>

      {/* Qualsevol altra ruta redirigeix al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
