import type { Order } from "@/types/orders";

export const YPERVASI_PLAFON_THRESHOLD = 6;

export function getPlafonCeilingForCategory(order: {
  katigoriaParoxis?: string | null;
  posoPlafon?: number | null;
  maxPosoKostousGiaSymmetoxi?: number | null;
}): number {
  const categoryPlafon = Number(order.maxPosoKostousGiaSymmetoxi ?? 0);

  if (order.katigoriaParoxis?.trim() && categoryPlafon > 0) {
    return categoryPlafon;
  }

  const posoPlafon = Number(order.posoPlafon ?? 0);
  if (Number.isFinite(posoPlafon) && posoPlafon > 0) {
    return posoPlafon;
  }

  return categoryPlafon;
}

export function getYpervasiPlafonAmount(order: {
  kostos?: number | null;
  katigoriaParoxis?: string | null;
  posoPlafon?: number | null;
  maxPosoKostousGiaSymmetoxi?: number | null;
}): number {
  return Number(order.kostos ?? 0) - getPlafonCeilingForCategory(order);
}

export function shouldShowYpervasiPlafonStep(order: {
  kostos?: number | null;
  katigoriaParoxis?: string | null;
  posoPlafon?: number | null;
  maxPosoKostousGiaSymmetoxi?: number | null;
  eidos_Egkrisis?: number | null;
}): boolean {
  return (
    getYpervasiPlafonAmount(order) > YPERVASI_PLAFON_THRESHOLD &&
    Number(order.eidos_Egkrisis) === 1
  );
}

export function calcPosoSymmetoxisForOrder(
  order: Pick<
    Order,
    | "kostos"
    | "katigoriaParoxis"
    | "posoPlafon"
    | "maxPosoKostousGiaSymmetoxi"
    | "plafonGiftAmount"
    | "symmPercentage"
    | "eidos_Egkrisis"
    | "type"
  >,
): number {
  const kostos = Number(order.kostos ?? 0);
  const symmPercentage = Number(order.symmPercentage ?? 0);
  const plafonCeiling = getPlafonCeilingForCategory(order);
  const plafonGiftAmount = Number(order.plafonGiftAmount ?? 0);
  const eidosEgkrisis = order.eidos_Egkrisis;
  const type = order.type;

  if (
    plafonCeiling > 0 &&
    kostos > plafonCeiling &&
    eidosEgkrisis == 1 &&
    type == "eopyy"
  ) {
    const diafora = kostos - plafonCeiling;
    return (
      (plafonCeiling * symmPercentage) / 100 +
      (diafora > plafonGiftAmount ? diafora : 0)
    );
  }

  return kostos * (symmPercentage / 100);
}
