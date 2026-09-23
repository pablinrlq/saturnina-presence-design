import hairImage from "@/assets/saturnina-hair.jpg";
import loginImage from "@/assets/saturnina-login.jpg";
import productsImage from "@/assets/saturnina-products.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { PublicPage } from "./page-shell";

export const content = {
  experiencia: { eyebrow: "Experiência Saturnina", title: "Presença é o verdadeiro luxo.", intro: "Cada encontro começa com escuta, intenção e um olhar singular para quem você é.", image: hairImage },
  servicos: { eyebrow: "Nossas experiências", title: "Beleza com intenção.", intro: "Cabelo, tratamentos, coloração e finalização conduzidos como experiências personalizadas.", image: hairImage },
  profissionais: { eyebrow: "Olhares autorais", title: "Mãos que sabem revelar.", intro: "Profissionais escolhidos por técnica, sensibilidade e respeito à identidade de cada mulher.", image: loginImage },
  editorial: { eyebrow: "Editorial", title: "Uma beleza que permanece.", intro: "Imagens, gestos e histórias que traduzem o universo sensorial da Saturnina.", image: loginImage },
  club: { eyebrow: "Saturn Club", title: "Para mulheres que desejam revelar sua presença.", intro: "Um espaço reservado para experiências exclusivas, encontros e prioridade de agenda. Novidades em breve.", image: loginImage },
  cosmeticos: { eyebrow: "Saturnina Cosmetics", title: "O ritual continua em casa.", intro: "Shampoo, condicionador, leave-in e máscara matizadora com o produto como protagonista.", image: productsImage },
  sobre: { eyebrow: "Sobre a Saturnina", title: "Beleza como portal de reencontro.", intro: "Uma marca brasileira de beleza e experiência feminina, criada para revelar presença com autenticidade.", image: hairImage },
  contato: { eyebrow: "Contato & localização", title: "Seu encontro com a Saturnina começa aqui.", intro: "As informações de endereço, atendimento e contato serão disponibilizadas em breve.", image: loginImage },
} as const;

export function ContentPage({ page }: { page: keyof typeof content }) { const data = content[page]; return <PublicPage eyebrow={data.eyebrow} title={data.title} intro={data.intro}><section className="mx-auto grid max-w-7xl gap-12 px-5 pb-28 md:grid-cols-[1.5fr_1fr] md:px-10 md:pb-40"><img src={data.image} loading="lazy" alt={data.eyebrow} className="aspect-[4/3] h-full w-full object-cover image-veil"/><div className="flex flex-col justify-end border-t border-primary pt-8"><p className="font-display text-3xl">Sua essência. Sua força. Sua presença.</p><Button asChild variant="editorial" size="lg" className="mt-10 self-start"><Link to="/agendamento">Reservar experiência</Link></Button></div></section></PublicPage> }