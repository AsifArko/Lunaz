import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  ...props
}: SkeletonProps) {
  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // CSS wave animation would need keyframes
    none: '',
  };
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height:
      height ?? (variant === 'text' ? '1em' : variant === 'circular' ? (width ?? '40px') : '100px'),
  };

  const cn = ['bg-gray-200', animations[animation], variants[variant], className]
    .filter(Boolean)
    .join(' ');

  return <div className={cn} style={style} {...props} />;
}

/** Pre-built skeleton for text lines. */
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          height="0.875rem"
        />
      ))}
    </div>
  );
}

/** Pre-built skeleton for card. */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <Skeleton variant="rectangular" height={160} className="mb-4" />
      <Skeleton variant="text" height="1.25rem" width="70%" className="mb-2" />
      <SkeletonText lines={2} />
    </div>
  );
}
