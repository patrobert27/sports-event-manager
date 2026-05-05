import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../features/auth/authSelectors";

/**
 * Middleware de ruta per a React Router.
 * Comprova autenticació i opcionalment rols permesos.
 */
function RequireAuth({ allowedRoles }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // 1. Si no està autenticat, enviem al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si s'han especificat rols i l'usuari no en té cap, redirigim a la pàgina d'accés denegat
  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role.name))) {
    return <Navigate to="/403" replace />;
  }

  // 3. Si tot és correcte, renderitzem la ruta demanada
  return <Outlet />;
}

export default RequireAuth;
