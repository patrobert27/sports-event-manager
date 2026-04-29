import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSelectors";
import LoginPage from "../pages/LoginPage";

function RequireAuth() {
  // Obtenim l'estat d'autenticació real des de Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Si està autenticat mostrem les rutes filles, si no, al login
  return isAuthenticated ? <Outlet /> : <LoginPage />;
}

export default RequireAuth;
