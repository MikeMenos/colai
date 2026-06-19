"use client";

import React from "react";

export function StepIndicator({
  steps,
  current,
  setStep,
}: {
  steps: string[];
  current: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [overflowing, setOverflowing] = React.useState(false);

  // Detect overflow (fit vs scroll)
  React.useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const check = () => {
      const isOverflow = el.scrollWidth > el.clientWidth + 1;
      setOverflowing(isOverflow);
    };

    const raf = requestAnimationFrame(check);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [steps.length]);

  // If overflowing, keep the active step centered
  React.useEffect(() => {
    if (!overflowing) return;

    const container = rowRef.current;
    const activeEl = itemRefs.current[current];
    if (!container || !activeEl) return;

    const raf = requestAnimationFrame(() => {
      const containerWidth = container.clientWidth;
      const maxScrollLeft = Math.max(0, container.scrollWidth - containerWidth);

      // center of active element relative to container scroll content
      const targetCenter = activeEl.offsetLeft + activeEl.offsetWidth / 2;
      const nextScrollLeft = Math.min(
        maxScrollLeft,
        Math.max(0, targetCenter - containerWidth / 2),
      );

      container.scrollTo({ left: nextScrollLeft, behavior: "smooth" });
    });

    return () => cancelAnimationFrame(raf);
  }, [current, overflowing]);

  return (
    <div className="app-card mb-1 p-3">
      <div
        ref={rowRef}
        className="d-flex align-items-center"
        style={{
          width: "100%",
          gap: overflowing ? 8 : 0,
          overflowX: overflowing ? "auto" : "hidden",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          paddingBottom: overflowing ? 4 : 0,
        }}
      >
        {steps.map((label, idx) => {
          const active = idx === current;

          return (
            <button
              key={`${idx}-${label}`}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              type="button"
              onClick={() => setStep(idx)}
              className="btn border-0 bg-transparent p-0"
              style={
                overflowing
                  ? { flex: "0 0 auto", minWidth: 88 }
                  : { flex: "1 1 0", minWidth: 0 }
              }
            >
              <div className="d-flex flex-column align-items-center">
                <div
                  className={
                    "d-flex align-items-center justify-content-center rounded-pill" +
                    (active
                      ? " bg-primary text-white"
                      : " bg-secondary-subtle text-secondary")
                  }
                  style={{ width: 32, height: 32, fontWeight: 700 }}
                >
                  {idx + 1}
                </div>

                <div
                  className={
                    "small mt-1 text-center" +
                    (active ? " fw-semibold" : " text-secondary")
                  }
                >
                  {label.normalize("NFC")}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
