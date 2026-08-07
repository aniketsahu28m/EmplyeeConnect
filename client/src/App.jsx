import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Clients from './pages/Clients';
import Offices from './pages/Offices';
import Payroll from './pages/Payroll';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import UserRoles from './pages/UserRoles';
import Vendors from './pages/Vendors';
import TeamCollaboration from './pages/TeamCollaboration';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import SignUp from './pages/SignUp';

// Basic authenticated route
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Role-based route protection
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* Admin-only routes */}
            <Route 
              path="employees" 
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <Employees />
                </RoleRoute>
              } 
            />
            <Route 
              path="offices" 
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <Offices />
                </RoleRoute>
              } 
            />
            <Route 
              path="payroll" 
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <Payroll />
                </RoleRoute>
              } 
            />
            <Route 
              path="clients" 
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <Clients />
                </RoleRoute>
              } 
            />
            <Route 
              path="vendors" 
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <Vendors />
                </RoleRoute>
              } 
            />
            <Route 
              path="user-roles" 
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <UserRoles />
                </RoleRoute>
              } 
            />
            
            {/* Manager and Admin routes */}
            <Route 
              path="projects" 
              element={
                <RoleRoute allowedRoles={['Admin', 'Manager']}>
                  <Projects />
                </RoleRoute>
              } 
            />
            <Route 
              path="attendance" 
              element={
                <RoleRoute allowedRoles={['Admin', 'Manager']}>
                  <Attendance />
                </RoleRoute>
              } 
            />
            
            {/* Routes for all roles */}
            <Route path="tasks" element={<Tasks />} />
            <Route path="team-collaboration" element={<TeamCollaboration />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
