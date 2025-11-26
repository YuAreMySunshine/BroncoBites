import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...', onClear, className = '' }: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={`search-bar ${className}`} style={{ position: 'relative', width: '100%' }}>
      <Search
        size={20}
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-tertiary)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: '48px', paddingRight: value ? '48px' : '16px' }}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
