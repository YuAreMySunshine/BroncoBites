import React from 'react';

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Chip({ active = false, onClick, children, className = '' }: ChipProps) {
  const classes = ['chip', active && 'chip--active', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} onClick={onClick} type="button">
      {children}
    </button>
  );
}
