"use client";

import { useEffect, useRef, useState } from "react";

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;

      setVisible(true);
    };

    const handleMouseOver = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;

      if (
        targetElement.closest(
          "a, button, input, textarea, select, label, [role='button'], .product-card"
        )
      ) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };

    const handleMouseDown = () => {
      setClicking(true);
    };

    const handleMouseUp = () => {
      setClicking(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    let animationFrame: number;

    const animate = () => {
      const ease = 0.14;

      current.current.x +=
        (target.current.x - current.current.x) * ease;

      current.current.y +=
        (target.current.y - current.current.y) * ease;

      if (dotRef.current) {
        dotRef.current.style.transform = `
          translate3d(
            ${current.current.x}px,
            ${current.current.y}px,
            0
          )
          translate(-50%, -50%)
        `;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);

      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className={`cursor-dot ${
        hovering ? "is-hovering" : ""
      } ${clicking ? "is-clicking" : ""} ${
        visible ? "is-visible" : ""
      }`}
    >
      <span />
    </div>
  );
}
