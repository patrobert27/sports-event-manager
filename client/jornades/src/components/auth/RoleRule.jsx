import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSelectors";

/**
 * Component per restringir l'accés a elements de la UI segons el rol.
 * Si l'usuari no té un dels rols permesos, no renderitza res.
 */
export const RoleRule = ({ allowedRoles, children }) => {
  const user = useSelector(selectUser);
  
  // Si no hi ha usuari o el seu rol no està dins dels permesos, no mostrem res
  if (!user || !user.role || !allowedRoles.includes(user.role.name)) {
    return null;
  }
  
  return children;
};

export default RoleRule;
