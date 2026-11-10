import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import api from "../api/axiosConfig";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount and sync on userUpdated event
  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    syncUser();
    window.addEventListener("userUpdated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("userUpdated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // Login
  const login = async (emailOrUsername, password) => {
    const data = await api.post("/auth/login", {
      emailOrUsername,
      password
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.user?.role) {
      localStorage.setItem("userRole", data.user.role);
    }
    setUser(data.user);
    window.dispatchEvent(new Event("userUpdated"));
    return data;
  };

  // Signup
  const signup = async (username, email, password, role = "player") => {
    const data = await api.post("/auth/register", {
      username,
      email,
      password,
      role
    });

    const userData = data.user || { username, email, role };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
