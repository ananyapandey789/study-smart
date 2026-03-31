import { useAuth } from '@/context/AuthContext';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';

const Index = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <AuthPage />;
};

export default Index;
