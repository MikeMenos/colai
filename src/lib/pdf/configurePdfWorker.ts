import { pdfjs } from "react-pdf";

let configured = false;

export function configurePdfWorker() {
  if (configured || typeof window === "undefined") return;

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  configured = true;
}
