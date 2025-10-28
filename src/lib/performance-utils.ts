/**
 * Performance optimization utilities for improving navigation and interaction responsiveness
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once in a specified time period
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Prefetch a route to improve navigation speed
 * @param href The route to prefetch
 */
export function prefetchRoute(href: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * Optimize images for faster loading
 * @param src Image source
 * @returns Optimized image parameters
 */
export function getOptimizedImageProps(src: string) {
  return {
    loading: 'lazy' as const,
    decoding: 'async' as const,
    fetchPriority: 'auto' as const,
  };
}

/**
 * Create a fast click handler that prevents double-clicks
 * @param onClick The original click handler
 * @param delay Delay in milliseconds to prevent double clicks (default: 500ms)
 * @returns Optimized click handler
 */
export function createFastClickHandler<T extends (...args: any[]) => any>(
  onClick: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  let isProcessing = false;
  
  return function(...args: Parameters<T>) {
    if (isProcessing) return;
    
    isProcessing = true;
    onClick(...args);
    
    setTimeout(() => {
      isProcessing = false;
    }, delay);
  };
}

/**
 * Optimized navigation handler with instant feedback
 * @param router Next.js router instance
 * @param path Path to navigate to
 * @param onStart Optional callback when navigation starts
 */
export function optimizedNavigate(
  router: { push: (path: string) => Promise<boolean> },
  path: string,
  onStart?: () => void
) {
  // Provide instant feedback
  if (onStart) onStart();
  
  // Prefetch before navigating
  if (typeof window !== 'undefined') {
    const link = document.querySelector(`a[href="${path}"]`);
    if (link) {
      link.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    }
  }
  
  // Navigate with minimal delay
  requestAnimationFrame(() => {
    router.push(path);
  });
}

/**
 * Create an optimized event handler that provides instant visual feedback
 * @param handler The event handler function
 * @param element The element to add feedback to (optional)
 * @returns Optimized handler with feedback
 */
export function withInstantFeedback<T extends HTMLElement>(
  handler: (e: React.MouseEvent<T>) => void | Promise<void>,
  feedbackClass: string = 'opacity-70'
): (e: React.MouseEvent<T>) => void {
  return async (e: React.MouseEvent<T>) => {
    const target = e.currentTarget;
    
    // Add instant visual feedback
    target.classList.add(feedbackClass);
    
    try {
      await handler(e);
    } finally {
      // Remove feedback after a short delay
      setTimeout(() => {
        target.classList.remove(feedbackClass);
      }, 150);
    }
  };
}

/**
 * Preload critical resources
 * @param resources Array of resource URLs to preload
 */
export function preloadResources(resources: string[]) {
  if (typeof window === 'undefined') return;
  
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    // Determine resource type from extension
    if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Measure and log performance metrics
 */
export function measurePageLoadTime() {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;
    
    console.log('Performance Metrics:');
    console.log(`Page Load Time: ${pageLoadTime}ms`);
    console.log(`Connect Time: ${connectTime}ms`);
    console.log(`Render Time: ${renderTime}ms`);
  });
}
