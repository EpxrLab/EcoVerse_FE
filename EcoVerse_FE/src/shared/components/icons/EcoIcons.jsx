import React from 'react';

export const LeafIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3C12 3 4 7 4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14C20 7 12 3 12 3Z" fill="currentColor" opacity="0.2"/>
    <path d="M12 3C12 3 4 7 4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14C20 7 12 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12C12 12 15 9.5 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16C12 16 9 13.5 6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const RecycleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 12L4.5 7.5H9.5L12 3L14.5 7.5H19.5L16.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 12L19.5 16.5H14.5L12 21L9.5 16.5H4.5L7.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PlasticBinIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="32" height="32" rx="4" fill="hsl(210, 85%, 55%)" />
    <rect x="10" y="6" width="28" height="8" rx="2" fill="hsl(210, 85%, 45%)" />
    <text x="24" y="34" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">♻️</text>
  </svg>
);

export const PaperBinIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="32" height="32" rx="4" fill="hsl(145, 60%, 45%)" />
    <rect x="10" y="6" width="28" height="8" rx="2" fill="hsl(145, 60%, 35%)" />
    <text x="24" y="34" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">📄</text>
  </svg>
);

export const OrganicBinIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="32" height="32" rx="4" fill="hsl(25, 60%, 40%)" />
    <rect x="10" y="6" width="28" height="8" rx="2" fill="hsl(25, 60%, 30%)" />
    <text x="24" y="34" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">🍂</text>
  </svg>
);

export const OthersBinIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="32" height="32" rx="4" fill="hsl(220, 10%, 35%)" />
    <rect x="10" y="6" width="28" height="8" rx="2" fill="hsl(220, 10%, 25%)" />
    <text x="24" y="34" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">🗑️</text>
  </svg>
);

export const CoinIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="hsl(45, 90%, 55%)" />
    <circle cx="12" cy="12" r="7" fill="hsl(45, 90%, 65%)" />
    <text x="12" y="16" textAnchor="middle" fill="hsl(45, 90%, 30%)" fontSize="10" fontWeight="bold">$</text>
  </svg>
);

export const TrophyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 4H17V10C17 13.3137 14.3137 16 11 16H13C9.68629 16 7 13.3137 7 10V4Z" fill="hsl(45, 90%, 55%)" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 8H19C20.1046 8 21 8.89543 21 10C21 11.1046 20.1046 12 19 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 8H5C3.89543 8 3 8.89543 3 10C3 11.1046 3.89543 12 5 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const StarIcon = ({ className = "w-6 h-6", filled = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? "hsl(45, 90%, 55%)" : "none"} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EarthIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="hsl(200, 80%, 55%)" opacity="0.3"/>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 12H22" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);