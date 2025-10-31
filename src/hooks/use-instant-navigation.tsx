'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

interface NavigationOptions {
  /**
   * Prevent navigation if already navigating
   * @default true
   */
  preventDuplicates?: boolean;
  
  /**
   * Delay before navigation (ms) - useful for animations
   * @default 0
   */
  delay?: number;
  
  /**
   * Callback before navigation
   */
  onBeforeNavigate?: () => void;
  
  /**
   * Callback after navigation
   */
  onAfterNavigate?: () => void;
}

/**
 * Hook for instant, optimized navigation with debouncing and callbacks
 * Prevents multiple rapid navigations and provides smooth UX
 */
export function useInstantNavigation() {
  const router = useRouter();
  const isNavigatingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useCallback((
    path: string,
    options: NavigationOptions = {}
  ) => {
    const {
      preventDuplicates = true,
      delay = 0,
      onBeforeNavigate,
      onAfterNavigate,
    } = options;

    // Prevent duplicate navigation
    if (preventDuplicates && isNavigatingRef.current) {
      return;
    }

    // Clear any pending navigation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Mark as navigating
    isNavigatingRef.current = true;

    // Call before callback
    if (onBeforeNavigate) {
      onBeforeNavigate();
    }

    // Navigate with optional delay
    timeoutRef.current = setTimeout(() => {
      router.push(path);
      
      // Reset navigating flag after a short delay
      setTimeout(() => {
        isNavigatingRef.current = false;
        if (onAfterNavigate) {
          onAfterNavigate();
        }
      }, 300);
    }, delay);
  }, [router]);

  const replace = useCallback((
    path: string,
    options: NavigationOptions = {}
  ) => {
    const {
      preventDuplicates = true,
      delay = 0,
      onBeforeNavigate,
      onAfterNavigate,
    } = options;

    if (preventDuplicates && isNavigatingRef.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    isNavigatingRef.current = true;

    if (onBeforeNavigate) {
      onBeforeNavigate();
    }

    timeoutRef.current = setTimeout(() => {
      router.replace(path);
      
      setTimeout(() => {
        isNavigatingRef.current = false;
        if (onAfterNavigate) {
          onAfterNavigate();
        }
      }, 300);
    }, delay);
  }, [router]);

  const back = useCallback(() => {
    if (isNavigatingRef.current) {
      return;
    }
    
    isNavigatingRef.current = true;
    router.back();
    
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [router]);

  return {
    navigate,
    replace,
    back,
    isNavigating: isNavigatingRef.current,
  };
}

/**
 * Example usage:
 * 
 * const { navigate, isNavigating } = useInstantNavigation();
 * 
 * // Simple navigation
 * navigate('/products/123');
 * 
 * // With options
 * navigate('/checkout', {
 *   delay: 150, // Wait for animation
 *   onBeforeNavigate: () => console.log('Navigating...'),
 *   onAfterNavigate: () => console.log('Navigation complete'),
 * });
 * 
 * // In a button
 * <button 
 *   onClick={() => navigate('/cart')}
 *   disabled={isNavigating}
 * >
 *   Go to Cart
 * </button>
 */
