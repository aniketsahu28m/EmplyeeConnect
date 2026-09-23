// EmployeeConnect mark: a person linked to two colleagues.
// Drawn as SVG so it stays crisp at any size and works in light and dark mode.
const Logo = ({ size = 'medium', className = '', withText = false }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const mark = (
    <svg
      viewBox="0 0 32 32"
      className={`${sizeClasses[size] ?? ''} ${withText ? '' : className} shrink-0`}
      role="img"
      aria-label="EmployeeConnect"
    >
      <rect width="32" height="32" rx="6" className="fill-blue-600" />
      <circle cx="12" cy="12" r="4" fill="white" />
      <path d="M5.5 25c0-4 2.9-6.8 6.5-6.8s6.5 2.8 6.5 6.8z" fill="white" />
      <path d="M16.5 13.5l6-3.5M16.5 15.5l6 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="24" cy="9.5" r="2.2" fill="white" />
      <circle cx="24" cy="19.5" r="2.2" fill="white" />
    </svg>
  );

  if (!withText) return mark;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {mark}
      <span className="text-[15px] font-semibold tracking-tight text-gray-900">EmployeeConnect</span>
    </span>
  );
};

export default Logo;
