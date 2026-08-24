"use client";

import React from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
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
        <Document
          file={url}
          loading={
            <div className="small text-secondary p-4 text-center">
              Φόρτωση…
            </div>
          }
          onLoadSuccess={({ numPages: pages }) => setNumPages(pages)}
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
      ) : null}
    </div>
  );
}
