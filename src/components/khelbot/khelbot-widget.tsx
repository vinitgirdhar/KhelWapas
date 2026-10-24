'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { chatWithKhelbot } from '@/ai/flows/khelbot-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'model'; content: string };
const prompts = [
  ['Selling gear', 'Help me with selling'],
  ['Track an order', 'How do I track my order?'],
  ['Demo payments', 'Questions about payment'],
  ['Condition grades', 'Explain condition grades'],
] as const;

export default function KhelbotWidget({ open, onOpenChange, onCloseFocus }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseFocus: () => void;
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm KhelBot. Ask me about buying, selling, condition grades, or demo orders." },
  ]);
  const [loading, setLoading] = useState(false);
  const sending = useRef(false);
  const log = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<{ top: number; height: number }>();
  const compact = !!viewport && viewport.height < 420;

  useEffect(() => {
    if (!open) return;
    const visible = window.visualViewport;
    const update = () => setViewport({ top: visible?.offsetTop ?? 0, height: visible?.height ?? window.innerHeight });
    update();
    visible?.addEventListener('resize', update);
    visible?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      visible?.removeEventListener('resize', update);
      visible?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  useEffect(() => {
    if (open && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [open, messages, loading]);

  const send = async (value: string) => {
    const text = value.trim();
    if (sending.current || !text || text.length > 2000) return;
    sending.current = true;
    setLoading(true);
    setMessages(previous => [...previous, { role: 'user', content: text }]);
    setInput('');
    try {
      const reply = await chatWithKhelbot({ message: text });
      setMessages(previous => [...previous, { role: 'model', content: reply }]);
    } catch {
      setMessages(previous => [...previous, { role: 'model', content: 'Help is temporarily unavailable. Please try again or open the marketplace guide from the footer.' }]);
    } finally {
      sending.current = false;
      setLoading(false);
    }
  };

  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent
      side="right"
      className="liquid-glass flex h-dvh w-full flex-col gap-0 p-0 sm:max-w-md"
      style={viewport ? { top: viewport.top, height: viewport.height, bottom: 'auto' } : undefined}
      onOpenAutoFocus={event => { event.preventDefault(); log.current?.focus(); }}
      onCloseAutoFocus={event => { event.preventDefault(); onCloseFocus(); }}
    >
      <div className={cn('shrink-0 border-b', compact ? 'p-3' : 'p-5', 'pr-14')}>
        <SheetTitle className="font-headline text-xl">KhelBot</SheetTitle>
        <SheetDescription className={cn('mt-1', compact && 'sr-only')}>Marketplace help for buying, selling and demo orders.</SheetDescription>
      </div>
      <div ref={log} role="log" aria-label="Conversation with KhelBot" aria-live="polite" aria-relevant="additions text" aria-busy={loading} tabIndex={0} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5 focus-visible:outline-offset-[-4px]">
        {messages.map((message, index) => <div key={index} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
          <div className={cn('max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'border bg-card text-card-foreground')}>
            <span className="sr-only">{message.role === 'user' ? 'You: ' : 'KhelBot: '}</span>{message.content}
          </div>
        </div>)}
        {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Finding an answer…</p>}
      </div>
      <div className="shrink-0 border-t bg-background/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {!compact && <div className="mb-3 grid grid-cols-2 gap-2">
          {prompts.map(([label, value]) => <Button key={label} variant="secondary" size="sm" className="min-h-10 min-w-0 px-2 text-xs" disabled={loading} onClick={() => void send(value)}>{label}</Button>)}
        </div>}
        <form className="flex items-center gap-2" onSubmit={event => { event.preventDefault(); void send(input); }}>
          <label className="sr-only" htmlFor="khelbot-message">Your question</label>
          <Input id="khelbot-message" value={input} maxLength={2000} onChange={event => setInput(event.target.value)} placeholder="Ask a question…" autoComplete="off" className="h-11 min-w-0 text-base" />
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={loading || !input.trim()} aria-label="Send question"><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </SheetContent>
  </Sheet>;
}
