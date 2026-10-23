'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Progressive enhancement: content is readable before JS and with reduced motion. */
export default function PageMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.fromTo('[data-hero-reveal]', { y: 28, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: 'power3.out', clearProps: 'all',
        });
        gsap.utils.toArray<HTMLElement>('[data-reveal], main section:not([data-hero])').forEach((el) => {
          gsap.fromTo(el, { y: 24, opacity: 0.35 }, {
            y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', clearProps: 'all',
            scrollTrigger: { trigger: el, start: 'top 94%', once: true },
          });
        });
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, [pathname]);
  return <div ref={root} className="contents">{children}</div>;
}
