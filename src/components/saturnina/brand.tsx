import { Link } from "@tanstack/react-router";

export function SaturnMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex h-12 w-9 items-center justify-center rounded-[50%] border border-current font-display text-2xl italic ${className}`} aria-hidden>
      S
    </span>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" aria-label="Saturnina — início" className={`font-display text-3xl ${light ? "text-primary-foreground" : "text-foreground"}`}>
      saturnina
    </Link>
  );
}