import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaProjectDiagram,
  FaTasks,
  FaClock,
  FaMoneyBillWave,
  FaUserTie,
  FaTruck,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaComments,
} from 'react-icons/fa';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Define navigation items by role
  const adminNavigation = [
    { name: 'Dashboard', href: '/', icon: FaHome },
    { name: 'Employees', href: '/employees', icon: FaUsers },
    { name: 'Offices', href: '/offices', icon: FaBuilding },
    { name: 'Projects', href: '/projects', icon: FaProjectDiagram },
    { name: 'Tasks', href: '/tasks', icon: FaTasks },
    { name: 'Attendance', href: '/attendance', icon: FaClock },
    { name: 'Payroll', href: '/payroll', icon: FaMoneyBillWave },
    { name: 'Clients', href: '/clients', icon: FaUserTie },
    { name: 'Vendors', href: '/vendors', icon: FaTruck },
    { name: 'Team Collaboration', href: '/team-collaboration', icon: FaComments },
    { name: 'User Roles', href: '/user-roles', icon: FaUsers },
  ];

  const managerNavigation = [
    { name: 'Dashboard', href: '/', icon: FaHome },
    { name: 'Projects', href: '/projects', icon: FaProjectDiagram },
    { name: 'Tasks', href: '/tasks', icon: FaTasks },
    { name: 'Attendance', href: '/attendance', icon: FaClock },
    { name: 'Team Collaboration', href: '/team-collaboration', icon: FaComments },
  ];

  const employeeNavigation = [
    { name: 'Dashboard', href: '/', icon: FaHome },
    { name: 'Tasks', href: '/tasks', icon: FaTasks },
    { name: 'Team Collaboration', href: '/team-collaboration', icon: FaComments },
  ];

  // Set navigation based on user role
  let navigation = employeeNavigation;
  if (user?.role === 'Admin') {
    navigation = adminNavigation;
  } else if (user?.role === 'Manager') {
    navigation = managerNavigation;
  }

  return (
    <div className="min-h-screen w-full bg-white flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-gray-800">EmployeeConnect</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-50 text-gray-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                  {user?.first_name?.[0]}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs font-medium text-blue-600">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-h-screen ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        } transition-margin duration-300 ease-in-out w-full`}
      >
        <header className="bg-white shadow-sm w-full">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 bg-white w-full">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 