import { Capacitor } from "@capacitor/core";
import { normalizeScannedBarcode } from "@/lib/utils/barcode";

export function isNativeBarcodeScannerAvailable(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

export async function scanBarcodeNative(): Promise<string | null> {
  const { BarcodeScanner, BarcodeFormat } = await import(
    "@capacitor-mlkit/barcode-scanning"
  );

  if (Capacitor.getPlatform() === "ios") {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera !== "granted" && camera !== "limited") {
      const requested = await BarcodeScanner.requestPermissions();
      if (requested.camera !== "granted" && requested.camera !== "limited") {
        throw new Error("Χρειάζεται πρόσβαση στην κάμερα.");
      }
    }
  }

  if (Capacitor.getPlatform() === "android") {
    const { available } =
      await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (!available) {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
    }
  }

  const { barcodes } = await BarcodeScanner.scan({
    formats: [BarcodeFormat.Code128],
    autoZoom: true,
  });

  const raw = barcodes[0]?.displayValue ?? barcodes[0]?.rawValue ?? "";
  const normalized = normalizeScannedBarcode(raw);
  return normalized || null;
}
