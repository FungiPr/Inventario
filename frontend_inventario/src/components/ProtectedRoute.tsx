import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Props: children = componente hijo que queremos proteger
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Verificar si el usuario está autenticado
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Si NO está autenticado → Redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si SÍ está autenticado → Mostrar el componente hijo
  return <>{children}</>;
}

export default ProtectedRoute;