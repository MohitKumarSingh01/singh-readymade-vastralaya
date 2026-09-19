"use client";

import { useEffect, useState } from "react";

export default function CartCount() {
  const [count, setCount] = useState(0);

  function updateCount() {
    try {
      const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const total = cart.reduce(
        (sum: number, item: any) =>
          sum + (Number(item.qty) || 0),
        0
      );

      setCount(total);
    } catch {
      setCount(0);
    }
  }

  useEffect(() => {
    updateCount();

    window.addEventListener(
      "cart-updated",
      updateCount
    );

    window.addEventListener(
      "storage",
      updateCount
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        updateCount
      );

      window.removeEventListener(
        "storage",
        updateCount
      );
    };
  }, []);

  return <span>Bag ({count})</span>;
}
