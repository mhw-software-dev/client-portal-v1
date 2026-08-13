"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function routeKeyFromUrl(url: URL) {
  return `${url.pathname}${url.search}`;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const currentRoute = pathname;
  const isNavigating = pendingRoute !== null && pendingRoute !== currentRoute;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (isModifiedClick(event)) return;

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const nextUrl = new URL(anchor.href, window.location.href);

      if (nextUrl.origin !== window.location.origin) return;
      if (nextUrl.href === window.location.href) return;

      setPendingRoute(routeKeyFromUrl(nextUrl));
    }

    function handlePageShow() {
      setPendingRoute(null);
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  useEffect(() => {
    if (!isNavigating) return;

    const timeout = window.setTimeout(() => {
      setPendingRoute(null);
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, [isNavigating]);

  if (!isNavigating) return null;

  return (
    <div className="mhw-route-progress" aria-label="Loading page" role="status">
      <span />
    </div>
  );
}
