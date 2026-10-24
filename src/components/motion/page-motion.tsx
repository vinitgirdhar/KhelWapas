'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Progressive enhancement: no scroll hijacking, and cleanup on navigation/media changes. */
export default function PageMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  // Give navigation immediate feedback while Next streams an uncached route.
  // No exit animation, timeout or overlay is allowed to hold navigation back.
  useEffect(() => {
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const start = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
      const destination = new URL(anchor.href, location.href);
      if (destination.origin !== location.origin || destination.pathname === location.pathname) return;
      setPendingPath(destination.pathname);
      clearTimeout(fallback);
      fallback = setTimeout(() => setPendingPath(null), 10000);
    };
    document.addEventListener('click', start, true);
    return () => { document.removeEventListener('click', start, true); clearTimeout(fallback); };
  }, []);
  useEffect(() => { setPendingPath(null); }, [pathname]);
  useEffect(() => {
    const navigated = previousPath.current !== pathname;
    previousPath.current = pathname;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    if (!navigated || media.matches) return;
    const content = root.current?.querySelector('main');
    if (!content) return;
    const animation = content.animate(
      [{ opacity: .82, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' },
    );
    const stop = () => { if (media.matches) animation.cancel(); };
    media.addEventListener('change', stop);
    return () => { animation.cancel(); media.removeEventListener('change', stop); };
  }, [pathname]);
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
      const context = gsap.context(() => {
        const hero = root.current?.querySelector<HTMLElement>('[data-hero]');
        if (hero) {
          gsap.fromTo('[data-hero-background]', { yPercent: -3, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } });
          const orb = gsap.to('.hero-orb', { x: 45, y: 30, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
          ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: self => { if (self.isActive) orb.play(); else orb.pause(); } });
        }
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, [pathname]);
  return <div ref={root} className="contents">
    {pendingPath && pendingPath !== pathname && <div role="status" aria-label="Opening page" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-accent/15"><div className="h-full w-2/3 bg-accent motion-safe:animate-pulse" /><span className="sr-only">Opening page…</span></div>}
    {children}
  </div>;
}
