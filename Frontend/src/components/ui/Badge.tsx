import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'vegetarian' | 'high-protein' | 'budget' | 'allergen' | 'open' | 'closing-soon' | 'closed';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'default', children, className = '' }: BadgeProps) {
  const variantClass = `badge-${variant}`;
  const sizeClass = size !== 'default' ? `badge-${size}` : '';

  const classes = ['badge', variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
