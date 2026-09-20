import { useEffect, useRef, useState } from 'react';

interface UseInViewAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to trigger Tailwind CSS fade-in slide-up entrance animation
 * when an element enters the viewport.
 *
 * Returns a ref to attach to the container element and a CSS class string
 * containing pure Tailwind utility classes:
 * - When in view: 'opacity-100 translate-y-0'
 * - When before view: 'opacity-0 translate-y-8'
 * - Transition: 'transition-all duration-700 ease-out will-change-[opacity,transform]'
 */
export function useInViewAnimation<T extends HTMLElement = HTMLElement>({
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true,
}: UseInViewAnimationOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Safety fallback: if IntersectionObserver is unavailable or doesn't trigger
    const fallbackTimer = setTimeout(() => {
      setIsInView(true);
    }, 800);

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return () => clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          clearTimeout(fallbackTimer);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  const animationClasses = `transition-all duration-700 ease-out will-change-[opacity,transform] ${
    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
  }`;

  return { ref, isInView, animationClasses };
}
