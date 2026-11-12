"use client";

import { useEffect, useRef, useState } from "react";
import { display } from "@/lib/fonts";

const COUNT_MS = 1800;
const R = 20;
const CIRC = 2 * Math.PI * R;

// `fill` is how much of the ring draws (decorative)
const STATS = [
  { value: 100, suffix: "%", label: "Product purity", tint: "#e3f2df", ink: "#2e7d32", fill: 1 },
  { value: 458, suffix: "+", label: "Happy customers", tint: "#f4e6c8", ink: "#8a5a14", fill: 0.82 },
  { value: 35, suffix: "+", label: "Years of experience", tint: "#d6edfb", ink: "#0b78b8", fill: 0.66 },
];

function useInView<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShown(true), io.disconnect()), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, shown };
}

/* Counts from 0 to `to` once `run` is true */
function CountUp({ to, run, delay = 0 }: { to: number; run: boolean; delay?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(to);
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - t0) / COUNT_MS, 0), 1);
      setN(Math.round(to * (1 - Math.pow(1 - t, 4))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to, delay]);
  return <>{n}</>;
}

export default function Achievements() {
  const { ref, shown } = useInView<HTMLDivElement>();

  return (
    <section className="bg-white px-5 py-10 sm:px-8 sm:py-14">
      <style>{`
        @keyframes hz-shine { from { transform: translateX(-120%) skewX(-18deg) } to { transform: translateX(320%) skewX(-18deg) } }
        @keyframes hz-num-pop { 0% { transform: scale(1) } 45% { transform: scale(1.14) } 100% { transform: scale(1) } }
        @keyframes hz-pulse { 0%,100% { transform: scale(1); opacity: .9 } 50% { transform: scale(1.7); opacity: .25 } }
        .hz-shine { animation: hz-shine 1100ms ease-out both }
        .hz-num-pop { animation: hz-num-pop 600ms cubic-bezier(.3,1.6,.5,1) both; transform-origin: right center }
        .hz-pulse { animation: hz-pulse 2.4s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) {
          .hz-shine, .hz-num-pop, .hz-pulse { animation: none }
          .hz-ring { transition: none !important }
        }
      `}</style>

      <div ref={ref} className="mx-auto max-w-[1400px]">
        {/* heading with a line that draws in */}
        <div className="mb-5 flex items-center gap-4">
          <h2 className={`${display.className} text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl`}>
            Our recent achievements
          </h2>
          <span
            aria-hidden="true"
            className="h-px flex-1 origin-left bg-gradient-to-r from-[#4caf50] via-[#d4a24c] to-[#2fa8e8] transition-transform duration-[1400ms] ease-out"
            style={{ transform: shown ? "scaleX(1)" : "scaleX(0)" }}
          />
        </div>

        <dl className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {STATS.map((s, i) => {
            const delay = i * 180;
            return (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-2xl transition-[opacity,transform,box-shadow] duration-700 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
                style={{
                  background: s.tint,
                  opacity: shown ? 1 : 0,
                  transform: shown ? "none" : "translateY(24px) scale(0.96)",
                  transitionDelay: shown ? `${delay}ms, ${delay}ms, 0ms` : "0ms",
                }}
              >
                {/* light sweep once the count finishes */}
                {shown && (
                  <span
                    aria-hidden="true"
                    className="hz-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/55"
                    style={{ animationDelay: `${delay + COUNT_MS}ms` }}
                  />
                )}

                <div className="relative flex items-center gap-4 px-5 py-5 sm:px-6">
                  {/* ring draws itself, centre dot pulses */}
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center">
                    <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
                      <circle cx="24" cy="24" r={R} fill="none" stroke={s.ink} strokeOpacity="0.18" strokeWidth="4" />
                      <circle
                        className="hz-ring"
                        cx="24"
                        cy="24"
                        r={R}
                        fill="none"
                        stroke={s.ink}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={CIRC}
                        style={{
                          strokeDashoffset: shown ? CIRC * (1 - s.fill) : CIRC,
                          transition: `stroke-dashoffset ${COUNT_MS}ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
                        }}
                      />
                    </svg>
                    <span className="hz-pulse h-2 w-2 rounded-full" style={{ background: s.ink }} />
                  </span>

                  <dt className="min-w-0 flex-1 text-[15px] font-medium text-neutral-700">{s.label}</dt>

                  <dd
                    key={shown ? "on" : "off"}
                    className={`${display.className} text-4xl font-extrabold leading-none tracking-[-0.04em] sm:text-5xl [font-variant-numeric:tabular-nums] ${shown ? "hz-num-pop" : ""}`}
                    style={{ color: s.ink, animationDelay: `${delay + COUNT_MS - 150}ms` }}
                  >
                    <CountUp to={s.value} run={shown} delay={delay} />
                    {s.suffix}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
