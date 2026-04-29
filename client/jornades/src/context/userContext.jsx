import { createContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectToken } from "../features/auth/authSelectors";
import { setUser as setUserAction, setToken as setTokenAction } from "../features/auth/authSlice";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const dispatch = useDispatch();

  const setUser = (val) => dispatch(setUserAction(val));
  const setToken = (val) => dispatch(setTokenAction(val));

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};
