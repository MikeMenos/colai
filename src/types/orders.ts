import type { Nullable } from "./api/common";
import type {
  APLAT_Sales_FileItem,
  APLAT_Sales_OrderItem,
  AddressAndPersonDto,
  AddressDto,
  SaleOrder_CheckItem,
} from "./api/schemas";

/** Order wizard draft — text fields use empty string instead of API null. */
export type Order = {
  id: number;
  uid: string;
  type: string;
  userId: number;
  sellerCode: string;
  groupid: number;
  group_EOPPY_id: number;
  group_EOPPY: string;
  seller_GID: string;
  sellerPerson_GID: string;
  sellerName: string;
  dateIn: string;
  customer_amka: string;
  customer_afm: string;
  customer_passport: string;
  customer_name: string;
  customer_address: string;
  customer_city: string;
  customer_tk: string;
  customer_tel: string;
  customer_mobile?: string;
  customer_mobile2?: string;
  customer_email: string;
  customer_dob: string;
  customer_tel_otp: string;
  amka_origin: string;
  customer_ErpGID: string;
  /** Person ERP id from run-ai jsonDoc.person_erpid (null = pending EBS link). */
  person_erpid?: Nullable<string>;
  person_ErpGID: Nullable<string>;
  address_ErpGID: Nullable<string>;
  shipTo_other_address: number;
  customer_other_address: string;
  customer_other_city: string;
  customer_other_tk: string;
  customer_notes: string;
  has_other_recipient: number;
  /** 1 after choosing a person via search-erp-contacts while Παραλαβή από νέο πρόσωπο is on. */
  recipient_from_erp_lookup?: number;
  recipient_relation_id: number;
  recipient_relation: string;
  recipient_reason_id: number;
  recipient_reason: string;
  recipient_passport: string;
  recipient_amka: string;
  recipient_afm: string;
  recipient_name: string;
  recipient_address: string;
  recipient_city: string;
  recipient_tk: string;
  recipient_tel: string;
  recipient_mobile?: string;
  recipient_mobile2?: string;
  recipient_ErpGID: Nullable<string>;
  recipient_ErpContact_PersonGID?: Nullable<string>;
  recipient_ErpContact_AddressGID?: Nullable<string>;
  recipient_Notes: string;
  doctor_amka: string;
  doctor_name: string;
  doctor_afm: string;
  doctor_Domi: string;
  doctor_DomiTypos: string;
  doctor_ErpGID: string;
  has_suggested_doctor: number;
  doctorSuggested_amka: string;
  doctorSuggested_name: string;
  doctorSuggested_afm: string;
  doctorSuggested_domi: string;
  doctorSuggested_tel: string;
  doctorSuggested_ErpGID: string;
  propose_other_suggested_doctor: number;
  otherDoctorSuggested_amka: string;
  otherDoctorSuggested_name: string;
  otherDoctorSuggested_afm: string;
  otherDoctorSuggested_domi: string;
  otherDoctorSuggested_mobile: string;
  otherDoctorSuggested_ErpGID: string;
  dateOfSyntagi: string;
  dateIsxyeiApo: string;
  dateIsxyeiEos: string;
  barcode: string;
  katigoriaParoxis: string;
  symm: string;
  symmPercentage: number;
  kostos: number;
  kostos_EOPPY: number;
  kostos_RETAIL: number;
  posoSymmetoxis: number;
  posoDiscounted: Nullable<number>;
  calculatedDiscPercent: number;
  dateDiscountReviewed: string;
  discountReviewedByUID: string;
  discountReviewedByName: string;
  isDiscountApproved: number;
  discount_reason_id: number;
  discount_reason: string;
  dateDiscountNotify: string;
  eidos_Egkrisis: number;
  varos: string;
  ipsos: string;
  contact_personid: number;
  is_signed: number;
  date_signed: string;
  signedBy: string;
  dateUpdated: string;
  statusId: number;
  erpId: string;
  dateErpLinked: string;
  sellerComments: string;
  retakeFromOrderId: number;
  retakeFromOrderUID: string;
  eoppy_Diagnosi_Code: string;
  eoppy_Diagnosi_Name: string;
  eoppy_Diagnosi2_Code: string;
  eoppy_Diagnosi2_Name: string;
  diagnosi1_GID: string;
  diagnosi2_GID: string;
  countYlika: number;
  payFullOrDiscount: number;
  isPaid: number;
  hasUploadedConsentForm: number;
  isVoiceConsent: number;
  finalPaymentAmount: number;
  shipMethodId: number;
  shipMethodName: string;
  shipMethod_GID: string;
  warningInfos: string;
  origin: string;
  isRecurringOrder: number;
  deliverySunday: number;
  deliveryMorning: number;
  appliedPriceList: string;
  shipToOtherAddressBool: boolean;
  hasOtherSystinonIatroBool: boolean;
  isTempSave: number;
  aiCalculated: boolean;
  hasAnoia: boolean;
  shouldUpdateRecipientInfos?: number;
  updateRecipient_amka?: string;
  updateRecipient_afm?: string;
  updateRecipient_passport?: string;
  updateRecipient_address?: string;
  updateRecipient_tk?: string;
  updateRecipient_mobile?: string;
  eopyyVerifyNoParticipation: number;
  hasConfirmedMidenikiPliromi?: Nullable<boolean>;
  maxPosoKostousGiaSymmetoxi?: number;
  plafonGiftAmount?: number;
};

/** Line item — based on swagger `APLAT_Sales_OrderItem` with required UI numeric fields. */
export type OrderYlika = Partial<APLAT_Sales_OrderItem> & {
  id: number;
  orderId: number;
  qty: number;
  erp_Price: number;
  erp_EoppyPrice: number;
};

/** Uploaded file — based on swagger `APLAT_Sales_FileItem` plus client-only fields. */
export type OrderFile = Partial<APLAT_Sales_FileItem> & {
  document_category?: string;
  base64filename?: string;
};

export type AIMaterials = {
  anatomiki_perioxi: string;
  clean_name: string;
  diagnosi_pos_ayds: string;
  diarkeia_therapeias_se_mines: string;
  erp_products: AIMaterialsErpProducts[];
  kodikos_diagnosis: string;
  kodikos_diagnosis2: string;
  kodikos_ylikou: string;
  mhniaia_posotita_tmx: string;
  perigrafi_diagnosis: string;
  perigrafi_diagnosis2: string;
  perigrafi_ylikou: string;
  slug_name: string;
  sxolia: string;
  symmetoxi: string;
  synoliki_posotita_eidous: string;
  xronia_pathisi: string;
  matched_by?: string;
  fuzzy_matched?: number;
};

export type AIMaterialsErpProducts = {
  erp_code: string;
  erp_eoppyprice: number;
  erp_gid: string;
  erp_name: string;
  erp_price: number;
  matched_by?: string;
  fuzzy_matched?: number;
};

export type OrdeListOfSelections = {
  disabled: boolean;
  selected: boolean;
  text: string;
  value: string;
  plafonAmount?: number;
  plafonGiftAmount?: number;
};

/** Address row in the wizard — normalized from swagger `AddressDto`. */
export type OrderAddress = Required<
  Pick<AddressDto, "address_ErpGID" | "address" | "city" | "tk">
> &
  Pick<AddressDto, "isAddressPreselected">;

/** Person + addresses — normalized from swagger `AddressAndPersonDto`. */
export type OrderListOfAddressPersons = Required<
  Pick<AddressAndPersonDto, "person_ErpGID" | "personName" | "isCustomer">
> & {
  personAMKA?: string;
  personVatNumber?: string;
  personIDCode?: string;
  personPassport?: string;
  personMobile?: string;
  personMobile1?: string;
  addresses: OrderAddress[];
};

export type { SaleOrder_CheckItem };
