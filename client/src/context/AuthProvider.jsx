import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import api from "../api/axiosConfig";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    const data = await api.post("/auth/login", {
      email,
      password
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  // Signup
  const signup = async (username, email, password) => {
    const data = await api.post("/auth/register", {
      username,
      email,
      password
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({ username, email }));
    setUser({ username, email });
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
