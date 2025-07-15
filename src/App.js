import './App.css';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import Layout from './Layout';

// ProtectedRoute component to restrict access to authenticated users
function ProtectedRoute({ children, requiredRole }) { 
  const isAuthenticated = !!localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');
  const userPass = localStorage.getItem('userPass');
  const navigate = useNavigate();

    useEffect(() => {
    const validateSession = async () => {
      if (!isAuthenticated || !userEmail) {
        console.log('No auth token or userId, logging out:', { isAuthenticated, userEmail });
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
       localStorage.removeItem('userPass');
       localStorage.removeItem('userEmail');
        navigate('/');
        return;
      }

      if (userRole === 'admin') {
        return;
      }

      try {
        const response = await fetch('https://inventory-management-mauve-seven.vercel.app/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        const users = data.users || [];
        const currentUser = users.find(user => user.email === userEmail && user.password === userPass);

        if (!currentUser) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userPass');
          localStorage.removeItem('userEmail');
          navigate('/');
          return;
        }

        if (currentUser.role !== userRole) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userPass');
          localStorage.removeItem('userEmail');
          navigate('/');
        }
      } catch (err) {
        console.error('Error validating session:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userPass');
        localStorage.removeItem('userEmail');
        navigate('/');
      }
    };

    validateSession();
  }, [isAuthenticated, userEmail, userPass, userRole, navigate]);

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
           <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
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