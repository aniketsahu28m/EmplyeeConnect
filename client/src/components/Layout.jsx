import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import {
  LuLayoutDashboard,
  LuUsers,
  LuBuilding2,
  LuFolderKanban,
  LuListChecks,
  LuClock,
  LuWallet,
  LuBriefcase,
  LuTruck,
  LuMessageSquare,
  LuShieldCheck,
  LuLogOut,
  LuMenu,
  LuX,
} from 'react-icons/lu';

const ALL = ['Admin', 'Manager', 'Employee'];

// Sidebar sections. Each link lists the roles that can open it (matches App.jsx routes).
const SECTIONS = [
  {
    items: [{ name: 'Dashboard', href: '/', icon: LuLayoutDashboard, roles: ALL }],
  },
  {
    title: 'Work',
    items: [
      { name: 'Projects', href: '/projects', icon: LuFolderKanban, roles: ['Admin', 'Manager'] },
      { name: 'Tasks', href: '/tasks', icon: LuListChecks, roles: ALL },
      { name: 'Team', href: '/team-collaboration', icon: LuMessageSquare, roles: ALL },
    ],
  },
  {
    title: 'People',
    items: [
      { name: 'Employees', href: '/employees', icon: LuUsers, roles: ['Admin'] },
      { name: 'Attendance', href: '/attendance', icon: LuClock, roles: ['Admin', 'Manager'] },
      { name: 'Payroll', href: '/payroll', icon: LuWallet, roles: ['Admin'] },
      { name: 'User roles', href: '/user-roles', icon: LuShieldCheck, roles: ['Admin'] },
    ],
  },
  {
    title: 'Business',
    items: [
      { name: 'Offices', href: '/offices', icon: LuBuilding2, roles: ['Admin'] },
      { name: 'Clients', href: '/clients', icon: LuBriefcase, roles: ['Admin'] },
      { name: 'Vendors', href: '/vendors', icon: LuTruck, roles: ['Admin'] },
    ],
  },
];

const initials = (user) =>
  `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() || '?';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role ?? 'Employee';

  const sections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);

  const currentPage =
    sections.flatMap((s) => s.items).find((item) => item.href === location.pathname)?.name ??
    'Dashboard';

  // Close the mobile menu after navigating.
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-200 bg-canvas transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 bg-white' : '-translate-x-full'
        }`}
      >
        <div className="flex h-12 items-center justify-between px-4">
          <Logo size="small" withText />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
          {sections.map((section, i) => (
            <div key={section.title ?? i} className={i > 0 ? 'mt-5' : ''}>
              {section.title && (
                <p className="mb-1 px-2 text-xs font-medium text-gray-500">{section.title}</p>
              )}
              <div className="space-y-px">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      `flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors ${
                        isActive
                          ? 'bg-gray-200/70 font-medium text-gray-900'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-2">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-200 text-[11px] font-semibold text-gray-700">
              {initials(user)}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs text-gray-500">{role}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              title="Log out"
              aria-label="Log out"
            >
              <LuLogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
          <div className="flex h-12 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-2 text-[13px]">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="-ml-1.5 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
                aria-label="Open menu"
              >
                <LuMenu className="h-4 w-4" />
              </button>
              <span className="hidden text-gray-500 sm:inline">EmployeeConnect</span>
              <span className="hidden text-gray-300 sm:inline">/</span>
              <span className="font-medium text-gray-900">{currentPage}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
