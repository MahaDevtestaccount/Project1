import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Auth />;
}

export default App;
