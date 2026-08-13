import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function HomeIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9.5" />
    </svg>
  );
}

export function StarIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 3.5l2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6L3.2 9.9l6.1-.9L12 3.5z" />
    </svg>
  );
}

export function TrashIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v7M14 11v7" />
    </svg>
  );
}

export function PlusIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CloseIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 14, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 14, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function PageIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h7M9 16h7" />
    </svg>
  );
}

export function LinkIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5" />
    </svg>
  );
}

export function QuoteIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M7 7h4v4H7zM7 11c0 3 1.5 4 3 4" />
      <path d="M13 7h4v4h-4zM13 11c0 3 1.5 4 3 4" />
    </svg>
  );
}

export function CodeIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M9 8l-4 4 4 4" />
      <path d="M15 8l4 4-4 4" />
    </svg>
  );
}

export function ListBulletIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="5" cy="6" r="0.6" fill="currentColor" />
      <circle cx="5" cy="12" r="0.6" fill="currentColor" />
      <circle cx="5" cy="18" r="0.6" fill="currentColor" />
      <path d="M9 6h11M9 12h11M9 18h11" />
    </svg>
  );
}

export function ListOrderedIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 5h2v3H4M4 11h2v3H4l2 1v0H4" />
    </svg>
  );
}

export function BoldIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M7 5h6a3 3 0 0 1 0 6H7z" />
      <path d="M7 11h7a3 3 0 0 1 0 6H7z" />
    </svg>
  );
}

export function ItalicIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M10 5h8M6 19h8M14 5l-4 14" />
    </svg>
  );
}

export function StrikeIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 12h14" />
      <path d="M16 7c-.7-1.5-2.2-2.5-4-2.5-2.2 0-4 1.3-4 3 0 4 8 1.5 8 5 0 1.7-1.8 3-4 3-1.8 0-3.3-1-4-2.5" />
    </svg>
  );
}

export function UndoIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M9 14l-4-4 4-4" />
      <path d="M5 10h9a4 4 0 0 1 0 8h-2" />
    </svg>
  );
}

export function RedoIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M15 14l4-4-4-4" />
      <path d="M19 10h-9a4 4 0 0 0 0 8h2" />
    </svg>
  );
}

export function Heading1Icon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 5v14M13 5v14M5 12h8" />
      <path d="M17 8l2-1v12" />
    </svg>
  );
}

export function Heading2Icon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 5v14M11 5v14M5 12h6" />
      <path d="M16 9c0-1 1-2 2.5-2s2.5 1 2.5 2-1 1.5-2.5 3l-2.5 3h5" />
    </svg>
  );
}

export function SearchIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function FitViewIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" />
    </svg>
  );
}

export function NotebookIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5z" />
      <path d="M9 4v16" />
    </svg>
  );
}

export function SparkleIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7L19 15z" />
    </svg>
  );
}

export function CompassIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </svg>
  );
}

export function SunIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export function MoonIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" stroke="none" />
    </svg>
  );
}
