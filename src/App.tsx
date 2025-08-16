
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { ContactManager } from '@/components/ContactManager';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <ContactManager />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
