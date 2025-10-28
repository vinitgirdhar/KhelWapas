import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function KhelwapasLogo({ className, ...props }: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image 
        src="/images/logo.png" 
        alt="Khelwapas Logo" 
        width={40} 
        height={40} 
        className="rounded-full"
      />
    </div>
  );
}
