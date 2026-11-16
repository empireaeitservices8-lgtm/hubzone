"use client";

/**
 * HUBZONE – About page (fully responsive, images shown in full)
 * Drop into: app/about/page.tsx
 * Requires: Next.js 13.4+ (App Router), React 18+. No other dependencies.
 *
 * If an image file is missing, the <img> hides itself and the gradient/placeholder underneath shows.
 */

import { useEffect, useRef, useState } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Link from "next/link";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const WHATSAPP = "https://api.whatsapp.com/send?phone=918714410040";

/** <img> that hides itself if the file isn't there yet. */
function Img({ src, alt, lazy = true }: { src: string; alt: string; lazy?: boolean }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading={lazy ? "lazy" : undefined} onError={() => setOk(false)} />
  );
}

type Member = { name: string; role: string; img: string; tones: [string, string, string] };

const TEAM: Member[] = [
  { name: "Sujeesh A", role: "Chief Accountant, Palakkad", img: "/team/sujeesh.webp", tones: ["#9c6a4c", "#e3b08c", "#3a2c24"] },
  { name: "Athira S", role: "Branch Manager, Alappuzha", img: "/team/athira.webp", tones: ["#c98a5e", "#f1c9a5", "#2f2a26"] },
  { name: "Safvan A T", role: "Branch Manager, Nilambur", img: "/team/safvan.webp", tones: ["#8a5a3c", "#d9a581", "#1f1b18"] },
  { name: "Subin P R", role: "Branch Manager, Kannur", img: "/team/subin.webp", tones: ["#c08460", "#f3cfae", "#222222"] },
  { name: "Jishnu A", role: "Branch Manager, Calicut", img: "/team/jishnu.webp", tones: ["#a5704f", "#ebbd9b", "#6b3f2b"] },
  { name: "Soorya B Suresh", role: "Branch Manager, Thiruvananthapuram", img: "/team/soorya.webp", tones: ["#8a5a3c", "#d9a581", "#1f1b18"] },
  { name: "Abhijith E R", role: "Branch Manager, Thrissur", img: "/team/abhijith.webp", tones: ["#b4795a", "#f1c7a6", "#4a3226"] },
  { name: "Bhasi Babu", role: "Branch Manager, Thrissur", img: "/team/bhasi.webp", tones: ["#b4795a", "#f1c7a6", "#4a3226"] },
];

const PILLARS = ["Research-Driven Innovation", "Sustainable Manufacturing", "Versatile Product Portfolio"];

const CHEVRONS: { label: string; img: string; bg: string }[] = [
  { label: "HUBCARE", img: "/chevrons/hubcare.jpg", bg: "linear-gradient(160deg,#9bb07a,#e6c88a 55%,#4a3a22)" },
  { label: "HUBNOIR", img: "/chevrons/hubnoir.jpg", bg: "linear-gradient(160deg,#9b7fd1,#5b3a8f 55%,#1f1233)" },
  { label: "HUBCOOK", img: "/chevrons/hubcook.png", bg: "linear-gradient(160deg,#d9a05b,#a8643a 55%,#3a2518)" },
  { label: "HUBCOF", img: "/chevrons/hubcof.jpg", bg: "linear-gradient(160deg,#c89a6a,#6b4128 55%,#24160f)" },
  { label: "HUBWASH", img: "/chevrons/hubwash.png", bg: "linear-gradient(160deg,#7fb2c9,#d9e6e0 50%,#3a4a52)" },
];

const BRANDS = [
  { name: "HUBCARE", color: "#4caf50", tagline: "Herbal Unisex Body Care", img: "/logos/hub_care.webp", items: ["Hair Oil", "Ayurveda Soap", "Evrly Anti-Dandruff Shampoo", "Pain Oil", "Mehandhi", "Neelayamari"] },
  { name: "HUBNOIR", color: "#7e57c2", tagline: "Heritage Urban Bliss", img: "/logos/hub_noir.png", items: ["Perfumes", "Fragrances"] },
  { name: "HUBCOOK", color: "#f08a24", tagline: "Home Universal Best Cook", img: "/logos/hub_cook.webp", items: ["Dosa Tawa", "Fry Pan", "Bowl"] },
  { name: "HUBCOF", color: "#d4a24c", tagline: "High Range Ultimate Beans Coffee", img: "/logos/hubcof.webp", items: ["Wayanad Coffee"] },
  { name: "HUBWASH", color: "#2fa8e8", tagline: "Hygiene Universal Brilliance", img: "/logos/hubwash.webp", items: ["Liquid Detergent", "Car Wash", "Brass Cleaner", "Fabric Stiff", "Floor Cleaner", "Hand Wash", "Toilet Cleaner"] },
];

/** Footer brand links (match the shop filter ids) */
const FOOTER_BRANDS = [
  { label: "HUBCARE", href: "/shop?category=care" },
  { label: "HUBNOIR", href: "/shop?category=noir" },
  { label: "HUBCOOK", href: "/shop?category=cook" },
  { label: "HUBCOF", href: "/shop?category=coffee" },
  { label: "HUBWASH", href: "/shop?category=wash" },
];

const MD = {
  name: "Hubail K P",
  title: "Managing Director",
  img: "/team/hubail.webp",
  message:
    "At HUBZONE we turn raw materials into finished goods people can trust. Every product from HUBCARE, HUBNOIR, HUBCOOK, HUBCOF and HUBWASH is built on research, careful sourcing and a promise of quality that we stand behind.",
};

const WELLNESS = [
  { title: "Quality Guaranteed", img: "/quality.jpg", text: "100% results guarantee on all products." },
  { title: "Expert Recommended", img: "/expert.jpg", text: "Backed by experienced doctors and wellness experts." },
  { title: "Natural Ingredients", img: "/ingredients.jpg", text: "We use only the finest, natural ingredients in our products." },
  { title: "Years of Expertise", img: "/expertise.jpg", text: "Decades of experience in producing high-quality wellness products." },
];

function Portrait({ tones, index }: { tones: Member["tones"]; index: number }) {
  const bg = ["#d9b48a", "#c9a27a", "#e4c9a2", "#bf9468"][index % 4];
  return (
    <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Team member portrait placeholder">
      <rect width="200" height="250" fill={bg} />
      <path d="M20 250c4-60 36-84 80-84s76 24 80 84z" fill={tones[0]} />
      <rect x="88" y="130" width="24" height="36" fill={tones[1]} />
      <ellipse cx="100" cy="100" rx="32" ry="38" fill={tones[1]} />
      <path d="M66 98c-4-40 24-56 46-50 22 4 28 28 22 50-8-18-22-26-34-26s-26 8-34 26z" fill={tones[2]} />
    </svg>
  );
}

export default function AboutPage() {
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = teamRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`hz ${serif.variable} ${sans.variable}`}>
      <style>{css}</style>

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <clipPath id="hz-chev" clipPathUnits="objectBoundingBox">
            <path d="M0.04,0 L0.60,0 Q0.64,0 0.66,0.03 L0.99,0.46 Q1,0.5 0.99,0.54 L0.66,0.97 Q0.64,1 0.60,1 L0.04,1 Q0,1 0.02,0.96 L0.36,0.54 Q0.38,0.5 0.36,0.46 L0.02,0.04 Q0,0 0.04,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ABOUT */}
      <section className="dark aboutdark" id="about">
        <div className="wrap about">
          <div>
            <h2 className="left">About HUBZONE</h2>
            <p>
              HUBZONE is a leading manufacturer of innovative products. We specialize in a diverse range of goods,
              including ayurvedic care, perfumes, kitchen essentials, Wayanad coffee and cleaning products
              through our HUBZONE unit.
            </p>
            <p>
              Leveraging our full-scale production capabilities, we transform raw materials into high-quality finished
              goods, adding value through precision and expertise.
            </p>
            <Link className="btn" href="/contact">Talk to us</Link>
          </div>
          <div className="panel">
            <Img src="/about.png" alt="Woman applying HUBCARE cream" lazy={false} />
            <span>Natural care, made with ingredients you can trust.</span>
          </div>
        </div>
      </section>

      {/* CHEVRON STRIP */}
      <section className="light chevs">
        <div className="wrap">
          <h1 className="sr">HUBZONE: Hybrid Universal Business Zone</h1>
          <div className="strip">
            {CHEVRONS.map((c, i) => (
              <div className="chev" key={c.label} style={{ ["--i" as string]: i }}>
                <div className="chimg" style={{ background: c.bg }}>
                  <Img src={c.img} alt={`${c.label} products`} lazy={false} />
                </div>
                <span className="chlabel">{c.label}</span>
              </div>
            ))}
          </div>
          <ul className="pills">
            {PILLARS.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      </section>

      {/* MANAGING DIRECTOR */}
      <section className="dark" id="leadership">
        <div className="wrap mdgrid">
          <figure className="mdph">
            <Portrait tones={["#8a5a3c", "#d9a581", "#1f1b18"]} index={0} />
            <Img src={MD.img} alt={MD.name} />
          </figure>
          <div>
            <h2 className="left">A word from our Managing Director</h2>
            <blockquote>{MD.message}</blockquote>
            <p className="mdname">
              <b>{MD.name}</b>
              <span>{MD.title}</span>
            </p>
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="light" id="units">
        <div className="wrap">
          <h2>Multiple brands for everyday life</h2>
          <div className="units">
            {BRANDS.map((b) => (
              <article className="unit" key={b.name} style={{ ["--c" as string]: b.color }}>
                <div className="uimg">
                  <Img src={b.img} alt={`${b.name} – ${b.tagline}`} />
                </div>
                <h3>{b.name}</h3>
                <p>{b.tagline}</p>
                <ul>
                  {b.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WELLNESS */}
      <section className="dark">
        <div className="wrap">
          <h2>HUBCARE: Expertise in Wellness</h2>
          <div className="cols">
            {WELLNESS.map((w) => (
              <div className="card" key={w.title}>
                <div className="cimg">
                  <Img src={w.img} alt={w.title} />
                </div>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="light" id="team">
        <div className="wrap">
          <h2>The people you meet are the ones doing the work.</h2>
          <p className="sub">The team behind every product at HUBZONE.</p>
          <div className="team" ref={teamRef}>
            {TEAM.map((m, i) => (
              <figure className="member" key={i} style={{ transitionDelay: `${(i % 4) * 90}ms` }}>
                <div className="ph">
                  <Portrait tones={m.tones} index={i} />
                  <Img src={m.img} alt={`${m.name}, ${m.role}`} />
                </div>
                <figcaption>
                  <h3>{m.name}</h3>
                  <span>{m.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="ctabg" aria-hidden="true">
          <Img src="/cta.jpg" alt="" />
        </div>
        <div className="wrap ctain">
          <h2>Let&rsquo;s build something together.</h2>
          <p className="sub inv">Message us on WhatsApp and our team will reply.</p>
          <a className="btn" href={WHATSAPP}>Let&rsquo;s Start</a>
        </div>
      </section>
    </div>
  );
}

const css = `
.hz{--cream:#fbefd8;--cream2:#f3e2c2;--dark:#2a231e;--dark2:#3a2f28;--accent:#b8613a;--ink:#2a231e;--muted:#6a5c4f;--on:#f6e9d0;
background:var(--dark);color:var(--ink);font:400 16px/1.65 var(--font-sans),system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;width:100%}
.hz *{box-sizing:border-box;margin:0}
.hz img{max-width:100%}
.hz h1,.hz h2,.hz h3,.hz .logo,.hz .ftag,.hz .big,.hz .panel span{font-family:var(--font-serif),Georgia,serif;font-weight:500}
.hz a{color:inherit}
.hz :focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px;width:100%}
.btn{display:inline-block;background:var(--accent);color:#fff !important;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:500;transition:background .2s}
.btn:hover{background:#9f5230}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}

/* chevrons (image fills the chevron shape) – sized so FIVE fit exactly in the strip */
.chevs{padding:96px 0}
.strip{display:flex;justify-content:center;max-width:980px;margin:0 auto}
.chev{flex:0 0 27.5%;margin-left:-9.35%;aspect-ratio:.9;position:relative;clip-path:url(#hz-chev);cursor:pointer;
animation:chevIn 1.2s cubic-bezier(.2,.8,.2,1) both,chevFloat 6s ease-in-out 1.6s infinite alternate;
animation-delay:calc(var(--i)*.2s),calc(1.6s + var(--i)*.35s);transition:translate .5s cubic-bezier(.2,.8,.2,1),scale .5s cubic-bezier(.2,.8,.2,1),filter .5s}
.chev:first-child{margin-left:0}
.chev:hover{translate:0 -10px;scale:1.07;z-index:2;filter:saturate(1.15)}
.chimg{position:absolute;inset:0;animation:chevZoom 2.6s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i)*.2s)}
.chimg img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
.chev:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(30,20,14,.55))}
.chlabel{position:absolute;left:26%;bottom:11%;z-index:1;color:#fff;font:500 20px var(--font-serif),Georgia,serif;font-style:italic;opacity:0;transform:translateY(8px);transition:.4s}
.chev:hover .chlabel{opacity:1;transform:none}
@keyframes chevIn{from{opacity:0;transform:translateX(-70px) scale(.5)}to{opacity:1;transform:none}}
@keyframes chevZoom{from{transform:scale(1.35)}to{transform:scale(1)}}
@keyframes chevFloat{from{transform:translateY(0)}to{transform:translateY(-7px)}}
.pills{list-style:none;padding:0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:44px}
.pills li{border:1px solid rgba(42,35,30,.25);color:var(--muted);padding:9px 18px;border-radius:99px;font-size:13px;opacity:0;animation:fadeUp .8s ease both;animation-delay:1.3s}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

/* managing director: photo shown in full */
.mdgrid{display:grid;grid-template-columns:.8fr 1.2fr;gap:64px;align-items:center}
.mdph{aspect-ratio:4/5;border-radius:6px;overflow:hidden;position:relative;background:var(--cream2);width:100%}
.mdph:before{content:"";position:absolute;inset:14px;border:1px solid rgba(246,233,208,.5);border-radius:3px;z-index:2;pointer-events:none}
.mdph svg{width:100%;height:100%;object-fit:cover;display:block}
.mdph img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;background:var(--cream2);display:block}
.dark blockquote{font:italic 500 clamp(20px,2.6vw,32px)/1.35 var(--font-serif),Georgia,serif;max-width:34ch;margin:0 0 28px;color:var(--on)}
.mdname b{display:block;font:500 clamp(22px,3vw,28px) var(--font-serif),Georgia,serif}
.mdname span{font-size:14px;opacity:.7}

/* shared */
.hz section{padding:96px 0}
.light{background:var(--cream)}
.dark{background:var(--dark);color:var(--on)}
.hz h2{font-size:clamp(30px,5vw,60px);line-height:1.08;text-align:center;margin:0 auto 18px;max-width:22ch;overflow-wrap:break-word}
.hz h2.left{text-align:left;margin:0 0 20px}
.sub{text-align:center;color:var(--muted);max-width:56ch;margin:0 auto 52px}
.sub.inv{color:rgba(246,233,208,.72);margin-bottom:28px}

/* about: photo shown in full at its natural ratio.
   Extra top padding keeps the title clear of the fixed header (76px phones / 88px desktop). */
.hz section.aboutdark{padding-top:168px}
.about{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.aboutdark{background:radial-gradient(900px 420px at 85% 0,#6b3a24 0,rgba(107,58,36,.35) 45%,var(--dark) 80%),var(--dark)}
.about p{color:rgba(246,233,208,.78);margin-bottom:16px;max-width:52ch}
.about .btn{margin-top:10px}
.panel{border-radius:6px;background:linear-gradient(160deg,#c9774a,#4a2f22);position:relative;overflow:hidden;min-height:220px;color:#fff;width:100%}
.panel img{width:100%;height:auto;display:block}
.panel:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(30,20,14,.72));pointer-events:none}
.panel:before{content:"";position:absolute;inset:14px;border:1px solid rgba(255,255,255,.4);border-radius:3px;z-index:2;pointer-events:none}
.panel span{position:absolute;left:30px;right:30px;bottom:28px;z-index:3;font-size:clamp(20px,2.6vw,32px);font-style:italic;line-height:1.15}

/* brands: 3 on the first row, 2 centred below; lists align to the bottom of each card */
.units{display:flex;flex-wrap:wrap;justify-content:center;gap:24px;margin-top:40px}
.unit{flex:0 0 calc((100% - 48px)/3);display:flex;flex-direction:column;background:var(--cream2);padding:28px;border-radius:6px;border-top:3px solid var(--c,var(--accent));overflow:hidden;min-width:0;transition:transform .3s ease,box-shadow .3s ease}
.unit:hover{transform:translateY(-4px);box-shadow:0 18px 40px -22px rgba(42,35,30,.45)}
.uimg{aspect-ratio:4/3;margin:-28px -28px 22px;overflow:hidden;background:#fff;padding:18px;display:flex;align-items:center;justify-content:center}
.uimg:empty{display:none}
.uimg img{width:100%;height:100%;object-fit:contain;object-position:center;display:block}
.unit h3{font-size:clamp(26px,3vw,34px);margin-bottom:4px}
.unit p{color:var(--muted);max-width:46ch;margin-bottom:16px}
.unit ul{list-style:none;padding:0;margin-top:auto;border-top:1px solid rgba(42,35,30,.18)}
.unit li{padding:8px 0;border-bottom:1px solid rgba(42,35,30,.18);font-size:15px}

/* wellness: images shown in full */
.dark h2{margin-bottom:48px}
.cols{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.card{background:var(--cream);padding:30px 24px;border-radius:6px;overflow:hidden;min-width:0}
.cimg{aspect-ratio:3/2;margin:-30px -24px 22px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center}
.cimg:empty{display:none}
.cimg img{width:100%;height:100%;object-fit:contain;object-position:center;display:block}
.card h3{font-size:clamp(23px,2.4vw,27px);margin-bottom:8px;color:var(--ink)}
.card p{font-size:15px;color:var(--muted)}

/* team: portraits shown in full */
.team{display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
.member{text-align:center;min-width:0}
.member .ph{aspect-ratio:4/5;border-radius:4px;overflow:hidden;margin-bottom:16px;background:var(--cream2);position:relative}
.member .ph svg{width:100%;height:100%;object-fit:cover;display:block}
.member .ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;background:var(--cream2);display:block}
.member h3{font-size:clamp(21px,2.2vw,26px);line-height:1.2}
.member span{font-size:13px;color:var(--muted);display:block;margin-top:2px}
.team .member{opacity:0;transform:translateY(24px);transition:opacity .9s ease,transform .9s cubic-bezier(.2,.7,.2,1)}
.team.in .member{opacity:1;transform:none}

/* cta */
.cta{background:var(--dark2);color:var(--on);text-align:center;position:relative;overflow:hidden}
.ctabg{position:absolute;inset:0}
.ctabg img{width:100%;height:100%;object-fit:cover;display:block;opacity:.3}
.ctain{position:relative;z-index:1}
.cta h2{font-size:clamp(34px,6vw,72px)}

/* footer */
.foot{background:var(--dark);color:var(--on);padding:72px 0 0;overflow:hidden}
.fgrid{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:48px;align-items:start}
.fbrand{display:flex;flex-direction:column;align-items:flex-start}
.flogo{display:inline-flex;align-items:center;justify-content:center;background:#fff;padding:12px 18px;border-radius:8px;margin-bottom:22px;text-decoration:none}
.flogo img{height:48px;width:auto;max-width:100%;display:block;object-fit:contain}
.ftag{font-size:clamp(26px,3vw,34px);line-height:1.15;margin-bottom:8px}
.fsub{font-size:14px;color:rgba(246,233,208,.65);max-width:32ch}
.fcol h4{font:500 13px/1.2 var(--font-sans),system-ui,sans-serif;color:rgba(246,233,208,.5);margin-bottom:16px;letter-spacing:.02em}
.fcol ul{list-style:none;padding:0}
.fcol li{margin-bottom:10px}
.fcol a{font-size:15px;text-decoration:none;color:rgba(246,233,208,.92);transition:color .2s}
.fcol a:hover{color:#fff;text-decoration:underline;text-underline-offset:4px}
.big{font-size:clamp(46px,16.5vw,230px);line-height:.95;letter-spacing:.02em;white-space:nowrap;margin-top:72px;text-align:center;color:rgba(246,233,208,.9);user-select:none}
.copy{font-size:12px;color:rgba(246,233,208,.5);text-align:center;padding:20px 0 28px;margin-top:8px;border-top:1px solid rgba(246,233,208,.12)}

/* ---------- responsive ---------- */
@media(max-width:1100px){
  .cols{grid-template-columns:repeat(2,1fr)}
  .unit{flex-basis:calc((100% - 24px)/2)}
}
@media(max-width:860px){
  .hz section{padding:72px 0}
  .hz section.aboutdark{padding-top:150px}
  .chevs{padding:64px 0}
  .about,.mdgrid{grid-template-columns:1fr;gap:36px}
  .mdph{max-width:420px;margin:0 auto}
  .dark blockquote{max-width:none}
  .team{grid-template-columns:repeat(2,1fr);gap:22px}
  .chlabel{font-size:14px}
  .pills{margin-top:32px}
  .sub{margin-bottom:36px}
  .dark h2{margin-bottom:36px}
  .foot{padding-top:56px}
  .fgrid{grid-template-columns:1fr 1fr;gap:36px 32px}
  .fbrand{grid-column:1 / -1}
  .big{margin-top:56px}
}
@media(max-width:520px){
  .wrap{padding:0 18px}
  .hz section{padding:56px 0}
  .hz section.aboutdark{padding-top:124px}
  .cols{grid-template-columns:1fr}
  .unit{flex-basis:100%}
  .team{gap:16px}
  .chlabel{font-size:10px;left:20%;bottom:9%}
  .pills li{font-size:12px;padding:8px 14px}
  .panel span{left:22px;right:22px;bottom:22px}
  .btn{padding:12px 22px}
  .foot{padding-top:44px}
  .flogo img{height:40px}
  .big{margin-top:44px}
}
@media(hover:none){
  .chlabel{opacity:1;transform:none}
  .chev:hover{translate:none;scale:1;filter:none}
}
@media(prefers-reduced-motion:reduce){.chev,.chimg,.pills li{animation:none;opacity:1}.team .member{opacity:1;transform:none;transition:none}}
`;
