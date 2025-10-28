import type { SVGProps } from "react";
export function ShuttlecockIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="m6 18 4 4 4-4" />
      <path d="m10 22 4-4" />
      <path d="M14 18v-5" />
      <path d="M10 18v-5" />
      <path d="m8 10 1.5-1.5" />
      <path d="m14.5 8.5 1.5 1.5" />
      <path d="M12 13a2.5 2.5 0 0 0 2.5-2.5V8l-2-2-2 2v2.5A2.5 2.5 0 0 0 12 13Z" />
      <path d="M14.5 4.5 17 2" />
      <path d="m9.5 4.5-2.5-2.5" />
    </svg>
  );
}
