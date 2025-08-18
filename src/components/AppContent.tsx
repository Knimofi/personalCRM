
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { ContactManager } from '@/components/ContactManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load the SettingsPage to prevent circular dependencies
const SettingsPage = React.lazy(() => 
  import('@/components/SettingsPage').then(module => ({ default: module.SettingsPage }))
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-gray-500">Loading...</div>
  </div>
);

export const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<ContactManager />} />
        <Route 
          path="/settings" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <SettingsPage />
            </Suspense>
          } 
        />
      </Routes>
    </ErrorBoundary>
  );
};
