
interface ProgressProps {
  value: number;
  max: number;
  variant?: 'calories' | 'protein' | 'carbs' | 'fats' | 'success' | 'primary' | 'over';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function Progress({ value, max, variant = 'primary', size = 'default', className = '' }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max;
  const effectiveVariant = isOver ? 'over' : variant;

  const sizeClass = size !== 'default' ? `progress-${size}` : '';
  const fillClass = `progress__fill--${effectiveVariant}`;

  const containerClasses = ['progress', sizeClass, className].filter(Boolean).join(' ');
  const fillClasses = ['progress__fill', fillClass].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={fillClasses} style={{ width: `${percentage}%` }} />
    </div>
  );
}
