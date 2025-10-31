'use client';

import * as React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OptimizedButtonProps extends ButtonProps {
  /**
   * Show visual feedback on click
   * @default true
   */
  showFeedback?: boolean;
  
  /**
   * Prevent double clicks within this duration (ms)
   * @default 300
   */
  debounceDelay?: number;
}

/**
 * Optimized Button component with instant click feedback and double-click prevention
 * Provides better UX by giving immediate visual response and preventing accidental double-clicks
 */
export const OptimizedButton = React.forwardRef<HTMLButtonElement, OptimizedButtonProps>(
  ({ 
    showFeedback = true, 
    debounceDelay = 300,
    onClick, 
    className,
    disabled,
    children,
    ...props 
  }, ref) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [showClickFeedback, setShowClickFeedback] = React.useState(false);
    const processingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const feedbackTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Cleanup timeouts on unmount
    React.useEffect(() => {
      return () => {
        if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      };
    }, []);

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent if already processing (debounce)
      if (isProcessing) {
        e.preventDefault();
        return;
      }

      // Show instant visual feedback
      if (showFeedback) {
        setShowClickFeedback(true);
        feedbackTimeoutRef.current = setTimeout(() => {
          setShowClickFeedback(false);
        }, 100);
      }

      // Set processing state
      setIsProcessing(true);
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, debounceDelay);

      // Call original onClick handler
      if (onClick) {
        onClick(e);
      }
    }, [isProcessing, showFeedback, debounceDelay, onClick]);

    return (
      <Button
        ref={ref}
        className={cn(
          'transition-all duration-100',
          showClickFeedback && 'scale-[0.97]',
          className
        )}
        onClick={handleClick}
        disabled={disabled || isProcessing}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

OptimizedButton.displayName = 'OptimizedButton';
