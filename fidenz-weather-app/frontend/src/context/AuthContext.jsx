import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
