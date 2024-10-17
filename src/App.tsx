import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import MessageSystem from './components/MessageSystem';
import { AuthProvider, useAuth } from './context/AuthContext';
import { updateUserStatus, initializeNotifications, listenForNotifications } from './utils/firebase';

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
}> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      updateUserStatus(user.uid, true);
      initializeNotifications(user.uid);
      const unsubscribe = listenForNotifications((payload) => {
        // Handle incoming notifications here
        console.log('Received notification:', payload);
        // You can show a toast notification or update the UI here
      });

      window.addEventListener('beforeunload', () => updateUserStatus(user.uid, false));
      return () => {
        updateUserStatus(user.uid, false);
        window.removeEventListener('beforeunload', () => updateUserStatus(user.uid, false));
        unsubscribe();
      };
    }
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages/:receiverId"
            element={
              <ProtectedRoute>
                <MessageSystem />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

const AppWithAuth: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithAuth;