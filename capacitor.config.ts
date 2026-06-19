import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = "https://mobileapp.amsaworks.gr/";

const config: CapacitorConfig = {
  appId: "pro.colai.mobile",
  appName: "ColAI",
  webDir: "www",
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith("http://"),
      }
    : undefined,
};

export default config;
