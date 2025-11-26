import React from 'react';

interface CardProps {
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ interactive = false, children, className = '', onClick }: CardProps) {
  const classes = ['card', interactive && 'card-interactive', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
