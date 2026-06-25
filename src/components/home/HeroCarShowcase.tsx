"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { isTransparentHeroAsset, publicCarImageLabel } from "@/lib/public-car-images";

const ROTATION_MS = 5000;
const CROSSFADE_MS = 700;
const MAX_HERO_VEHICLES = 4;

export function HeroCarShowcase({ images }: { images: string[] }) {
  const showcaseImages = images.slice(0, MAX_HERO_VEHICLES);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (showcaseImages.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % showcaseImages.length);
        setVisible(true);
      }, CROSSFADE_MS * 0.45);
    }, ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [showcaseImages.length]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      setParallax({
        x: offsetX * 18,
        y: offsetY * 10,
      });
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 });
  }, []);

  if (showcaseImages.length === 0) {
    return null;
  }

  const activeSrc = showcaseImages[index] ?? showcaseImages[0];
  const label = publicCarImageLabel(activeSrc);
  const usesBlendMode = !isTransparentHeroAsset(activeSrc);

  return (
    <div
      className="hero-car-stage relative mx-auto aspect-[16/10] w-full max-w-[640px] select-none"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden="true"
    >
      <p className="sr-only">{label}</p>

      {showcaseImages.map((src, imageIndex) => {
        const isActive = imageIndex === index;
        const imageUsesBlendMode = !isTransparentHeroAsset(src);

        return (
          <div
            key={src}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: isActive && visible ? 1 : 0,
              transform: isActive && visible ? "scale(1)" : "scale(0.97)",
              transition: `opacity ${CROSSFADE_MS}ms ease, transform ${CROSSFADE_MS}ms ease`,
              pointerEvents: "none",
            }}
          >
            <div
              className="relative h-[72%] w-[92%] will-change-transform"
              style={{
                transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
                transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="hero-car-float relative h-full w-full">
                <Image
                  src={src}
                  alt=""
                  fill
                  priority={imageIndex === 0}
                  sizes="(max-width: 1024px) 90vw, 560px"
                  draggable={false}
                  className={`object-contain object-center ${
                    imageUsesBlendMode
                      ? "mix-blend-screen"
                      : "mix-blend-normal"
                  } ${
                    imageUsesBlendMode
                      ? ""
                      : "drop-shadow-[0_28px_42px_rgba(15,23,42,0.14)]"
                  }`}
                />
              </div>
            </div>
          </div>
        );
      })}

      {usesBlendMode ? (
        <span className="sr-only">
          Hero vehicle imagery uses blend mode until transparent PNG or WebP assets are added to
          /public/cars/hero/.
        </span>
      ) : null}
    </div>
  );
}
