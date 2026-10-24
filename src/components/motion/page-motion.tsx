'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Progressive enhancement: no scroll hijacking, and cleanup on navigation/media changes. */
export default function PageMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.fromTo('[data-hero-reveal]', { y: 28, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity',
        });
        gsap.utils.toArray<HTMLElement>('[data-reveal], main section:not([data-hero])').forEach((el) => {
          gsap.fromTo(el, { y: 24, opacity: 0.65 }, {
            y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', clearProps: 'transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 94%', once: true },
          });
        });
      }, root);
      return () => context.revert();
    });
    media.add('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const listeners: (() => void)[] = [];
      const context = gsap.context(() => {
        const hero = root.current?.querySelector<HTMLElement>('[data-hero]');
        if (hero) {
          gsap.fromTo('[data-hero-background]', { yPercent: -3, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } });
          const orb = gsap.to('.hero-orb', { x: 45, y: 30, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
          ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: self => { if (self.isActive) orb.play(); else orb.pause(); } });
        }
        root.current?.querySelectorAll<HTMLElement>('.hero-glass').forEach(panel => {
          const x = gsap.quickTo(panel, 'rotateX', { duration: .5, ease: 'power2.out' });
          const y = gsap.quickTo(panel, 'rotateY', { duration: .5, ease: 'power2.out' });
          gsap.set(panel, { transformPerspective: 1000 });
          const move = (event: PointerEvent) => {
            const box = panel.getBoundingClientRect();
            x((.5 - (event.clientY - box.top) / box.height) * 5);
            y(((event.clientX - box.left) / box.width - .5) * 5);
          };
          const reset = () => { x(0); y(0); };
          panel.addEventListener('pointermove', move);
          panel.addEventListener('pointerleave', reset);
          listeners.push(() => { panel.removeEventListener('pointermove', move); panel.removeEventListener('pointerleave', reset); });
        });
      }, root);
      return () => { listeners.forEach(remove => remove()); context.revert(); };
    });
    return () => media.revert();
  }, [pathname]);
  return <div ref={root} className="contents">{children}</div>;
}
