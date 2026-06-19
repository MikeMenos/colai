import { normalizeAmka } from "@/lib/utils/amka";
import {
  clearDraftAddressesList,
  setAIMaterials,
  setCustomerIsCompletelyNew,
  setCustomerProsEbs,
  setCustomerSelectedFromList,
  setDraftProperty,
  setDraftYlika,
  setLastOrderInfoCustomerErpGID,
  setLastWebOrderFromLoadInfo,
} from "@/store/orders/ordersSlice";
import type { AppDispatch } from "@/store/store";
import type { Order } from "@/types/orders";

const CUSTOMER_AND_DELIVERY_FIELDS: (keyof Order)[] = [
  "customer_amka",
  "customer_afm",
  "customer_passport",
  "customer_name",
  "customer_address",
  "customer_city",
  "customer_tk",
  "customer_tel",
  "customer_mobile",
  "customer_mobile2",
  "customer_email",
  "customer_dob",
  "customer_tel_otp",
  "amka_origin",
  "customer_ErpGID",
  "person_erpid",
  "person_ErpGID",
  "address_ErpGID",
  "shipTo_other_address",
  "customer_other_address",
  "customer_other_city",
  "customer_other_tk",
  "has_other_recipient",
  "recipient_from_erp_lookup",
  "recipient_relation_id",
  "recipient_relation",
  "recipient_reason_id",
  "recipient_reason",
  "recipient_passport",
  "recipient_amka",
  "recipient_afm",
  "recipient_name",
  "recipient_address",
  "recipient_city",
  "recipient_tk",
  "recipient_tel",
  "recipient_mobile",
  "recipient_mobile2",
  "recipient_ErpGID",
  "recipient_ErpContact_PersonGID",
  "recipient_ErpContact_AddressGID",
  "doctor_amka",
  "doctor_name",
  "doctor_afm",
  "doctor_Domi",
  "doctor_DomiTypos",
  "doctor_ErpGID",
  "has_suggested_doctor",
  "doctorSuggested_amka",
  "doctorSuggested_name",
  "doctorSuggested_afm",
  "doctorSuggested_domi",
  "doctorSuggested_tel",
  "doctorSuggested_ErpGID",
  "propose_other_suggested_doctor",
  "otherDoctorSuggested_amka",
  "otherDoctorSuggested_name",
  "otherDoctorSuggested_afm",
  "otherDoctorSuggested_domi",
  "otherDoctorSuggested_mobile",
  "shipMethodId",
  "shipMethodName",
  "shipMethod_GID",
  "deliverySunday",
  "deliveryMorning",
  "shipToOtherAddressBool",
  "shouldUpdateRecipientInfos",
  "updateRecipient_amka",
  "updateRecipient_afm",
  "updateRecipient_passport",
  "updateRecipient_address",
  "updateRecipient_tk",
  "updateRecipient_mobile",
];

const SYNTAGI_FIELDS: (keyof Order)[] = [
  "barcode",
  "dateOfSyntagi",
  "dateIsxyeiApo",
  "dateIsxyeiEos",
  "katigoriaParoxis",
  "eidos_Egkrisis",
  "eoppy_Diagnosi_Code",
  "eoppy_Diagnosi_Name",
  "eoppy_Diagnosi2_Code",
  "eoppy_Diagnosi2_Name",
  "diagnosi1_GID",
  "diagnosi2_GID",
];

const SYMMETOXi_FIELDS: (keyof Order)[] = [
  "symm",
  "symmPercentage",
  "kostos",
  "kostos_EOPPY",
  "kostos_RETAIL",
  "posoSymmetoxis",
  "posoDiscounted",
  "calculatedDiscPercent",
  "maxPosoKostousGiaSymmetoxi",
  "plafonGiftAmount",
  "payFullOrDiscount",
  "isPaid",
  "eopyyVerifyNoParticipation",
  "hasConfirmedMidenikiPliromi",
  "discount_reason_id",
  "discount_reason",
  "isDiscountApproved",
  "dateDiscountReviewed",
  "discountReviewedByUID",
  "discountReviewedByName",
  "dateDiscountNotify",
  "finalPaymentAmount",
  "countYlika",
];

const ORDER_FIELDS_TO_CLEAR: (keyof Order)[] = [
  ...CUSTOMER_AND_DELIVERY_FIELDS,
  ...SYNTAGI_FIELDS,
  ...SYMMETOXi_FIELDS,
];

export function shouldResetWizardForCustomerAmkaChange(
  baselineCustomerAmka: string | null | undefined,
  selectedCustomerAmka: string | null | undefined,
): boolean {
  const baseline = normalizeAmka(baselineCustomerAmka ?? "");
  const selected = normalizeAmka(selectedCustomerAmka ?? "");
  if (!baseline || !selected) return false;
  return baseline !== selected;
}

/** Clears patient/delivery data and Συνταγή/Υλικά/Συμμετοχή; keeps order shell and Γνωμάτευση uploads. */
export function resetDraftForDifferentCustomerSelection(
  dispatch: AppDispatch,
): void {
  dispatch(clearDraftAddressesList());
  dispatch(setLastOrderInfoCustomerErpGID(undefined));
  dispatch(setCustomerProsEbs(undefined));
  dispatch(setCustomerSelectedFromList(undefined));
  dispatch(setCustomerIsCompletelyNew(true));
  dispatch(setLastWebOrderFromLoadInfo(undefined));
  dispatch(setDraftYlika([]));
  dispatch(setAIMaterials([]));

  for (const key of ORDER_FIELDS_TO_CLEAR) {
    dispatch(setDraftProperty({ key, value: null }));
  }

  dispatch(setDraftProperty({ key: "shipTo_other_address", value: 0 }));
  dispatch(setDraftProperty({ key: "has_other_recipient", value: 0 }));
  dispatch(setDraftProperty({ key: "shipToOtherAddressBool", value: false }));
  dispatch(setDraftProperty({ key: "has_suggested_doctor", value: 0 }));
  dispatch(setDraftProperty({ key: "hasOtherSystinonIatroBool", value: false }));
  dispatch(setDraftProperty({ key: "eopyyVerifyNoParticipation", value: 0 }));
  dispatch(setDraftProperty({ key: "payFullOrDiscount", value: 0 }));
  dispatch(setDraftProperty({ key: "kostos", value: 0 }));
  dispatch(setDraftProperty({ key: "posoSymmetoxis", value: 0 }));
}
