import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  unit?: string;
}

export function Input({ label, error, unit, className = '', ...props }: InputProps) {
  const inputClasses = ['form-input', error && 'form-input--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={props.id}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input className={inputClasses} {...props} />
        {unit && (
          <span
            style={{
              position: 'absolute',
              right: '16px',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)',
              pointerEvents: 'none',
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
