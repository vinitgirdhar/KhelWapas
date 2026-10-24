'use client';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './theme-provider';
export default function ThemeToggle() {
  const { isDark, setTheme } = useTheme();
  return <Button type="button" size="icon" variant="ghost" className="rounded-full text-foreground hover:bg-primary/10 hover:text-primary" aria-label={isDark ? 'Turn on light mode' : 'Turn on dark mode'} aria-pressed={isDark} onClick={() => setTheme(isDark ? 'light' : 'dark')}>
    <Sun className="hidden dark:block" aria-hidden="true" /><Moon className="dark:hidden" aria-hidden="true" />
  </Button>;
}
