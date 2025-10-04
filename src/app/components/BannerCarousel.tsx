'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Banner = { src: string; alt: string };

export default function BannerCarousel({
  images,
  intervalMs = 5000,
}: {
  images: Banner[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || images.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [paused, images.length, intervalMs]);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-gray-200/70 bg-gray-50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Aspect ratio */}
      <div className="relative h-64 sm:h-80 lg:h-[420px]">
        {images.map((img, i) => (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Futuristic overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/10" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ))}

        {/* Controls */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
          <button
            aria-label="Previous banner"
            onClick={prev}
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            aria-label="Next banner"
            onClick={next}
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-black/30 px-2 py-1 backdrop-blur">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-4 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Badge */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm backdrop-blur">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Kenya-first
        </div>
      </div>
    </div>
  );
}