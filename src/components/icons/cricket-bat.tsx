import type { SVGProps } from "react";
export function CricketBatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 13.5 18 10" />
      <path d="M13 19a2 2 0 1 1-2-2" />
      <path d="m14 18 4-4" />
      <path d="M12 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4" />
      <path d="m18 8 2 2c.8.8.2 2.3-1 2.8l-3.3 1.6c-.1 0-.1-.1 0 0Z" />
      <path d="M4.5 21.5c-1-1.5.5-4 4-6.5l3 3c-2.5 3.5-5 5.5-6.5 4l-1-1Z" />
    </svg>
  );
}
