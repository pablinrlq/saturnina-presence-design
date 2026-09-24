import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PublicHeader } from "./public-header";
import { SaturnMark, Wordmark } from "./brand";

export function PublicPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-28">
        <PublicHeader />
      </div>
      <header className="mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-10 md:pb-32">
        <p className="mb-8 text-xs uppercase text-primary">{eyebrow}</p>
        <h1 className="max-w-5xl text-6xl leading-[.9] md:text-9xl">{title}</h1>
        <p className="ml-auto mt-12 max-w-md text-base leading-7 text-muted-foreground">{intro}</p>
      </header>
      {children}
      <Footer />
    </main>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand-ink px-5 py-16 text-primary-foreground md:px-10">
      <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-3">
        <div>
          <Wordmark light />
          <p className="mt-5 max-w-xs font-display text-2xl">Beleza que revela presença.</p>
        </div>
        <div className="text-sm">
          <p className="mb-5 text-xs uppercase text-brand-pink">Descubra</p>
          <Link to="/servicos" className="block py-1">
            Serviços
          </Link>
          <Link to="/profissionais" className="block py-1">
            Profissionais
          </Link>
          <Link to="/agendamento" className="mt-5 inline-flex items-center gap-2 border-b pb-1">
            Agendar experiência <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="flex items-end justify-between md:justify-end">
          <p className="text-xs text-primary-foreground/60">SATURNINA CONCEPT HAIR</p>
          <SaturnMark className="ml-8" />
        </div>
      </div>
    </footer>
  );
}
