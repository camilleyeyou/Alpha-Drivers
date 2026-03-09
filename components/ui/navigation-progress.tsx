"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const startProgress = useCallback(() => {
    setVisible(true);
    setProgress(0);
    // Animate to ~80% quickly, then slow down
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 80) {
        current = 80 + Math.random() * 5;
        clearInterval(interval);
      }
      setProgress(current);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const completeProgress = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, []);

  // Complete on route change
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams, completeProgress]);

  // Intercept link clicks to start progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Skip external links, anchors, and same-page links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank"
      ) {
        return;
      }

      // Skip if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Don't start if already on this path
      if (href === pathname) return;

      startProgress();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname, startProgress]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px]"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full bg-primary-500 transition-all duration-300 ease-out shadow-glow-green"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
          transition:
            progress >= 100
              ? "width 200ms ease-out, opacity 300ms ease-out 100ms"
              : "width 300ms ease-out",
        }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  );
}
