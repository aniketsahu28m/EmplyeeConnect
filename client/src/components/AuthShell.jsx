import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

// Plain frame shared by the Login and Sign Up pages.
const AuthShell = ({ children, footer }) => (
  <div className="flex min-h-screen flex-col bg-canvas">
    <header className="flex h-14 items-center justify-between px-5 sm:px-8">
      <Logo size="small" withText />
      <ThemeToggle />
    </header>

    <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-10 sm:pt-20">
      <div className="w-full max-w-sm">
        {children}
        {footer && <div className="mt-6 text-center text-[13px] text-gray-500">{footer}</div>}
      </div>
    </main>

    <footer className="px-5 py-4 text-center text-xs text-gray-400 sm:px-8">
      EmployeeConnect · a DBMS project by Aniket Sahu
    </footer>
  </div>
);

export default AuthShell;
