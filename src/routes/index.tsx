import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import heroImage from "@/assets/saturnina-hero.jpg";
import hairImage from "@/assets/saturnina-hair.jpg";
import loginImage from "@/assets/saturnina-login.jpg";
import productsImage from "@/assets/saturnina-products.jpg";
import { PublicHeader } from "@/components/saturnina/public-header";
import { Footer } from "@/components/saturnina/page-shell";
import { SaturnMark } from "@/components/saturnina/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saturnina — Beleza que revela presença" },
      {
        name: "description",
        content:
          "Uma experiência de beleza autoral, editorial e sensorial. Cabelo, cuidado e presença em um encontro singular.",
      },
      { property: "og:title", content: "Saturnina — Beleza que revela presença" },
      {
        property: "og:description",
        content: "Uma experiência de beleza autoral, editorial e sensorial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const services = [
  {
    number: "01",
    symbol: "S",
    title: "Corte & forma",
    copy: "Um desenho autoral que respeita textura, movimento e a identidade que você deseja revelar.",
  },
  {
    number: "02",
    symbol: "C",
    title: "Coloração autoral",
    copy: "Cor construída com intenção, leitura de imagem e cuidado para um resultado sofisticado.",
  },
  {
    number: "03",
    symbol: "R",
    title: "Rituais de tratamento",
    copy: "Protocolos sensoriais que recuperam matéria, brilho e vitalidade sem apagar a sua essência.",
  },
];

const editorial = [
  { image: loginImage, label: "Presença", className: "editorial-tall" },
  { image: hairImage, label: "Movimento", className: "editorial-wide" },
  { image: productsImage, label: "Ritual", className: "" },
  { image: heroImage, label: "Identidade", className: "" },
];

const faqs = [
  [
    "Como começa uma experiência Saturnina?",
    "Tudo começa com escuta. Conversamos sobre seu momento, referências, rotina e desejos antes de definir qualquer caminho.",
  ],
  [
    "Posso agendar uma avaliação antes do serviço?",
    "Sim. A avaliação é indicada para mudanças de cor, correções e transformações que pedem diagnóstico técnico prévio.",
  ],
  [
    "Como funciona a confirmação do agendamento?",
    "Após escolher a experiência, profissional, data e horário, você envia seus dados e recebe a confirmação da equipe Saturnina.",
  ],
  [
    "A Saturnina atende diferentes texturas de cabelo?",
    "Sim. Nosso olhar parte da individualidade: textura, forma, história e rotina fazem parte da construção de cada resultado.",
  ],
];

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" id="inicio">
        <PublicHeader />
        <div className="home-hero-grid">
          <div className="home-hero-copy reveal">
            <p className="home-eyebrow">Saturnina Concept Hair</p>
            <h1>
              Beleza que
              <br />
              <em>revela presença.</em>
            </h1>
            <p className="home-lead">
              Uma experiência autoral de beleza, criada para revelar identidade, força e
              sofisticação de forma sensorial.
            </p>
            <div className="home-actions">
              <Link to="/agendamento" className="home-primary-button">
                Agendar experiência <ArrowRight size={16} />
              </Link>
              <a href="#manifesto" className="home-text-link">
                Descobrir Saturnina <ArrowDownRight size={16} />
              </a>
            </div>
            <div className="home-trust-row" aria-label="Essência Saturnina">
              <span>Escuta</span>
              <i />
              <span>Intenção</span>
              <i />
              <span>Presença</span>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-hero-orbit" aria-hidden="true" />
            <div className="home-hero-arch">
              <img src={heroImage} width={1440} height={1808} alt="Retrato editorial Saturnina" />
            </div>
            <span className="home-hero-letter" aria-hidden="true">
              S
            </span>
            <Link to="/agendamento" className="home-booking-peek">
              <SaturnMark />
              <span>
                <small>COMECE SUA EXPERIÊNCIA</small>
                <strong>Escolha seu ritual de beleza</strong>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <div className="home-marquee" aria-hidden="true">
        <span>BELEZA COM INTENÇÃO</span>
        <i>✦</i>
        <span>SUA ESSÊNCIA, SUA FORÇA</span>
        <i>✦</i>
        <span>BELEZA QUE REVELA PRESENÇA</span>
      </div>

      <section className="home-manifesto home-section" id="manifesto">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">Manifesto Saturnina</p>
            <h2>
              Você não precisa
              <br />
              <em>se tornar outra.</em>
            </h2>
          </div>
          <p>
            Acreditamos na estética como portal de reencontro. Técnica e sensibilidade se encontram
            para revelar aquilo que sempre esteve aí — a sua presença.
          </p>
        </div>
        <div className="home-manifesto-statement">
          <span className="home-statement-number">01</span>
          <p>Não criamos personagens.</p>
          <strong>Revelamos identidades.</strong>
          <SaturnMark className="home-statement-mark" />
        </div>
      </section>

      <section className="home-services" id="servicos">
        <div className="home-section home-services-inner">
          <div className="home-section-heading home-heading-light">
            <div>
              <p className="home-eyebrow">Nossas experiências</p>
              <h2>
                Técnica, cuidado
                <br />
                <em>e intenção.</em>
              </h2>
            </div>
            <p>
              Cada serviço nasce de uma leitura singular e termina em um resultado que faz sentido
              para você.
            </p>
          </div>
          <div className="home-services-grid">
            {services.map((service) => (
              <article key={service.number}>
                <span className="home-service-number">{service.number}</span>
                <span className="home-service-symbol" aria-hidden="true">
                  {service.symbol}
                </span>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
                <Link to="/agendamento">
                  Reservar experiência <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-editorial home-section" id="editorial">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">Editorial</p>
            <h2>
              Gestos, texturas
              <br />
              <em>e histórias.</em>
            </h2>
          </div>
          <p>
            O universo Saturnina em imagens: uma beleza viva, contemporânea e profundamente pessoal.
          </p>
        </div>
        <div className="home-editorial-grid">
          {editorial.map((item) => (
            <figure className={item.className} key={item.label}>
              <img src={item.image} loading="lazy" alt={`Editorial Saturnina — ${item.label}`} />
              <figcaption>
                <span>{item.label}</span>
                <small>Saturnina editorial</small>
              </figcaption>
            </figure>
          ))}
        </div>
        <Link to="/editorial" className="home-underlined-link">
          Conhecer o editorial <ArrowUpRight size={15} />
        </Link>
      </section>

      <section className="home-experience home-section">
        <div className="home-experience-photo">
          <img src={hairImage} loading="lazy" alt="Cabelos em movimento" />
          <span>
            Um encontro
            <br />
            com a sua presença
          </span>
        </div>
        <div className="home-experience-copy">
          <p className="home-eyebrow">A experiência</p>
          <h2>
            Seu momento.
            <br />
            <em>No seu tempo.</em>
          </h2>
          <p>
            Um atendimento atento, sensorial e sem fórmulas prontas. Da primeira conversa ao último
            gesto, tudo é pensado para que você se reconheça no espelho.
          </p>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Escuta & intenção</strong>
                <small>Entendemos seu momento, rotina e desejo.</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Leitura personalizada</strong>
                <small>Forma, textura e identidade orientam cada escolha.</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Ritual & revelação</strong>
                <small>Técnica e cuidado culminam em um resultado só seu.</small>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="home-about" id="sobre">
        <div className="home-about-inner">
          <div className="home-about-copy">
            <p className="home-eyebrow">Sobre a marca</p>
            <h2>
              Saturnina é<br />
              <em>presença.</em>
            </h2>
            <p>
              Uma marca brasileira de beleza e experiência feminina que transforma o cuidado em um
              portal de reencontro com a própria identidade.
            </p>
            <Link to="/sobre" className="home-text-link home-text-link-light">
              Conhecer nossa essência <ArrowUpRight size={16} />
            </Link>
            <div className="home-about-values">
              <div>
                <strong>Autoral</strong>
                <span>Nenhuma beleza é igual à outra.</span>
              </div>
              <div>
                <strong>Sensorial</strong>
                <span>O cuidado vive em cada detalhe.</span>
              </div>
            </div>
          </div>
          <div className="home-about-photo">
            <img src={loginImage} loading="lazy" alt="Mulher no universo Saturnina" />
            <span className="home-about-word" aria-hidden="true">
              presença
            </span>
            <div className="home-about-seal">
              <SaturnMark />
              <span>
                BELEZA
                <br />
                AUTORAL
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-faq home-section">
        <div>
          <p className="home-eyebrow">Antes do encontro</p>
          <h2>
            Dúvidas
            <br />
            <em>frequentes.</em>
          </h2>
        </div>
        <div className="home-faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="home-final-cta">
        <SaturnMark className="home-final-mark" />
        <p className="home-eyebrow">Seu próximo encontro com você</p>
        <h2>
          Pronta para revelar
          <br />
          <em>sua presença?</em>
        </h2>
        <Link to="/agendamento" className="home-primary-button home-primary-button-light">
          Agendar experiência <ArrowRight size={16} />
        </Link>
        <span className="home-final-script" aria-hidden="true">
          saturnina
        </span>
      </section>

      <Footer />
    </main>
  );
}
