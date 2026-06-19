import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";

import { StoreProvider } from "@/store/StoreProvider";
import { BootstrapThemeSync } from "@/components/ui/BootstrapThemeSync";
import { ViewportRuntime } from "@/components/ui/ViewportRuntime";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ColAI",
    template: "%s · ColAI",
  },
  description: "Orders and requests for Mavrogenis.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

const runtimeInitScript = `(() => {
  try {
    const themeKey = "colai_theme";
    const stored = localStorage.getItem(themeKey);
    const theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    document.documentElement.setAttribute("data-bs-theme", theme);

    const isStandalone =
      (window.matchMedia && (window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: fullscreen)").matches)) ||
      (window.navigator && window.navigator.standalone === true);

    document.documentElement.setAttribute("data-pwa", isStandalone ? "true" : "false");

    const color = theme === "dark" ? "#0b1220" : "#ffffff";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);

    document.documentElement.style.backgroundColor = color;
  } catch {}
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <script dangerouslySetInnerHTML={{ __html: runtimeInitScript }} />
      </head>
      <body>
        <StoreProvider>
          <ViewportRuntime />
          <BootstrapThemeSync />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
