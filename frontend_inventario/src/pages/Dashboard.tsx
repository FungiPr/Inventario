import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  // Obtener usuario del store
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>¡Bienvenido al sistema de inventario!</p>
      
      {user && (
        <div>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Nombre:</strong> {user.displayName || 'Sin nombre'}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
      )}

      <button 
        onClick={handleLogout}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

export default Dashboard;