"use client";

import React from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { configurePdfWorker } from "@/lib/pdf/configurePdfWorker";

configurePdfWorker();

type OrderFilePdfPreviewProps = {
  url: string;
  title: string;
  active?: boolean;
};

export default function OrderFilePdfPreview({
  url,
  title,
  active = true,
}: OrderFilePdfPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const transformRef = React.useRef<ReactZoomPanPinchContentRef | null>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [numPages, setNumPages] = React.useState(0);
  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    if (!active) return;

    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, url]);

  React.useEffect(() => {
    setNumPages(0);
    setLoadError(false);
  }, [url]);

  const alignPreviewToTop = React.useCallback(() => {
    transformRef.current?.setTransform(0, 0, 1, 0);
  }, []);

  React.useEffect(() => {
    if (!active || numPages <= 0) return;

    const frame = window.requestAnimationFrame(() => {
      alignPreviewToTop();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active, alignPreviewToTop, numPages, url]);

  if (loadError) {
    return (
      <div className="small text-secondary p-4 text-center">
        Δεν ήταν δυνατή η προβολή του αρχείου.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="order-file-preview-pdf-scroll"
      aria-label={title}
    >
      {containerWidth > 0 ? (
        <TransformWrapper
          key={url}
          ref={transformRef}
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={1}
          maxScale={4}
          limitToBounds={false}
          wheel={{ step: 0.12 }}
          pinch={{ step: 5 }}
          panning={{ velocityDisabled: true }}
          doubleClick={{ mode: "toggle", step: 0.7 }}
        >
          <TransformComponent
            wrapperClass="order-file-preview-pdf-zoom-wrapper"
            contentClass="order-file-preview-pdf-zoom-content"
            wrapperStyle={{
              width: "100%",
              height: "100%",
            }}
            contentStyle={{
              width: "100%",
            }}
          >
            <Document
              file={url}
              loading={
                <div className="small text-secondary p-4 text-center">
                  Φόρτωση…
                </div>
              }
              onLoadSuccess={({ numPages: pages }) => {
                setNumPages(pages);
                window.requestAnimationFrame(() => alignPreviewToTop());
              }}
              onLoadError={() => setLoadError(true)}
            >
              {Array.from({ length: numPages }, (_, index) => (
                <Page
                  key={`page-${index + 1}`}
                  pageNumber={index + 1}
                  width={containerWidth}
                  className="order-file-preview-pdf-page"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))}
            </Document>
          </TransformComponent>
        </TransformWrapper>
      ) : null}
    </div>
  );
}
