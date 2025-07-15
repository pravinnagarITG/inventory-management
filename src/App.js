import './App.css';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Layout from './Layout';

// ProtectedRoute component to restrict access to authenticated users
function ProtectedRoute({ children, requiredRole }) { 
  const isAuthenticated = !!localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

   if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ;
}

// RedirectAuthenticated component to prevent access to login if authenticated
function RedirectAuthenticated({ children }) {
  const isAuthenticated = !!localStorage.getItem('authToken');
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <Router>
        <Routes>
          {/* Login route: Only accessible if not authenticated */}
          <Route
            path="/"
            element={
              <RedirectAuthenticated>
                <div className="main-login-page">
                  <Login />
                </div>
              </RedirectAuthenticated>
            }
          />
          {/* Protected routes under Layout */}
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Redirect any unknown routes to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;