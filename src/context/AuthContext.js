import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, getCurrentUser } from "../api/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access"));
  const [user, setUser] = useState(() => {
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("user"); // opcional: limpialo si está corrupto
      return null;
    }
  });

  useEffect(() => {
    if (accessToken) {
      getCurrentUser()
        .then((data) => setUser(data))
        .catch(() => logout());
    }
  }, [accessToken]);

  const login = async (username, password) => {
    const user = await loginUser(username, password);

    // Ya se guardó el token en localStorage dentro de loginUser
    const access = localStorage.getItem("access");

    if (access) {
      setAccessToken(access); // ⬅️ Esto activa el useEffect que llama getCurrentUser()
    } else {
      throw new Error("Token no guardado");
    }

    setUser(user); // ⬅️ También puedes setearlo directamente si loginUser ya lo trajo
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
