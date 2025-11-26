import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'default' ? `btn-${size}` : '';

  const classes = ['btn', variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
