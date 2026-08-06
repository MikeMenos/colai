"use client";

import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

type TruncatedClickTooltipProps = {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  tooltipId?: string;
};

/**
 * Shows truncated text; if overflowed, click opens a Bootstrap tooltip with the full value.
 */
export default function TruncatedClickTooltip({
  text,
  className,
  style,
  tooltipId = "truncated-click-tooltip",
}: TruncatedClickTooltipProps) {
  const textRef = React.useRef<HTMLDivElement | null>(null);
  const [truncated, setTruncated] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const update = () => {
      setTruncated(el.scrollWidth > el.clientWidth + 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  const content = (
    <div
      className="min-w-0 flex-grow-1"
      style={{
        overflow: "hidden",
        cursor: truncated ? "pointer" : undefined,
      }}
      role={truncated ? "button" : undefined}
      tabIndex={truncated ? 0 : undefined}
    >
      <div
        ref={textRef}
        className={`text-truncate ${className ?? ""}`.trim()}
        style={style}
      >
        {text}
      </div>
    </div>
  );

  if (!truncated) return content;

  return (
    <OverlayTrigger
      trigger="click"
      rootClose
      placement="top"
      overlay={
        <Tooltip id={tooltipId} className="text-start">
          {text}
        </Tooltip>
      }
    >
      {content}
    </OverlayTrigger>
  );
}
