import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "./brand";

const links = [
  ["Experiência", "/experiencia"], ["Serviços", "/servicos"], ["Profissionais", "/profissionais"],
  ["Editorial", "/editorial"], ["Saturn Club", "/saturn-club"], ["Cosméticos", "/cosmeticos"],
  ["Sobre", "/sobre"], ["Contato", "/contato"],
] as const;

export function PublicHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className={`absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-6 md:px-10 ${overlay ? "text-primary-foreground" : "text-foreground"}`}>
        <Wordmark light={overlay} />
        <div className="flex items-center gap-3">
          <Button asChild variant={overlay ? "lightOutline" : "outline"} className="hidden md:inline-flex"><Link to="/agendamento">Agendar experiência</Link></Button>
          <Button variant="iconGhost" size="icon" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu /></Button>
        </div>
      </header>
      <div className={`fixed inset-0 z-50 bg-primary text-primary-foreground transition-transform duration-700 ${open ? "translate-y-0" : "-translate-y-full"}`} aria-hidden={!open}>
        <div className="flex items-center justify-between px-5 py-6 md:px-10"><Wordmark light /><Button variant="iconGhost" size="icon" aria-label="Fechar menu" onClick={() => setOpen(false)}><X /></Button></div>
        <nav className="mx-auto grid min-h-[75vh] max-w-6xl content-center gap-3 px-6 md:grid-cols-2 md:gap-x-20">
          {links.map(([label, to], index) => <Link key={to} to={to} onClick={() => setOpen(false)} className="group flex items-center gap-5 border-b border-primary-foreground/20 py-4 font-display text-4xl md:text-6xl"><span className="font-sans text-[10px]">0{index + 1}</span>{label}</Link>)}
        </nav>
      </div>
    </>
  );
}