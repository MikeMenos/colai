"use client";

import React from "react";

type Props = {
    onRefresh: () => Promise<any> | void;
    isRefreshing?: boolean;
    threshold?: number; // px
    maxPull?: number; // px
    scrollSelector?: string; // default ".app-content"
    children: React.ReactNode;
    useSelfScroll?: boolean;
    style?: React.CSSProperties;
    className?: string;
};

function resolveScrollElement(
    useSelfScroll: boolean,
    container: HTMLDivElement | null,
    scrollSelector: string,
): HTMLElement | null {
    if (useSelfScroll) return container;

    const preferred = document.querySelector(scrollSelector) as HTMLElement | null;
    if (preferred) {
        const oy = getComputedStyle(preferred).overflowY;
        if (oy === "auto" || oy === "scroll" || oy === "overlay") {
            return preferred;
        }
    }

    return (document.scrollingElement ?? document.documentElement) as HTMLElement | null;
}

export default function PullToRefresh({
    onRefresh,
    isRefreshing = false,
    threshold = 72,
    maxPull = 120,
    useSelfScroll = false,
    scrollSelector = ".app-content",
    children,
    style,
    className,
}: Props) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const scrollElRef = React.useRef<HTMLElement | null>(null);
    const topReadyRef = React.useRef(false);
    const startYRef = React.useRef(0);
    const pullingRef = React.useRef(false);

    const [pull, setPull] = React.useState(0);
    const [armed, setArmed] = React.useState(false);

    // If parent sets isRefreshing, keep UI pinned a bit while refreshing
    React.useEffect(() => {
        if (isRefreshing) {
            setPull(threshold);
            setArmed(true);
        } else {
            setPull(0);
            setArmed(false);
        }
    }, [isRefreshing, threshold]);

    function getScrollTop() {
        return scrollElRef.current?.scrollTop ?? 0;
    }

    async function endPull() {
        pullingRef.current = false;

        // Use pull/threshold (not `armed`) to avoid stale closure issues
        if (pull >= threshold && !isRefreshing) {
            setPull(threshold);
            try {
                await onRefresh();
            } finally {
                setPull(0);
                setArmed(false);
            }
        } else {
            setPull(0);
            setArmed(false);
        }
    }

    // Native touch listeners (passive:false on move) so preventDefault works
    React.useEffect(() => {
        const scrollEl = resolveScrollElement(
            useSelfScroll,
            containerRef.current,
            scrollSelector,
        );

        scrollElRef.current = scrollEl;
        if (!scrollEl) return;

        const onTouchStart = (e: TouchEvent) => {
            if (isRefreshing) return;
            if (e.touches.length !== 1) return;

            startYRef.current = e.touches[0].clientY;

            pullingRef.current = false;

            // If we start already at top -> allow immediate pull
            const atTop = getScrollTop() <= 0;
            topReadyRef.current = atTop;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (isRefreshing) return;
            if (e.touches.length !== 1) return;

            const y = e.touches[0].clientY;
            const atTop = getScrollTop() <= 0;

            // Not at top => never pull, always allow normal scroll
            if (!atTop) {
                pullingRef.current = false;
                topReadyRef.current = false;
                setPull(0);
                setArmed(false);
                return;
            }

            // We just reached the top during an upward scroll:
            // reset baseline here so it doesn't start pulling immediately.
            if (!topReadyRef.current) {
                topReadyRef.current = true;
                startYRef.current = y;
                setPull(0);
                setArmed(false);
                return;
            }

            const dy = y - startYRef.current;

            // finger moving up or not pulling down => do nothing
            if (dy <= 0) {
                setPull(0);
                setArmed(false);
                return;
            }

            // Now we are at top and pulling down: prevent scroll and start pull-to-refresh
            if (e.cancelable) e.preventDefault();

            pullingRef.current = true;

            // rubber band
            const eased = maxPull * (1 - Math.exp(-dy / 85));
            const next = Math.min(maxPull, Math.max(0, eased));

            setPull(next);
            setArmed(next >= threshold);
        };

        const onTouchEnd = () => {
            if (!pullingRef.current) return;
            void endPull();
        };

        scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
        scrollEl.addEventListener("touchmove", onTouchMove, { passive: false });
        scrollEl.addEventListener("touchend", onTouchEnd, { passive: true });
        scrollEl.addEventListener("touchcancel", onTouchEnd, { passive: true });

        return () => {
            scrollEl.removeEventListener("touchstart", onTouchStart);
            scrollEl.removeEventListener("touchmove", onTouchMove as any);
            scrollEl.removeEventListener("touchend", onTouchEnd);
            scrollEl.removeEventListener("touchcancel", onTouchEnd);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRefreshing, threshold, maxPull, onRefresh, scrollSelector, useSelfScroll, pull]);

    const rotate = Math.min(180, (pull / threshold) * 180);
    const showSpinner = isRefreshing;

    return (
        <div
            ref={containerRef}
            className={`ptr-container ${className ?? ""}`}
            style={{
                ...(useSelfScroll
                    ? {
                        height: "100%",
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden",
                        WebkitOverflowScrolling: "touch",
                        overscrollBehavior: "contain",
                        touchAction: "pan-y",
                    }
                    : {}),
                ...style,
            }}
        >
            {/* Indicator */}
            <div
                className="ptr-indicator"
                style={{
                    height: pull,
                    opacity: pull > 2 ? 1 : 0,
                }}
            >
                <div className="ptr-pill">
                    {showSpinner ? (
                        <div
                            className="premium-loader ptr-premium-loader"
                            style={{ width: 22, height: 22 }}
                            aria-label="Ανανέωση…"
                            role="status"
                        />
                    ) : (
                        <i
                            className="bi bi-arrow-down"
                            style={{
                                transform: `rotate(${rotate}deg)`,
                                transition: pullingRef.current ? "none" : "transform 160ms ease",
                            }}
                        />
                    )}

                    <span className="ptr-text">
                        {showSpinner ? "Ανανέωση…" : armed ? "Άφησε για ανανέωση" : "Τράβηξε προς τα κάτω"}
                    </span>
                </div>
            </div>

            {/* Content shifts down smoothly */}
            <div
                className="ptr-content"
                style={{
                    transform: `translateY(${pull}px)`,
                    transition: pullingRef.current ? "none" : "transform 220ms cubic-bezier(.2,.8,.2,1)",
                }}
            >
                {children}
            </div>
        </div>
    );
}
