import type { DraftState } from "@/store/orders/ordersSlice";

const SESSION_VARIABLE_ORDER_KEYS = new Set([
  "uid",
  "sellerCode",
  "sellerName",
  "seller_GID",
  "sellerPerson_GID",
]);

const EOPYY_EMPTY_ORDER_TEMPLATE: Record<string, unknown> = {
  id: 0,
  type: "eopyy",
  userId: null,
  loggedUserSellerCode: null,
  group_EOPPY_id: 4,
  group_EOPPY: "WC",
  dateIn: null,
  customer_amka: null,
  customer_afm: null,
  customer_passport: null,
  customer_name: null,
  customer_address: null,
  customer_city: null,
  customer_tk: null,
  customer_mobile: null,
  customer_mobile2: null,
  customer_tel: null,
  customer_Notes: null,
  customer_email: null,
  customer_dob: null,
  customer_tel_otp: null,
  amka_origin: null,
  customer_ErpGID: null,
  customerPerson_ErpGID: null,
  person_ErpGID: null,
  address_ErpGID: null,
  shipTo_other_address: null,
  customer_other_address: null,
  customer_other_city: null,
  customer_other_tk: null,
  has_other_recipient: null,
  recipient_relation_id: null,
  recipient_relation: null,
  recipient_reason_id: null,
  recipient_reason: null,
  recipient_passport: null,
  recipient_amka: null,
  recipient_afm: null,
  recipient_name: null,
  recipient_address: null,
  recipient_city: null,
  recipient_tk: null,
  recipient_mobile: null,
  recipient_mobile2: null,
  recipient_tel: null,
  recipient_Notes: null,
  recipient_CreatedPersonErpGID: null,
  recipient_CreatedAddressErpGID: null,
  doctor_amka: null,
  doctor_name: null,
  doctor_afm: null,
  doctor_Domi: null,
  doctor_DomiTypos: null,
  doctor_ErpGID: null,
  has_suggested_doctor: null,
  doctorSuggested_amka: null,
  doctorSuggested_name: null,
  doctorSuggested_afm: null,
  doctorSuggested_domi: null,
  doctorSuggested_tel: null,
  doctorSuggested_ErpGID: null,
  dateOfSyntagi: "",
  dateIsxyeiApo: "",
  dateIsxyeiEos: "",
  barcode: null,
  katigoriaParoxis: null,
  symm: null,
  symmPercentage: null,
  kostos: null,
  kostos_EOPPY: null,
  kostos_RETAIL: null,
  posoSymmetoxis: null,
  posoDiscounted: null,
  calculatedDiscPercent: null,
  dateDiscountReviewed: null,
  discountReviewedByUID: null,
  discountReviewedByName: null,
  isDiscountApproved: null,
  discount_reason_id: null,
  discount_reason: null,
  dateDiscountNotify: null,
  eidos_Egkrisis: null,
  varos: null,
  ipsos: null,
  contact_personid: null,
  is_signed: null,
  date_signed: null,
  signedBy: null,
  dateUpdated: null,
  statusId: null,
  erpId: null,
  erpDocCode: null,
  dateErpLinked: null,
  sellerComments: null,
  retakeFromOrderId: null,
  retakeFromOrderUID: null,
  eoppy_Diagnosi_Code: null,
  eoppy_Diagnosi_Name: null,
  eoppy_Diagnosi2_Code: null,
  eoppy_Diagnosi2_Name: null,
  diagnosi1_GID: null,
  diagnosi2_GID: null,
  countYlika: null,
  payFullOrDiscount: null,
  isPaid: 0,
  hasUploadedConsentForm: null,
  isVoiceConsent: 0,
  finalPaymentAmount: null,
  shipMethodId: 5,
  shipMethodName: null,
  shipMethod_GID: null,
  warningInfos: null,
  origin: null,
  isRecurringOrder: null,
  deliverySaturday: null,
  deliveryMorning: null,
  eopyyVerifyNoParticipation: null,
  appliedPriceList: "eopyy",
  searchKeywords: null,
  posoPlafon: null,
  ypervasiPlafon: null,
  symmetoxiPlafon: null,
  symmetoxiEoppy: null,
  appVersion: null,
  fContactGID: null,
  personIsSameCustomer: null,
  personErp_name: null,
  addressErp_name: null,
  recipient_ErpContact_PersonGID: null,
  recipient_ErpContact_AddressGID: null,
  recipient_ErpContact_Must_Link: null,
  hasConfirmedMidenikiPliromi: null,
  shouldUpdateRecipientInfos: null,
  updateRecipient_amka: null,
  updateRecipient_afm: null,
  updateRecipient_passport: null,
  updateRecipient_address: null,
  updateRecipient_tk: null,
  updateRecipient_mobile: null,
  seriesCode: null,
  sellerSiteCode: null,
  propose_other_suggested_doctor: null,
  otherDoctorSuggested_amka: null,
  otherDoctorSuggested_name: null,
  otherDoctorSuggested_afm: null,
  otherDoctorSuggested_domi: null,
  otherDoctorSuggested_mobile: null,
  otherDoctorSuggested_ErpGID: null,
  otherDoctorSuggested_IsApproved: null,
  otherDoctorSuggested_ReviewedByUID: null,
  otherDoctorSuggested_ReviewedByName: null,
  dateOtherDoctorSuggestedNotify: null,
  otherDoctorSuggested_DateReviewed: null,
  isTempSave: 0,
};

const RETAIL_EMPTY_ORDER_TEMPLATE: Record<string, unknown> = {
  ...EOPYY_EMPTY_ORDER_TEMPLATE,
  type: "retail",
  appliedPriceList: "retail",
};

function isUnsetOrderValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "boolean") return value === false;
  if (typeof value === "number") return value === 0 || Number.isNaN(value);
  return false;
}

/** Wizard steps may lazy-init these before the user enters anything. */
function normalizeOrderForEmptyCheck(
  order: Record<string, unknown>,
): Record<string, unknown> {
  const normalized = { ...order };

  if (isUnsetOrderValue(normalized.shipMethodId)) {
    normalized.shipMethodId = 5;
  }

  if (normalized.isTempSave == null) {
    normalized.isTempSave = 0;
  }

  return normalized;
}

function orderValuesEqual(templateVal: unknown, orderVal: unknown): boolean {
  if (isUnsetOrderValue(templateVal) && isUnsetOrderValue(orderVal)) {
    return true;
  }

  if (typeof templateVal === "number" || typeof orderVal === "number") {
    return Number(templateVal) === Number(orderVal);
  }

  if (typeof templateVal === "boolean" || typeof orderVal === "boolean") {
    return Boolean(templateVal) === Boolean(orderVal);
  }

  return String(templateVal ?? "").trim() === String(orderVal ?? "").trim();
}

function resolveEmptyOrderTemplate(
  order: Record<string, unknown>,
): Record<string, unknown> {
  const type = String(order.type ?? "").trim();
  if (type === "retail") return RETAIL_EMPTY_ORDER_TEMPLATE;

  const appliedPriceList = String(order.appliedPriceList ?? "").trim();
  if (appliedPriceList === "retail") return RETAIL_EMPTY_ORDER_TEMPLATE;

  return EOPYY_EMPTY_ORDER_TEMPLATE;
}

function orderMatchesEmptyTemplate(order: Record<string, unknown>): boolean {
  const template = resolveEmptyOrderTemplate(order);
  const normalizedOrder = normalizeOrderForEmptyCheck(order);

  for (const [key, templateVal] of Object.entries(template)) {
    if (SESSION_VARIABLE_ORDER_KEYS.has(key)) continue;

    const orderVal =
      key in normalizedOrder ? normalizedOrder[key] : templateVal;

    if (!orderValuesEqual(templateVal, orderVal)) return false;
  }

  return true;
}

export type OrderWizardDraftContentInput = Pick<
  DraftState,
  "order" | "files" | "ylika" | "ai_ylika" | "synaineseisResults"
>;

export function hasOrderWizardDraftContent(
  draft: OrderWizardDraftContentInput,
): boolean {
  if (draft.files.length > 0) return true;
  if (draft.ylika.length > 0) return true;
  if (draft.ai_ylika.length > 0) return true;
  if (draft.synaineseisResults != null) return true;

  return !orderMatchesEmptyTemplate(
    draft.order as unknown as Record<string, unknown>,
  );
}
