'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Move } from 'lucide-react';
import type { GearSceneController } from './gear-scene';
import styles from './gear-showcase.module.css';

const sports = [
  { name: 'Cricket', line: 'Another innings awaits.' },
  { name: 'Badminton', line: 'Keep the rally alive.' },
  { name: 'Basketball', line: 'Back on the court.' },
] as const;

export default function GearShowcase() {
  const [sport, setSport] = useState(0);
  const [status, setStatus] = useState<'loading' | 'webgl' | 'fallback'>('loading');
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<GearSceneController | null>(null);
  const selectedSport = useRef(0);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    let disposed = false;
    let generation = 0;
    function synchronize() {
      const current = ++generation;
      controller.current?.dispose(); controller.current = null;
      if (!desktop.matches) { setStatus('loading'); return; }
      setStatus('loading');
      import('./gear-scene').then(({ createGearScene }) => {
        if (disposed || current !== generation || !host.current) return;
        try {
          controller.current = createGearScene(host.current, () => {
            if (!disposed && current === generation) setStatus('webgl');
          });
          controller.current.setSport(selectedSport.current);
        } catch {
          if (!disposed && current === generation) setStatus('fallback');
        }
      }).catch(() => { if (!disposed && current === generation) setStatus('fallback'); });
    }
    desktop.addEventListener('change', synchronize); synchronize();
    return () => { disposed = true; generation++; desktop.removeEventListener('change', synchronize); controller.current?.dispose(); controller.current = null; };
  }, []);

  function select(index: number) { selectedSport.current = index; setSport(index); controller.current?.setSport(index); }

  return <div className={styles.showcase} data-gear-showcase data-renderer={status}>
    <div className={styles.topline}><span>Built for another game.</span><span className={styles.hint}><Move size={12} aria-hidden="true" /> {status === 'webgl' ? 'Drag to rotate · Tap the gear' : 'Made for the next player'}</span></div>
    <p id="gear-keyboard-help" className="sr-only">Drag to turn the equipment. Use the left and right arrow keys to rotate, Space or Enter to give it a spin, and R to reset the view.</p>
    <div className={styles.stage}>
      <div className={styles.halo} aria-hidden="true" />
      <div className={styles.canvas} ref={host} data-gear-scene data-ready={status === 'webgl'} />
      {status !== 'webgl' && <div className={styles.fallback} role="img" aria-label={`${sports[sport].name} equipment preview`}>
        <svg viewBox="0 0 400 380" aria-hidden="true">
          <defs><linearGradient id="gear-preview-wood"><stop stopColor="#a66d2c" /><stop offset=".45" stopColor="#ffe1a1" /><stop offset="1" stopColor="#ca944f" /></linearGradient><radialGradient id="gear-preview-ball" cx=".3" cy=".2"><stop stopColor="#ffb090" /><stop offset="1" stopColor="#912f28" /></radialGradient></defs>
          <ellipse cx="210" cy="330" rx="155" ry="32" fill="#12213d" stroke="#e5c2a450" />
          {sport === 0 && <><g transform="rotate(25 190 180)"><rect x="171" y="48" width="18" height="105" rx="8" fill="#334158" /><rect x="155" y="142" width="51" height="166" rx="12" fill="url(#gear-preview-wood)" /><path d="M157 224h46v36h-46z" fill="#182b50" /><text x="181" y="251" fontSize="29" fontWeight="bold" fill="#fb923c" textAnchor="middle">K</text></g><circle cx="280" cy="274" r="35" fill="url(#gear-preview-ball)" /><path d="M277 240q20 35 0 69" stroke="#ffe8bd" strokeWidth="2" strokeDasharray="2 3" fill="none" /></>}
          {sport === 1 && <><g transform="rotate(25 190 180)"><path d="M180 208v109" stroke="#d8bc8a" strokeWidth="6" /><path d="M180 279v45" stroke="#334158" strokeWidth="17" strokeLinecap="round" /><ellipse cx="180" cy="130" rx="62" ry="85" stroke="#fb923c" strokeWidth="7" fill="#a8c6f012" />{[-40,-20,0,20,40].map(offset => <g key={offset}><path d={`M${180+offset} 65v130`} stroke="#d6e3ff" strokeOpacity=".45" /><path d={`M128 ${130+offset}h104`} stroke="#d6e3ff" strokeOpacity=".45" /></g>)}</g><path d="M270 272l-22-64q36-24 72 0l-27 64z" fill="#f3f5ff" /><path d="M270 272h23q-4 25-19 9z" fill="#f9cb86" /></>}
          {sport === 2 && <><circle cx="205" cy="190" r="110" fill="#ef8c3b" /><path d="M95 190h220M205 80v220M130 110q120 80 0 160M280 110q-120 80 0 160" fill="none" stroke="#633d28" strokeWidth="4" /></>}
        </svg>
        <span>{status === 'loading' ? 'Warming up the playground…' : 'Your next game starts here.'}</span>
      </div>}
    </div>
    <div className={styles.bottom}>
      <div className={styles.caption}><p aria-live="polite">{sports[sport].line}</p><Link href="/shop/preowned">Find its next player <ArrowUpRight size={16} /></Link></div>
      <div className={styles.controls} role="group" aria-label="Explore sports equipment">{sports.map((item, index) => <button key={item.name} type="button" aria-label={`Show ${item.name.toLowerCase()} equipment`} aria-pressed={sport === index} onClick={() => select(index)} className={sport === index ? styles.active : ''}>{item.name}</button>)}</div>
    </div>
  </div>;
}

