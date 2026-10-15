"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface AnnotatedTextProps {
  children: ReactNode;
  color?: string;
  animate?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}

function createUnderlinePath() {
  let seed = 23;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const points = Array.from({ length: 13 }, (_, index) => {
    const progress = index / 12;
    const endpoint = index === 0 || index === 12 ? 0 : 1;

    return {
      x: 3 + progress * 134 + (random() - 0.5) * endpoint,
      y:
        6 -
        progress -
        Math.sin(progress * Math.PI) * 2 +
        (random() - 0.5) * endpoint,
    };
  });
  const [first, ...rest] = points;
  let path = `M${first!.x.toFixed(2)},${first!.y.toFixed(2)}`;

  rest.forEach((point, index) => {
    const next = rest[index + 1];
    if (!next) {
      path += ` L${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      return;
    }
    path += ` Q${point.x.toFixed(2)},${point.y.toFixed(2)} ${((point.x + next.x) / 2).toFixed(2)},${((point.y + next.y) / 2).toFixed(2)}`;
  });

  return path;
}

const underlinePath = createUnderlinePath();

export function AnnotatedText({
  children,
  color = "text-primary",
  animate = true,
  delay = 0,
  duration = 0.65,
  className,
}: AnnotatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || !animate || reducedMotion.matches) return;

    const drawing = element.querySelector<SVGPathElement>(
      "[data-annotation-drawing]",
    );
    if (!drawing) return;

    const animation = drawing.animate(
      [
        { strokeDasharray: "1", strokeDashoffset: "1", opacity: 0, offset: 0 },
        {
          strokeDasharray: "1",
          strokeDashoffset: "0.999",
          opacity: 1,
          offset: 0.001,
        },
        { strokeDasharray: "1", strokeDashoffset: "0", opacity: 1, offset: 1 },
      ],
      {
        duration: Math.max(0, duration) * 1000,
        delay: Math.max(0, delay) * 1000,
        easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        fill: "backwards",
      },
    );
    animation.pause();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        animation.play();
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(element);

    const stopForReducedMotion = () => {
      if (!reducedMotion.matches) return;
      observer.disconnect();
      animation.cancel();
    };
    reducedMotion.addEventListener("change", stopForReducedMotion);

    return () => {
      observer.disconnect();
      animation.cancel();
      reducedMotion.removeEventListener("change", stopForReducedMotion);
    };
  }, [animate, delay, duration]);

  return (
    <span
      ref={ref}
      className={`relative inline-block whitespace-nowrap ${className ?? ""}`}
    >
      {children}
      <svg
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-[-0.32em] left-[-1%] h-[0.5em] w-[102%] ${color}`}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 140 10"
      >
        <path
          d={underlinePath}
          data-annotation-drawing
          pathLength={1}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
      </svg>
    </span>
  );
}
