// components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthContext(); // Ottieni lo stato dell'utente

  // Se l'utente non è loggato, reindirizza alla pagina di login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se l'utente è loggato, renderizza i figli (il componente protetto)
  return children;
};

export default ProtectedRoute;
