import { createContext, useReducer, useCallback, useEffect } from "react";
import UserReducer from "../reducers/UserReducer";
import { jwtDecode } from "jwt-decode";
import cookie from "react-cookies";

export const MyUserContext = createContext();
export const MyDispatchContext = createContext();

export const UserProvider = ({ children }) => {
  const initUser = () => {
    try {
      const token = cookie.load("token");
      const storedUser = localStorage.getItem("user");

      if (!token) {
        localStorage.removeItem("user");
        return null;
      }

      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        cookie.remove("token", { path: "/" });
        localStorage.removeItem("user");
        return null;
      }

      if (storedUser) {
        return JSON.parse(storedUser);
      }

      return decoded;
    } catch (e) {
      cookie.remove("token", { path: "/" });
      localStorage.removeItem("user");
      return null;
    }
  };

  const [user, dispatch] = useReducer(UserReducer, null, initUser);

  const setLogoutTimer = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      const delay = decoded.exp * 1000 - Date.now();
      if (delay > 0) {
        setTimeout(() => dispatch({ type: "logout" }), delay);
      }
    } catch (e) {
      console.error("Invalid token", e);
    }
  }, []);

  useEffect(() => {
    const token = cookie.load("token");
    if (token) setLogoutTimer(token);
  }, [user, setLogoutTimer]);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        {children}
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
};
