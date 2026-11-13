"use client";

import { useRef, useState } from "react";
import { TileArt } from "@/components/ProductCard";
import { tileStyle } from "@/lib/products";

export default function ProductGallery({
  images,
  name,
  tile,
  label,
  discount,
}: {
  images: string[];
  name: string;
  tile: string;
  label: string;
  discount?: number;
}) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const many = images.length > 1;
  const go = (d: number) => setIdx((i) => (i + d + images.length) % images.length);

  return (
    <div>
      <div
        className="group relative aspect-square overflow-hidden rounded-[22px] shadow-[0_40px_70px_-30px_rgba(42,35,30,0.45),inset_0_0_0_1px_rgba(42,35,30,0.06)] sm:rounded-[30px]"
        style={tileStyle(tile)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || !many) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
       {images.map((src, n) => (
  <TileArt
    key={src}
    src={src}
    name={many ? `${name} (${n + 1} of ${images.length})` : name}
    pad="12%"
    active={n === idx}
  />
))}

        <span className="absolute left-3 top-3 z-[2] rounded-full bg-white/90 px-3 py-[5px] text-[11px] font-medium backdrop-blur-sm sm:left-[18px] sm:top-[18px]">
          {label}
        </span>
        {discount ? (
          <span className="absolute right-3 top-3 z-[2] rounded-full bg-[#b8613a] px-3 py-[5px] text-[11px] font-medium text-white sm:right-[18px] sm:top-[18px]">
            {discount}% off
          </span>
        ) : null}

        {many &&
          (["prev", "next"] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => go(dir === "prev" ? -1 : 1)}
              aria-label={dir === "prev" ? "Previous image" : "Next image"}
              className={`absolute top-1/2 z-[3] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2a231e] shadow transition hover:bg-white active:scale-90 ${dir === "prev" ? "left-3" : "right-3"}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
          ))}
      </div>

      {many && (
        <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((src, n) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={n === idx}
              aria-label={`Show image ${n + 1}`}
              onClick={() => setIdx(n)}
              className={`group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl transition sm:h-20 sm:w-20 ${n === idx ? "ring-2 ring-[#2a231e]" : "opacity-70 ring-1 ring-[#2a231e]/15 hover:opacity-100"}`}
              style={tileStyle(tile)}
            >
              <TileArt src={src} name="" pad="8%" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
