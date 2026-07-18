"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import LogoLoader from "./logoLoader";

const INITIAL_VISIBLE_MS = 900;
const ROUTE_VISIBLE_MS = 560;
const FADE_MS = 430;
const CLICK_FALLBACK_MS = 2200;

type TimerRef = {
  current: ReturnType<typeof setTimeout> | null;
};

const clearTimer = (timerRef: TimerRef) => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
};

const isModifiedClick = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

const shouldStartForLink = (event: MouseEvent) => {
  if (event.defaultPrevented || event.button !== 0 || isModifiedClick(event)) {
    return false;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }

  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) {
    return false;
  }

  if (
    (anchor.target && anchor.target !== "_self") ||
    anchor.hasAttribute("download") ||
    anchor.dataset.noPageLoader === "true"
  ) {
    return false;
  }

  const url = new URL(anchor.href, window.location.href);

  if (url.origin !== window.location.origin) {
    return false;
  }

  return (
    url.pathname !== window.location.pathname ||
    url.search !== window.location.search
  );
};

export default function RouteTransition({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const hasSeenRoute = useRef(false);
  const startedAt = useRef(0);
  const pending = useRef(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLoader = useCallback(() => {
    clearTimer(hideTimer);
    clearTimer(removeTimer);
    clearTimer(fallbackTimer);

    pending.current = true;
    startedAt.current = Date.now();
    setIsMounted(true);
    setIsVisible(true);
  }, []);

  const hideLoader = useCallback((minimumVisibleMs = ROUTE_VISIBLE_MS) => {
    clearTimer(hideTimer);
    clearTimer(removeTimer);

    const elapsed = Date.now() - startedAt.current;
    const delay = Math.max(minimumVisibleMs - elapsed, 0);

    hideTimer.current = setTimeout(() => {
      setIsVisible(false);
      removeTimer.current = setTimeout(() => {
        pending.current = false;
        setIsMounted(false);
      }, FADE_MS);
    }, delay);
  }, []);

  useEffect(() => {
    const hasAlreadySeenRoute = hasSeenRoute.current;
    const frame = window.requestAnimationFrame(() => {
      const minimumVisibleMs = hasAlreadySeenRoute
        ? ROUTE_VISIBLE_MS
        : INITIAL_VISIBLE_MS;

      showLoader();
      hideLoader(minimumVisibleMs);
      hasSeenRoute.current = true;
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pathname, showLoader, hideLoader]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!shouldStartForLink(event)) {
        return;
      }

      showLoader();
      fallbackTimer.current = setTimeout(() => {
        if (pending.current) {
          hideLoader(ROUTE_VISIBLE_MS);
        }
      }, CLICK_FALLBACK_MS);
    };

    const handlePopState = () => {
      showLoader();
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      clearTimer(hideTimer);
      clearTimer(removeTimer);
      clearTimer(fallbackTimer);
    };
  }, [showLoader, hideLoader]);

  return (
    <>
      <div key={pathname ?? "route"} className="route-transition-content">
        {children}
      </div>
      {isMounted && <LogoLoader visible={isVisible} />}
    </>
  );
}
