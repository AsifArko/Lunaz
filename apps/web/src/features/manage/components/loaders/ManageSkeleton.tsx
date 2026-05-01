import type { HTMLAttributes } from 'react';

export interface ManageSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width - e.g. '100%', '4rem', '60%' */
  width?: string | number;
  /** Height - e.g. '1rem', '40px' */
  height?: string | number;
  /** Shape: text (rounded), circular, rectangular */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Optional extra class names */
  className?: string;
}

/**
 * Professional skeleton with subtle shimmer animation.
 * Preserves layout - use in place of content, not as overlay.
 */
export function ManageSkeleton({
  width,
  height,
  variant = 'text',
  className = '',
  style,
  ...props
}: ManageSkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const baseStyle: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height:
      height ?? (variant === 'text' ? '1em' : variant === 'circular' ? (width ?? '40px') : '100px'),
  };

  return (
    <div
      className={`manage-skeleton ${variants[variant]} ${className}`}
      style={{ ...baseStyle, ...style }}
      aria-hidden
      {...props}
    />
  );
}
