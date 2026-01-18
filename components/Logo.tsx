
import React from 'react';

export const Logo: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 40 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="48" fill="white" fillOpacity="0.2" />
    <path 
      d="M50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50C80 33.4315 66.5685 20 50 20Z" 
      stroke="white" 
      strokeWidth="6" 
      strokeLinecap="round" 
    />
    <path 
      d="M50 35V65M35 50H65" 
      stroke="white" 
      strokeWidth="8" 
      strokeLinecap="round" 
    />
    <path 
      d="M75 25L85 15" 
      stroke="white" 
      strokeWidth="4" 
      strokeLinecap="round" 
    />
    <circle cx="75" cy="25" r="4" fill="white" />
  </svg>
);
