import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  // Se l'utente non è autenticato, reindirizza a /login
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
