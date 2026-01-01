import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BottomNavigation } from './components/ui/BottomNavigation';
import { TodayScreen } from './pages/TodayScreen';
import { LogSpendScreen } from './pages/LogSpendScreen';
import { WishlistScreen } from './pages/WishlistScreen';
import { ReportsScreen } from './pages/ReportsScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { LoginScreen } from './pages/LoginScreen';
import { IncomeScreen } from './pages/IncomeScreen';
import { ImpulsesScreen } from './pages/ImpulsesScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  // Hide bottom nav on specific screens
  const hideNavPaths = ['/login'];
  const showNav = isAuthenticated && !hideNavPaths.includes(location.pathname);
  
  return <>
      <div className="max-w-md mx-auto bg-neutral-50 min-h-screen shadow-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/" element={<ProtectedRoute><TodayScreen /></ProtectedRoute>} />
            <Route path="/today" element={<ProtectedRoute><TodayScreen /></ProtectedRoute>} />
            <Route path="/spend" element={<ProtectedRoute><LogSpendScreen /></ProtectedRoute>} />
            <Route path="/income" element={<ProtectedRoute><IncomeScreen /></ProtectedRoute>} />
            <Route path="/impulses" element={<ProtectedRoute><ImpulsesScreen /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistScreen /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsScreen /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>

        {showNav && <BottomNavigation />}
      </div>
    </>;
}

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}