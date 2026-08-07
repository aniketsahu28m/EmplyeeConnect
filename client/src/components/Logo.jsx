import React from 'react';

const Logo = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <img
      src="/logo.png"
      alt="EmployeeConnect Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo; 