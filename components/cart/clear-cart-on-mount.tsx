"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-provider";

export function ClearCartOnMount() {
  const { clear, items } = useCart();
  useEffect(() => {
    if (items.length > 0) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}