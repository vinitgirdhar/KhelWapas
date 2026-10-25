'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { KhelwapasLogo } from '@/components/icons/khelwapas-logo';
import styles from './backend-gate.module.css';

type Phase = 'connecting' | 'ready' | 'failed';
const MAX_WAIT_MS = 120_000;
const RECHECK_AFTER_MS = 300_000;

/** Wait for the demo backend before mounting consumers; never replay a write. */
export default function BackendGate({ children }: { children: ReactNode }) {
  const enabled = process.env.NEXT_PUBLIC_BACKEND_WAKE === 'true';
  const [phase, setPhase] = useState<Phase>(enabled ? 'connecting' : 'ready');
  const [hasConnected, setHasConnected] = useState(!enabled);
  const [attempt, setAttempt] = useState(0);
  const phaseRef = useRef(phase);
  const connected = useRef(!enabled);
  const lastReady = useRef(0);
  const appRoot = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLElement>(null);
  const retryButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let inFlight = false;
    let deadline = Date.now() + MAX_WAIT_MS;
    let pausedAt = document.hidden ? Date.now() : 0;
    let checks = 0;

    function updatePhase(value: Phase) {
      if (disposed) return;
      phaseRef.current = value;
      setPhase(value);
    }

    async function probe() {
      if (disposed || inFlight || document.hidden || phaseRef.current !== 'connecting') return;
      inFlight = true;
      const requestController = new AbortController();
      controller = requestController;
      const requestTimeout = setTimeout(() => requestController.abort(), 10_000);
      let ready = false;
      try {
        const response = await fetch('/api/backend-status', {
          cache: 'no-store',
          signal: requestController.signal,
          headers: { Accept: 'application/json' },
        });
        const status: unknown = await response.json();
        ready = response.ok && !!status && typeof status === 'object' && 'ready' in status && status.ready === true;
      } catch {
        // A sleeping server, a temporary network error, and an HTML wake page
        // all leave the visitor in the same bounded, retryable connecting state.
      } finally {
        clearTimeout(requestTimeout);
        inFlight = false;
        if (controller === requestController) controller = undefined;
      }
      if (disposed) return;
      if (ready) {
        lastReady.current = Date.now();
        connected.current = true;
        setHasConnected(true);
        updatePhase('ready');
        return;
      }
      if (Date.now() >= deadline) {
        updatePhase('failed');
        return;
      }
      checks++;
      if (!document.hidden) timer = setTimeout(() => void probe(), Math.min(5000, 2000 + checks * 500));
    }

    function begin() {
      clearTimeout(timer);
      deadline = Date.now() + MAX_WAIT_MS;
      checks = 0;
      if (connected.current && document.activeElement instanceof HTMLElement) previousFocus.current = document.activeElement;
      updatePhase('connecting');
      void probe();
    }

    function foreground() {
      if (document.hidden || disposed) return;
      if (pausedAt) { deadline += Date.now() - pausedAt; pausedAt = 0; }
      if (phaseRef.current === 'ready' && Date.now() - lastReady.current >= RECHECK_AFTER_MS) begin();
      else if (phaseRef.current === 'connecting') { clearTimeout(timer); void probe(); }
    }

    function visibility() {
      if (document.hidden) { pausedAt = Date.now(); clearTimeout(timer); }
      else foreground();
    }

    window.addEventListener('focus', foreground);
    document.addEventListener('visibilitychange', visibility);
    begin();
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller?.abort();
      window.removeEventListener('focus', foreground);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [enabled, attempt]);

  useEffect(() => {
    if (appRoot.current) appRoot.current.inert = phase !== 'ready';
    if (phase === 'failed') retryButton.current?.focus();
    else if (phase === 'connecting' && hasConnected) screen.current?.focus();
    else if (phase === 'ready' && previousFocus.current?.isConnected) {
      previousFocus.current.focus();
      previousFocus.current = null;
    }
  }, [phase, hasConnected]);

  if (!enabled) return <>{children}</>;

  return <>
    {hasConnected && <div ref={appRoot} className={styles.app} aria-hidden={phase !== 'ready' ? true : undefined}>{children}</div>}
    {phase !== 'ready' && <section
      ref={screen}
      tabIndex={-1}
      className={`${styles.screen} ${hasConnected ? styles.overlay : ''}`}
      role={phase === 'failed' ? 'alert' : 'status'}
      aria-live="polite"
      aria-labelledby="backend-wake-title"
      aria-describedby="backend-wake-description"
      data-backend-gate={phase}
    >
      <div className={styles.brand}><KhelwapasLogo /><span>KHELWAPAS</span></div>
      <div className={styles.content}>
        <div className={styles.court} aria-hidden="true"><div className={styles.courtLine} /><div className={styles.ball} /><div className={styles.shadow} /></div>
        <h1 id="backend-wake-title">{phase === 'failed' ? 'Taking a little longer.' : 'Getting the game ready.'}</h1>
        <p id="backend-wake-description">{phase === 'failed'
          ? 'The demo server is taking longer than expected. Please try again in a moment.'
          : 'Our demo server is waking up. This can take about a minute.'}</p>
        {phase === 'failed'
          ? <button ref={retryButton} type="button" className={styles.retry} onClick={() => setAttempt(value => value + 1)}>Try again</button>
          : <p className={styles.connecting}><span aria-hidden="true" />Connecting to the marketplace…</p>}
      </div>
      <p className={styles.footer}>Good gear. Another great game.</p>
    </section>}
  </>;
}
