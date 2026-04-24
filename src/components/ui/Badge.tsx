interface BadgeProps {
  children: React.ReactNode;
  variant?: 'red' | 'gray' | 'green' | 'yellow' | 'blue' | 'purple';
  className?: string;
}

const variants = {
  red: 'bg-[#FF0000] text-black',
  gray: 'bg-[#1a1a1a] text-[#888888]',
  green: 'bg-green-900 text-green-400',
  yellow: 'bg-yellow-900 text-yellow-400',
  blue: 'bg-blue-900 text-blue-400',
  purple: 'bg-purple-900 text-purple-400',
};

export function Badge({
  children,
  variant = 'red',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-mono font-semibold uppercase tracking-wider rounded-sm ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
