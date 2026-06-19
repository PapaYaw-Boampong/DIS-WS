"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    if (window.location.hash) {
      return;
    }

    function resetScrollPosition() {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    resetScrollPosition();
    const animationFrame = window.requestAnimationFrame(
      resetScrollPosition,
    );

    return () => window.cancelAnimationFrame(animationFrame);
  }, [pathname]);

  return null;
}
