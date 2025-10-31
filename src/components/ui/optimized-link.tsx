'use client';

import { forwardRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface OptimizedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  prefetch?: boolean;
  shallow?: boolean;
  scroll?: boolean;
  replace?: boolean;
  children: React.ReactNode;
  showFeedback?: boolean;
}

/**
 * Optimized Link component with instant click feedback and smart prefetching
 * Provides better UX by giving immediate visual feedback and preloading routes
 */
export const OptimizedLink = forwardRef<HTMLAnchorElement, OptimizedLinkProps>(
  ({ 
    href, 
    prefetch = true, 
    shallow = false, 
    scroll = true, 
    replace = false,
    children, 
    className,
    onClick,
    showFeedback = true,
    ...props 
  }, ref) => {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      // Prevent default only if we want custom handling
      if (onClick) {
        onClick(e);
      }

      if (!e.defaultPrevented) {
        // Show instant feedback
        if (showFeedback) {
          setIsNavigating(true);
          // Reset after navigation or timeout
          setTimeout(() => setIsNavigating(false), 300);
        }
      }
    }, [onClick, showFeedback]);

    return (
      <Link
        ref={ref}
        href={href}
        prefetch={prefetch}
        shallow={shallow}
        scroll={scroll}
        replace={replace}
        className={cn(
          'transition-all duration-100 active:scale-[0.98] active:opacity-90',
          showFeedback && isNavigating && 'opacity-80 scale-[0.99]',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

OptimizedLink.displayName = 'OptimizedLink';
