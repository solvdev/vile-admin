import { Navigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';

const ProtectedRouteByRole = ({ allowedRoles = [], children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  const userRoles = user?.roles || [];

  const isAllowed = allowedRoles.some(role =>
    userRoles.includes(role) || (role === 'Administrador' && user.is_superuser)
  );

  return isAllowed ? children : <Navigate to="/unauthorized" />;
};

export default ProtectedRouteByRole;
