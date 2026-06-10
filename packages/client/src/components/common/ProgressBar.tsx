interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
  color?: 'primary' | 'secondary' | 'accent' | 'energy' | 'gem';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap = {
  primary: 'bg-gradient-to-r from-primary-400 to-primary-600',
  secondary: 'bg-gradient-to-r from-secondary-400 to-secondary-600',
  accent: 'bg-gradient-to-r from-accent-400 to-accent-600',
  energy: 'bg-gradient-to-r from-energy-400 to-energy-600',
  gem: 'bg-gradient-to-r from-gem-400 to-gem-600',
};

const sizeMap = {
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-6',
};

export default function ProgressBar({
  value,
  max,
  label,
  showPercent = false,
  color = 'primary',
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-semibold text-gray-600">{label}</span>}
          {showPercent && <span className="text-sm font-bold text-gray-500">{percent}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`${colorMap[color]} ${sizeMap[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        >
          {size === 'lg' && percent > 15 && (
            <span className="text-xs font-bold text-white px-2 leading-6 block text-center">
              {percent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}