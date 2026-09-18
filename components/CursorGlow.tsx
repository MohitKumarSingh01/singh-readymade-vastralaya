"use client";

import { useEffect, useRef, useState } from "react";

export default function CursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    if (!mediaQuery.matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;

      setVisible(true);

      const element = event.target as HTMLElement;

      setHovering(
        Boolean(
          element.closest(
            "a, button, input, textarea, select, [role='button'], .product-card"
          )
        )
      );
    };

    const handlePointerDown = () => {
      setClicking(true);

      window.setTimeout(() => {
        setClicking(false);
      }, 180);
    };

    const animate = () => {
      const ease = 0.16;

      current.current.x +=
        (target.current.x - current.current.x) * ease;

      current.current.y +=
        (target.current.y - current.current.y) * ease;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `
          translate3d(
            ${current.current.x}px,
            ${current.current.y}px,
            0
          )
          translate(-50%, -50%)
        `;
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    window.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const size = clicking
    ? 72
    : hovering
    ? 56
    : 24;

  const opacity = visible ? 1 : 0;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 99999,
        opacity,
        transform: "translate(-50%, -50%)",
        transition:
          "width 220ms cubic-bezier(0.22,1,0.36,1), height 220ms cubic-bezier(0.22,1,0.36,1), opacity 180ms ease, background 220ms ease, box-shadow 220ms ease, border 220ms ease",
        border: hovering
          ? "1px solid rgba(212, 175, 55, 0.95)"
          : "1px solid rgba(212, 175, 55, 0.65)",
        background: hovering
          ? "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(47,111,179,0.12) 38%, transparent 72%)"
          : "rgba(212,175,55,0.05)",
        boxShadow: clicking
          ? "0 0 20px rgba(212,175,55,0.9), 0 0 55px rgba(212,175,55,0.65), 0 0 100px rgba(47,111,179,0.35)"
          : hovering
          ? "0 0 16px rgba(212,175,55,0.55), 0 0 40px rgba(212,175,55,0.28), 0 0 75px rgba(47,111,179,0.22)"
          : "0 0 8px rgba(212,175,55,0.35), 0 0 25px rgba(212,175,55,0.18)",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: clicking
            ? "10px"
            : hovering
            ? "7px"
            : "5px",
          height: clicking
            ? "10px"
            : hovering
            ? "7px"
            : "5px",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: clicking
            ? "#fff0a8"
            : "#d4af37",
          boxShadow: clicking
            ? "0 0 10px #fff0a8, 0 0 25px rgba(212,175,55,0.95)"
            : "0 0 7px rgba(212,175,55,0.95), 0 0 18px rgba(212,175,55,0.55)",
          transition:
            "width 180ms ease, height 180ms ease, background 180ms ease, box-shadow 180ms ease",
        }}
      />
    </div>
  );
}
