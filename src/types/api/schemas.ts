/**
 * Swagger schema types from AMSA REST API v1.
 * Source: https://sales.amsaworks.gr/apidocs/swagger/v1/swagger.json
 */

import type {
  KatigoriaParoxisItem,
  Nullable,
  PagingResults,
  SelectListItem,
} from "./common";

export type APLAT_Sales_FileItem = {
  id: number;
  uid?: Nullable<string>;
  orderId?: Nullable<number>;
  orderUID?: Nullable<string>;
  originalFileName?: Nullable<string>;
  name?: Nullable<string>;
  friendlyName?: Nullable<string>;
  fileType?: Nullable<string>;
  fileSize?: Nullable<string>;
  documentCategory?: Nullable<string>;
  extractedText?: Nullable<string>;
  dateIn?: Nullable<string>;
  sellerComments?: Nullable<string>;
  adminComments?: Nullable<string>;
  useInAI?: Nullable<number>;
  position?: Nullable<number>;
  hasValidData?: Nullable<number>;
  scoreFromAI?: Nullable<number>;
  scoreFromPlatform?: Nullable<number>;
};

export type APLAT_Sales_Order = {
  id: number;
  uid?: Nullable<string>;
  type?: Nullable<string>;
  userId?: Nullable<number>;
  loggedUserSellerCode?: Nullable<string>;
  sellerCode?: Nullable<string>;
  group_EOPPY_id?: Nullable<number>;
  group_EOPPY?: Nullable<string>;
  seller_GID?: Nullable<string>;
  sellerPerson_GID?: Nullable<string>;
  sellerName?: Nullable<string>;
  dateIn?: Nullable<string>;
  customer_amka?: Nullable<string>;
  customer_passport?: Nullable<string>;
  customer_name?: Nullable<string>;
  customer_address?: Nullable<string>;
  customer_city?: Nullable<string>;
  customer_tk?: Nullable<string>;
  customer_mobile?: Nullable<string>;
  customer_mobile2?: Nullable<string>;
  customer_tel?: Nullable<string>;
  customer_Notes?: Nullable<string>;
  customer_email?: Nullable<string>;
  customer_dob?: Nullable<string>;
  customer_tel_otp?: Nullable<string>;
  amka_origin?: Nullable<string>;
  customer_ErpGID?: Nullable<string>;
  customerPerson_ErpGID?: Nullable<string>;
  person_ErpGID?: Nullable<string>;
  address_ErpGID?: Nullable<string>;
  shipTo_other_address?: Nullable<number>;
  customer_other_address?: Nullable<string>;
  customer_other_city?: Nullable<string>;
  customer_other_tk?: Nullable<string>;
  has_other_recipient?: Nullable<number>;
  recipient_relation_id?: Nullable<number>;
  recipient_relation?: Nullable<string>;
  recipient_reason_id?: Nullable<number>;
  recipient_reason?: Nullable<string>;
  recipient_passport?: Nullable<string>;
  recipient_amka?: Nullable<string>;
  recipient_afm?: Nullable<string>;
  recipient_name?: Nullable<string>;
  recipient_address?: Nullable<string>;
  recipient_city?: Nullable<string>;
  recipient_tk?: Nullable<string>;
  recipient_mobile?: Nullable<string>;
  recipient_mobile2?: Nullable<string>;
  recipient_tel?: Nullable<string>;
  recipient_Notes?: Nullable<string>;
  recipient_CreatedPersonErpGID?: Nullable<string>;
  recipient_CreatedAddressErpGID?: Nullable<string>;
  doctor_amka?: Nullable<string>;
  doctor_name?: Nullable<string>;
  doctor_afm?: Nullable<string>;
  doctor_Domi?: Nullable<string>;
  doctor_DomiTypos?: Nullable<string>;
  doctor_ErpGID?: Nullable<string>;
  has_suggested_doctor?: Nullable<number>;
  doctorSuggested_amka?: Nullable<string>;
  doctorSuggested_name?: Nullable<string>;
  doctorSuggested_afm?: Nullable<string>;
  doctorSuggested_domi?: Nullable<string>;
  doctorSuggested_tel?: Nullable<string>;
  doctorSuggested_ErpGID?: Nullable<string>;
  propose_other_suggested_doctor?: Nullable<number>;
  otherDoctorSuggested_amka?: Nullable<string>;
  otherDoctorSuggested_name?: Nullable<string>;
  otherDoctorSuggested_afm?: Nullable<string>;
  otherDoctorSuggested_domi?: Nullable<string>;
  otherDoctorSuggested_mobile?: Nullable<string>;
  otherDoctorSuggested_ErpGID?: Nullable<string>;
  dateOfSyntagi?: Nullable<string>;
  dateIsxyeiApo?: Nullable<string>;
  dateIsxyeiEos?: Nullable<string>;
  barcode?: Nullable<string>;
  katigoriaParoxis?: Nullable<string>;
  symm?: Nullable<string>;
  symmPercentage?: Nullable<number>;
  kostos?: Nullable<number>;
  kostos_EOPPY?: Nullable<number>;
  kostos_RETAIL?: Nullable<number>;
  posoSymmetoxis?: Nullable<number>;
  posoDiscounted?: Nullable<number>;
  calculatedDiscPercent?: Nullable<number>;
  dateDiscountReviewed?: Nullable<string>;
  discountReviewedByUID?: Nullable<string>;
  discountReviewedByName?: Nullable<string>;
  isDiscountApproved?: Nullable<number>;
  discount_reason_id?: Nullable<number>;
  discount_reason?: Nullable<string>;
  dateDiscountNotify?: Nullable<string>;
  eidos_Egkrisis?: Nullable<number>;
  varos?: Nullable<string>;
  ipsos?: Nullable<string>;
  contact_personid?: Nullable<number>;
  is_signed?: Nullable<number>;
  date_signed?: Nullable<string>;
  signedBy?: Nullable<string>;
  dateUpdated?: Nullable<string>;
  statusId?: Nullable<number>;
  erpId?: Nullable<string>;
  erpDocCode?: Nullable<string>;
  dateErpLinked?: Nullable<string>;
  sellerComments?: Nullable<string>;
  retakeFromOrderId?: Nullable<number>;
  retakeFromOrderUID?: Nullable<string>;
  eoppy_Diagnosi_Code?: Nullable<string>;
  eoppy_Diagnosi_Name?: Nullable<string>;
  eoppy_Diagnosi2_Code?: Nullable<string>;
  eoppy_Diagnosi2_Name?: Nullable<string>;
  diagnosi1_GID?: Nullable<string>;
  diagnosi2_GID?: Nullable<string>;
  countYlika?: Nullable<number>;
  payFullOrDiscount?: Nullable<number>;
  isPaid?: Nullable<number>;
  hasUploadedConsentForm?: Nullable<number>;
  isVoiceConsent?: Nullable<number>;
  finalPaymentAmount?: Nullable<number>;
  shipMethodId?: Nullable<number>;
  shipMethodName?: Nullable<string>;
  shipMethod_GID?: Nullable<string>;
  warningInfos?: Nullable<string>;
  origin?: Nullable<string>;
  isRecurringOrder?: Nullable<number>;
  deliverySaturday?: Nullable<number>;
  deliveryMorning?: Nullable<number>;
  eopyyVerifyNoParticipation?: Nullable<number>;
  appliedPriceList?: Nullable<string>;
  searchKeywords?: Nullable<string>;
  posoPlafon?: Nullable<number>;
  ypervasiPlafon?: Nullable<number>;
  symmetoxiPlafon?: Nullable<number>;
  symmetoxiEoppy?: Nullable<number>;
  appVersion?: Nullable<string>;
  fContactGID?: Nullable<string>;
  personIsSameCustomer?: Nullable<number>;
  personErp_name?: Nullable<string>;
  addressErp_name?: Nullable<string>;
  recipient_ErpContact_PersonGID?: Nullable<string>;
  recipient_ErpContact_AddressGID?: Nullable<string>;
  recipient_ErpContact_Must_Link?: Nullable<number>;
  hasConfirmedMidenikiPliromi?: Nullable<boolean>;
  shouldUpdateRecipientInfos?: Nullable<number>;
  updateRecipient_amka?: Nullable<string>;
  updateRecipient_afm?: Nullable<string>;
  updateRecipient_passport?: Nullable<string>;
  updateRecipient_address?: Nullable<string>;
  updateRecipient_tk?: Nullable<string>;
  updateRecipient_mobile?: Nullable<string>;
  seriesCode?: Nullable<string>;
  sellerSiteCode?: Nullable<string>;
};

export type APLAT_Sales_OrderItem = {
  id: number;
  uid?: Nullable<string>;
  orderId: number;
  orderUID?: Nullable<string>;
  lineNum?: Nullable<number>;
  dateIn?: Nullable<string>;
  dateUpdated?: Nullable<string>;
  erpGid?: Nullable<string>;
  erpCode?: Nullable<string>;
  erpName?: Nullable<string>;
  qty?: Nullable<number>;
  price?: Nullable<number>;
  adhesiveType?: Nullable<string>;
  thicknessType?: Nullable<string>;
  eoppy_Code?: Nullable<string>;
  eoppy_Name?: Nullable<string>;
  eoppy_Diagnosi_Code?: Nullable<string>;
  eoppy_Diagnosi_Name?: Nullable<string>;
  eoppy_Symmetoxi?: Nullable<string>;
  eoppy_AnatomPerioxi?: Nullable<string>;
  eoppy_DiarkiaTherapias?: Nullable<string>;
  eoppy_SynPosotita?: Nullable<string>;
  eoppy_Sxolia?: Nullable<string>;
  eoppy_Diagnosi2_Code?: Nullable<string>;
  eoppy_Diagnosi2_Name?: Nullable<string>;
  eoppy_CleanName?: Nullable<string>;
  eoppy_SlugName?: Nullable<string>;
  erp_Price?: Nullable<number>;
  erp_EoppyPrice?: Nullable<number>;
  aiMatchedErpGid?: Nullable<string>;
  aiMatchedBy?: Nullable<string>;
  fuzzyMatched?: Nullable<number>;
};

export type SaveOrderReq = {
  order: APLAT_Sales_Order;
  ylika?: Nullable<APLAT_Sales_OrderItem[]>;
  isTempSave?: Nullable<number>;
};

export type SaleOrder_ErrorMode = 0 | 1 | 400 | 500;

export type SaleOrderIssueCode =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11;

export type SaleOrder_CheckItem = {
  name?: Nullable<string>;
  errorMode?: SaleOrder_ErrorMode;
  issueCode?: SaleOrderIssueCode;
  showInWarnings: boolean;
  isOk: boolean;
  bgColor?: Nullable<string>;
  faIcon?: Nullable<string>;
};

export type OrderPreviewVM = {
  order: APLAT_Sales_Order;
  items?: Nullable<APLAT_Sales_OrderItem[]>;
  files?: Nullable<APLAT_Sales_FileItem[]>;
  check_errors?: Nullable<SaleOrder_CheckItem[]>;
};

export type OrderEditVM = {
  isSuccess: boolean;
  message?: Nullable<string>;
  errorMessage?: Nullable<string>;
  sellerCode?: Nullable<string>;
  sellerName?: Nullable<string>;
  order: APLAT_Sales_Order;
  items?: Nullable<APLAT_Sales_OrderItem[]>;
  files?: Nullable<APLAT_Sales_FileItem[]>;
  list_GroupEoppy?: Nullable<SelectListItem[]>;
  list_LogosParalipti?: Nullable<SelectListItem[]>;
  list_SygeniaParalipti?: Nullable<SelectListItem[]>;
  list_TroposApostolis?: Nullable<SelectListItem[]>;
  list_DiscountReasons?: Nullable<SelectListItem[]>;
  wcFilterItems?: Nullable<WcDiadikasiaFilterAccessItems>;
  list_KatigoriesParoxis?: Nullable<KatigoriaParoxisItem[]>;
  showIpsosVaros: boolean;
  /** Present in some edit responses; not in swagger but used by the app. */
  ai_ylika?: Nullable<EopyDoc_Ylika[]>;
};

export type OrderEditItemResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data: OrderEditVM;
};

export type OrderViewItemResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data: OrderPreviewVM;
};

export type OrdersQuickStats = {
  newCustomers: number;
  newPersons: number;
  ordersTotal: number;
  ordersSentToERP: number;
  ordersPending: number;
  ordersSubmitted: number;
};

export type OrderGetItemsVM = {
  search?: Nullable<string>;
  start?: Nullable<string>;
  end?: Nullable<string>;
  orderby?: Nullable<string>;
  statusid?: Nullable<number>;
  groupid?: Nullable<number>;
  discountstatusid?: Nullable<number>;
  descriptionForDates?: Nullable<string>;
  page: number;
  pagesize: number;
  mydata?: Nullable<APLAT_Sales_Order[]>;
  quickStats?: OrdersQuickStats;
  paging_item?: Nullable<PagingResults>;
};

export type ListOrdersResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data: OrderGetItemsVM;
};

export type AddressDto = {
  address_ErpGID?: Nullable<string>;
  address?: Nullable<string>;
  city?: Nullable<string>;
  tk?: Nullable<string>;
  isAddressPreselected: boolean;
};

export type AddressAndPersonDto = {
  person_ErpGID?: Nullable<string>;
  personName?: Nullable<string>;
  personVatNumber?: Nullable<string>;
  personAMKA?: Nullable<string>;
  personIDCode?: Nullable<string>;
  personPassport?: Nullable<string>;
  personMobile1?: Nullable<string>;
  personMobile2?: Nullable<string>;
  personTel1?: Nullable<string>;
  addresses?: Nullable<AddressDto[]>;
  isCustomer: boolean;
  isPersonPreselected: boolean;
  textDisplay?: Nullable<string>;
};

export type SearchAddresses_Response = {
  isSuccess: boolean;
  message?: Nullable<string>;
  errorMessage?: Nullable<string>;
  addresses?: Nullable<AddressAndPersonDto[]>;
  customerAMKA?: Nullable<string>;
  customerName?: Nullable<string>;
  customerAddress?: Nullable<string>;
  customer_GID?: Nullable<string>;
  preselected_address_GID?: Nullable<string>;
  preselected_person_GID?: Nullable<string>;
};

export type COLAI_T_CUSTOMER_PERSONAL_INFO = {
  tR_GID: string;
  tR_Code?: Nullable<string>;
  tR_Name?: Nullable<string>;
  tR_StringField5?: Nullable<string>;
  tR_fPersonCodeGID?: Nullable<string>;
  iS_CERTIFIED_PHONE?: Nullable<number>;
  tR_REMARKS?: Nullable<string>;
  pE_GID?: Nullable<string>;
  pE_Code?: Nullable<string>;
  pE_NAME?: Nullable<string>;
  pE_ActivityCode?: Nullable<string>;
  pE_TaxRegNum?: Nullable<string>;
  pE_DEAD_ALIVE?: Nullable<number>;
  pE_REMARKS?: Nullable<string>;
  peS_FSiteGID?: Nullable<string>;
  peS_Address1?: Nullable<string>;
  peS_CityCode?: Nullable<string>;
  peS_Area?: Nullable<string>;
  peS_FPOSTALCODE?: Nullable<string>;
  peS_STATUS?: Nullable<number>;
  peS_KindSite?: Nullable<number>;
  tR_Name_Greeklish?: Nullable<string>;
  peS_TEL_1?: Nullable<string>;
  telephone1?: Nullable<string>;
  taytothta?: Nullable<string>;
};

export type OrderPlatformPreviousDto = {
  id: number;
  barcode?: Nullable<string>;
  customer_ErpGID?: Nullable<string>;
  customerPerson_ErpGID?: Nullable<string>;
  person_ErpGID?: Nullable<string>;
  address_ErpGID?: Nullable<string>;
  customer_amka?: Nullable<string>;
  customer_name?: Nullable<string>;
  customer_passport?: Nullable<string>;
  customer_mobile?: Nullable<string>;
  customer_mobile2?: Nullable<string>;
  customer_tel?: Nullable<string>;
  customer_email?: Nullable<string>;
  customer_dob?: Nullable<string>;
  customer_address?: Nullable<string>;
  customer_city?: Nullable<string>;
  customer_tk?: Nullable<string>;
  shipMethodId?: Nullable<number>;
  customer_Notes?: Nullable<string>;
  shipTo_other_address?: Nullable<number>;
  customer_other_address?: Nullable<string>;
  customer_other_city?: Nullable<string>;
  customer_other_tk?: Nullable<string>;
  has_other_recipient?: Nullable<number>;
  recipient_reason_id?: Nullable<number>;
  recipient_relation_id?: Nullable<number>;
  recipient_name?: Nullable<string>;
  recipient_passport?: Nullable<string>;
  recipient_amka?: Nullable<string>;
  recipient_afm?: Nullable<string>;
  recipient_mobile?: Nullable<string>;
  recipient_mobile2?: Nullable<string>;
  recipient_tel?: Nullable<string>;
  recipient_address?: Nullable<string>;
  recipient_city?: Nullable<string>;
  recipient_tk?: Nullable<string>;
  recipient_Notes?: Nullable<string>;
  has_suggested_doctor?: Nullable<number>;
  doctorSuggested_amka?: Nullable<string>;
  doctorSuggested_name?: Nullable<string>;
  doctorSuggested_afm?: Nullable<string>;
  doctorSuggested_domi?: Nullable<string>;
  doctorSuggested_tel?: Nullable<string>;
  doctorSuggested_ErpGID?: Nullable<string>;
  recipient_CreatedPersonErpGID?: Nullable<string>;
  recipient_CreatedAddressErpGID?: Nullable<string>;
  dateIn?: Nullable<string>;
};

export type OrderErpPreviousDto = {
  customerGID?: Nullable<string>;
  customerPersonGID?: Nullable<string>;
  deliveryPersonGID?: Nullable<string>;
  deliveryAddressGID?: Nullable<string>;
  suggestedDoctorGID?: Nullable<string>;
  customerAMKA?: Nullable<string>;
  suggestedDoctor_amka?: Nullable<string>;
  suggestedDoctor_name?: Nullable<string>;
  suggestedDoctor_afm?: Nullable<string>;
  suggestedDoctor_domi?: Nullable<string>;
  suggestedDoctor_tel?: Nullable<string>;
  registrationDate?: Nullable<string>;
  documentCode?: Nullable<string>;
};

export type SearchCustomers_Response = {
  isSuccess: boolean;
  message?: Nullable<string>;
  errorMessage?: Nullable<string>;
  listCustomers?: Nullable<COLAI_T_CUSTOMER_PERSONAL_INFO[]>;
  mode?: Nullable<string>;
  searchTerm?: Nullable<string>;
  lastCustomerWebOrder?: Nullable<OrderPlatformPreviousDto>;
  lastErpOrder?: Nullable<OrderErpPreviousDto>;
};

export type SearchErpContactsResponse = {
  isSuccess: boolean;
  message?: Nullable<string>;
  errorMessage?: Nullable<string>;
  contacts?: Nullable<AddressAndPersonDto[]>;
};

export type COLAI_T_DOCTORS = {
  code?: Nullable<string>;
  codE2?: Nullable<string>;
  doctoR_CODE?: Nullable<string>;
  doctoR_NAME?: Nullable<string>;
  greeklisH_DOCT_NAME?: Nullable<string>;
  speC_ID?: Nullable<string>;
  eidikotita?: Nullable<string>;
  domI_ID?: Nullable<string>;
  domi?: Nullable<string>;
  gid?: Nullable<string>;
  doctoR_AMKA?: Nullable<string>;
  doctoR_AFM?: Nullable<string>;
  mobile1?: Nullable<string>;
  mobile2?: Nullable<string>;
};

export type SearchDoctors_Response = {
  isSuccess: boolean;
  message?: Nullable<string>;
  errorMessage?: Nullable<string>;
  listDoctors?: Nullable<COLAI_T_DOCTORS[]>;
  mode?: Nullable<string>;
  searchTerm?: Nullable<string>;
};

export type EopyDoc_ErpMappedProduct = {
  erp_gid?: Nullable<string>;
  erp_code?: Nullable<string>;
  erp_name?: Nullable<string>;
  erp_price?: Nullable<number>;
  erp_eoppyprice?: Nullable<number>;
  matched_by?: Nullable<string>;
  fuzzy_matched?: Nullable<number>;
};

export type SearchErpItems_Response = {
  isSuccess: boolean;
  message?: Nullable<string>;
  errorMessage?: Nullable<string>;
  items?: Nullable<EopyDoc_ErpMappedProduct[]>;
};

export type LoadLastCustomerOrderReq = {
  customer_gid?: Nullable<string>;
  customer_amka?: Nullable<string>;
  order_eopyy_group_id?: Nullable<number>;
};

export type CustomerLastOrdersInfoResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  last_web_order?: Nullable<OrderPlatformPreviousDto>;
  last_erp_order?: Nullable<OrderErpPreviousDto>;
};

export type PhoneContactItem = {
  name?: Nullable<string>;
  phone?: Nullable<string>;
  isFromCustomer: boolean;
};

export type CustomerContactItem = {
  customerAMKA?: Nullable<string>;
  customerGID?: Nullable<string>;
  customerName?: Nullable<string>;
  telephones?: Nullable<PhoneContactItem[]>;
  emails?: Nullable<string[]>;
};

export type CustomerContactInfoResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data?: Nullable<CustomerContactItem>;
};

export type StoxoiMina = {
  count_paragg_new: number;
  count_paragg_repeat: number;
  amount_paragg_new: number;
  amount_paragg_repeat: number;
};

export type DashboardVM = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  totalOrders_month: number;
  totalOrders_prev_month: number;
  totalOrders_month_perc: number;
  pendingReviews: number;
  next10DaysSyntages: number;
  lastOrders?: Nullable<APLAT_Sales_Order[]>;
  wC_stoixoi_mina?: Nullable<StoxoiMina>;
};

export type StaticDataResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  list_GroupEoppy?: Nullable<SelectListItem[]>;
  list_OtherRecipientReason?: Nullable<SelectListItem[]>;
  list_OtherRecipientRelationship?: Nullable<SelectListItem[]>;
  list_ShipMethod?: Nullable<SelectListItem[]>;
  list_DiscountReasons?: Nullable<SelectListItem[]>;
  list_Order_Statuses?: Nullable<SelectListItem[]>;
  list_Discount_Statuses?: Nullable<SelectListItem[]>;
  list_Order_Types?: Nullable<SelectListItem[]>;
  list_Order_EidosEgkrisis?: Nullable<SelectListItem[]>;
  list_Order_PriceList?: Nullable<SelectListItem[]>;
  list_DocumentTypes?: Nullable<SelectListItem[]>;
  /** Returned by backend in practice; used by order wizard static lists. */
  list_KatigoriesParoxis?: Nullable<KatigoriaParoxisItem[]>;
};

export type DiscountReq_OrderVM = {
  id: number;
  uid?: Nullable<string>;
  barcode?: Nullable<string>;
  dateOfSyntagi?: Nullable<string>;
  dateIn?: Nullable<string>;
  type?: Nullable<string>;
  type_descr?: Nullable<string>;
  group_EOPPY?: Nullable<string>;
  customer_name?: Nullable<string>;
  customer_amka?: Nullable<string>;
  doctor_name?: Nullable<string>;
  doctor_amka?: Nullable<string>;
  sellerCode?: Nullable<string>;
  sellerName?: Nullable<string>;
  statusId?: Nullable<number>;
  kostos?: Nullable<number>;
  symmPercentage?: Nullable<number>;
  posoSymmetoxis?: Nullable<number>;
  posoDiscounted?: Nullable<number>;
  calculatedDiscPercent?: Nullable<number>;
  isDiscountApproved?: Nullable<number>;
  dateDiscountReviewed?: Nullable<string>;
  discountReviewedByName?: Nullable<string>;
  discount_reason?: Nullable<string>;
};

export type DiscountRequestsGetItemsVM = {
  search?: Nullable<string>;
  start?: Nullable<string>;
  end?: Nullable<string>;
  orderby?: Nullable<string>;
  discountstatus?: Nullable<number>;
  groupid?: Nullable<number>;
  descriptionForDates?: Nullable<string>;
  page: number;
  pagesize: number;
  mydata?: Nullable<DiscountReq_OrderVM[]>;
  userCanMakeAction: boolean;
  paging_item?: Nullable<PagingResults>;
};

export type ListDiscountRequestsResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data: DiscountRequestsGetItemsVM;
};

export type DiscountReviewReq = {
  id: number;
  uid?: Nullable<string>;
  isapproved: number;
  overrideamount?: Nullable<number>;
};

export type APLAT_T_WC_DIADIKASIA_CALENDAR = {
  customerCode?: Nullable<string>;
  customerName?: Nullable<string>;
  peL_GRLSH?: Nullable<string>;
  amka?: Nullable<string>;
  sellerCode?: Nullable<string>;
  sellerName?: Nullable<string>;
  lastPAEO?: Nullable<string>;
  tasK_CODE?: Nullable<string>;
  lastOrderDate?: Nullable<string>;
  expectedNextOrderDate?: Nullable<string>;
  datesInfo?: Nullable<string>;
  daysUntilReminder?: Nullable<number>;
  doctoR_SINTAGHS?: Nullable<string>;
  docT_GRLSH?: Nullable<string>;
  deliveryAddress1?: Nullable<string>;
  deliveryCity?: Nullable<string>;
  deliveryPostal?: Nullable<string>;
  items?: Nullable<string>;
  totalTurnover?: Nullable<number>;
  pasy?: Nullable<number>;
  totaL_EXP?: Nullable<number>;
  ordersCount?: Nullable<number>;
  plethos?: Nullable<number>;
  team?: Nullable<string>;
  area?: Nullable<string>;
  statuS_EA?: Nullable<string>;
  statuS_CUST?: Nullable<string>;
};

export type AplatReportCustomerStatus = {
  statusId: number;
  statusUID?: Nullable<string>;
  title?: Nullable<string>;
  dateIn?: Nullable<string>;
  dateUpdated?: Nullable<string>;
  displayRank?: Nullable<number>;
};

export type WCdiadikasiaGetDataVM = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  showActions: boolean;
  listData?: Nullable<APLAT_T_WC_DIADIKASIA_CALENDAR[]>;
  listStatuses?: Nullable<AplatReportCustomerStatus[]>;
};

export type AplatAKKViewTravmaSellers = {
  code?: Nullable<string>;
  name?: Nullable<string>;
  area?: Nullable<string>;
  team?: Nullable<string>;
  approver?: Nullable<string>;
  siteCode?: Nullable<string>;
  siteDescr?: Nullable<string>;
  p_TARGET?: Nullable<number>;
  t_BUDGET?: Nullable<number>;
  misc1?: Nullable<Record<string, string>> | null;
};

export type WcDiadikasiaFilterAccessItems = {
  sellers?: Nullable<AplatAKKViewTravmaSellers[]>;
  isSuperAdmin: boolean;
  isCityAdmin: boolean;
  isSimpleSeller: boolean;
  isManager: boolean;
  loggedSellerCode?: Nullable<string>;
  sellerCodes?: Nullable<string[]>;
  sellerCodesForDiscountApprove?: Nullable<string[]>;
};

export type EopyDoc_Iatros = {
  onomateponymo_iatrou?: Nullable<string>;
  afm_iatrou?: Nullable<string>;
  eidikotita?: Nullable<string>;
  amka_iatrou?: Nullable<string>;
  ygeionomiki_domi?: Nullable<string>;
  tilefono?: Nullable<string>;
  typos_domis?: Nullable<string>;
  doctor_erpid?: Nullable<string>;
  load_info_message?: Nullable<string>;
};

export type EopyDoc_Gnomateusi = {
  imerominia_gnomateusis?: Nullable<string>;
  diarkeia_isxyos_apo?: Nullable<string>;
  diarkeia_isxyos_eos?: Nullable<string>;
  diarkeia_therapeias_mines?: Nullable<number>;
  aa_gnomateusis_mines?: Nullable<number>;
  katigoria_paroxis?: Nullable<string>;
  eidos_egkrisis?: Nullable<number>;
  kodikos_diagnosis?: Nullable<string>;
  perigrafi_diagnosis?: Nullable<string>;
  kodikos_diagnosis2?: Nullable<string>;
  perigrafi_diagnosis2?: Nullable<string>;
  symmetoxi?: Nullable<string>;
  diagnosi1_gid?: Nullable<string>;
  diagnosi2_gid?: Nullable<string>;
  symmetoxi_percentage?: Nullable<number>;
  max_poso_symmetoxis?: Nullable<number>;
  gift_poso_symmetoxis?: Nullable<number>;
  max_poso_symm_reasoning?: Nullable<string>;
};

export type EopyDoc_Ylika = {
  kodikos_ylikou?: Nullable<string>;
  perigrafi_ylikou?: Nullable<string>;
  anatomiki_perioxi?: Nullable<string>;
  synoliki_posotita_eidous?: Nullable<number>;
  diarkeia_therapeias_se_mines?: Nullable<number>;
  mhniaia_posotita_tmx?: Nullable<number>;
  symmetoxi?: Nullable<string>;
  sxolia?: Nullable<string>;
  kodikos_diagnosis?: Nullable<string>;
  perigrafi_diagnosis?: Nullable<string>;
  xronia_pathisi?: Nullable<string>;
  diagnosi_pros_ayds?: Nullable<string>;
  kodikos_diagnosis2?: Nullable<string>;
  perigrafi_diagnosis2?: Nullable<string>;
  slug_name?: Nullable<string>;
  clean_name?: Nullable<string>;
  erp_products?: Nullable<EopyDoc_ErpMappedProduct[]>;
};

export type EopyDocument = {
  barcode?: Nullable<string>;
  otp?: Nullable<string>;
  amka_eksetazomenou?: Nullable<string>;
  onomateponymo_eksetazomenou?: Nullable<string>;
  imerominia_gennisis?: Nullable<string>;
  diefthinsi_eksetazomenou?: Nullable<string>;
  tk_eksetazomenou?: Nullable<string>;
  poli_eksetazomenou?: Nullable<string>;
  tilefono_eksetazomenou?: Nullable<string>;
  email_eksetazomenou?: Nullable<string>;
  iatros?: Nullable<EopyDoc_Iatros>;
  last_order_hassuggested_doc?: Nullable<number>;
  systinon_iatros?: Nullable<EopyDoc_Iatros>;
  gnomateusi?: Nullable<EopyDoc_Gnomateusi>;
  ylika?: Nullable<EopyDoc_Ylika[]>;
  hasAnoia: boolean;
  customer_erpid?: Nullable<string>;
  person_erpid?: Nullable<string>;
  address_erpid?: Nullable<string>;
  last_order_info?: Nullable<OrderPlatformPreviousDto>;
  loaded_custinfo_from?: Nullable<string>;
  /** Present in some responses; not in swagger but used by the app. */
  last_web_order?: OrderPlatformPreviousDto | Record<string, unknown> | null;
  customer_tel?: Nullable<string>;
};

export type ReadEoppyDoc_Response = {
  isSuccess: boolean;
  message?: Nullable<string>;
  errorMessage?: Nullable<string>;
  jsonDoc?: Nullable<EopyDocument>;
  jsonError?: Nullable<string>;
  detailedError?: Nullable<string>;
  logId?: Nullable<number>;
};

export type ReadEoppyDocumentAIResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data?: Nullable<ReadEoppyDoc_Response>;
};

export type RunAIFileAnalysisReq = {
  order_uid?: Nullable<string>;
  catid: number;
  aiclient?: Nullable<string>;
};

export type FileUploadReq = {
  order_uid?: Nullable<string>;
  document_category?: Nullable<string>;
  position?: Nullable<number>;
  base64file?: Nullable<string>;
  base64filename?: Nullable<string>;
  customer_name?: Nullable<string>;
  recipient_name?: Nullable<string>;
  has_other_recipient?: Nullable<number>;
  aiclient?: Nullable<string>;
};

export type ApiAccessSellerItem = {
  sellerCode?: Nullable<string>;
  sellerName?: Nullable<string>;
};

export type ApiAccessAreaTeamItem = {
  name?: Nullable<string>;
  value?: Nullable<string>;
};

export type ApiAvailableAiClient = {
  name?: Nullable<string>;
  code?: Nullable<string>;
  priority: number;
};

/** OpenAPI `AiClient`. */
export type AiClient = ApiAvailableAiClient;

export type Colai_Erp_Order = {
  docGID?: Nullable<string>;
  customerGID?: Nullable<string>;
  customerPersonGID?: Nullable<string>;
  deliveryPersonGID?: Nullable<string>;
  deliveryAddressGID?: Nullable<string>;
  suggestedDoctorGID?: Nullable<string>;
  documentCode?: Nullable<string>;
  registrationDate?: Nullable<string>;
  customerAMKA?: Nullable<string>;
  suggestedDoctor_amka?: Nullable<string>;
  suggestedDoctor_name?: Nullable<string>;
  suggestedDoctor_afm?: Nullable<string>;
  suggestedDoctor_domi?: Nullable<string>;
  suggestedDoctor_tel?: Nullable<string>;
};

export type COLAI_T_PAEO_HEADER = {
  registrationDate?: Nullable<string>;
  fTradeAccountGID?: Nullable<string>;
  fDeliveryPersonGID?: Nullable<string>;
  fDeliverySiteGID?: Nullable<string>;
  prescriptioN_NUM?: Nullable<string>;
  docGID?: Nullable<string>;
  fDeliveryTermsCode?: Nullable<string>;
  sellerCode?: Nullable<string>;
  sellerName?: Nullable<string>;
  deliveryPerson?: Nullable<string>;
  customerName?: Nullable<string>;
  documentCode?: Nullable<string>;
  documentType?: Nullable<string>;
  ordeR_DATE?: Nullable<string>;
  deliverY_GT?: Nullable<string>;
};

export type OrderGetItemsFromERPVM = {
  start?: Nullable<string>;
  end?: Nullable<string>;
  sellerCode?: Nullable<string>;
  mydata?: Nullable<COLAI_T_PAEO_HEADER[]>;
};

export type ListERPOrdersResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data?: Nullable<OrderGetItemsFromERPVM>;
};

export type DiscountReq_ViewItem = {
  order_info?: Nullable<DiscountReq_OrderVM>;
  msg?: Nullable<string>;
  userCanReview: boolean;
};

export type DiscountRequestDetailsResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data?: Nullable<DiscountReq_ViewItem>;
};

export type SuggestedDoctorReq_OrderVM = {
  id: number;
  uid?: Nullable<string>;
  barcode?: Nullable<string>;
  dateOfSyntagi?: Nullable<string>;
  dateIn?: Nullable<string>;
  type?: Nullable<string>;
  type_descr?: Nullable<string>;
  group_EOPPY?: Nullable<string>;
  customer_name?: Nullable<string>;
  customer_amka?: Nullable<string>;
  doctor_name?: Nullable<string>;
  doctor_amka?: Nullable<string>;
  doctor_Domi?: Nullable<string>;
  sellerCode?: Nullable<string>;
  sellerName?: Nullable<string>;
  has_suggested_doctor?: Nullable<number>;
  doctorSuggested_name?: Nullable<string>;
  doctorSuggested_domi?: Nullable<string>;
  propose_other_suggested_doctor?: Nullable<number>;
  otherDoctorSuggested_amka?: Nullable<string>;
  otherDoctorSuggested_name?: Nullable<string>;
  otherDoctorSuggested_afm?: Nullable<string>;
  otherDoctorSuggested_domi?: Nullable<string>;
  otherDoctorSuggested_mobile?: Nullable<string>;
  otherDoctorSuggested_ErpGID?: Nullable<string>;
  otherDoctorSuggested_IsApproved?: Nullable<number>;
  otherDoctorSuggested_ReviewedByUID?: Nullable<string>;
  otherDoctorSuggested_ReviewedByName?: Nullable<string>;
  dateOtherDoctorSuggestedNotify?: Nullable<string>;
};

export type SuggestedDoctorReq_ViewItem = {
  order_info?: Nullable<SuggestedDoctorReq_OrderVM>;
  msg?: Nullable<string>;
  userCanReview: boolean;
};

export type SuggestedDoctorsRequestsGetItemsVM = {
  search?: Nullable<string>;
  start?: Nullable<string>;
  end?: Nullable<string>;
  orderby?: Nullable<string>;
  approvalstatus?: Nullable<number>;
  groupid?: Nullable<number>;
  descriptionForDates?: Nullable<string>;
  page: number;
  pagesize: number;
  mydata?: Nullable<SuggestedDoctorReq_OrderVM[]>;
  userCanMakeAction: boolean;
  paging_item?: Nullable<PagingResults>;
};

export type ListSuggestedDoctorsChangeRequestsResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data?: Nullable<SuggestedDoctorsRequestsGetItemsVM>;
};

export type SuggestedDoctorChangeRequestDetailsResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  data?: Nullable<SuggestedDoctorReq_ViewItem>;
};

export type NewSuggestedDoctorReviewReq = {
  id: number;
  uid?: Nullable<string>;
  isapproved: number;
};

export type Checkpoint = {
  status?: Nullable<string>;
  statusCode?: Nullable<string>;
  statusDate: string;
  shop?: Nullable<string>;
  latitude: number;
  longitude: number;
};

export type TrackAndTraceResult = {
  result: number;
  checkpoints?: Nullable<Checkpoint[]>;
  status?: Nullable<string>;
  deliveryDate: string;
  consignee?: Nullable<string>;
  returningServiceVoucher?: Nullable<string>;
  deliveredAt?: Nullable<string>;
};

/** OpenAPI `/api/gt-track-and-trace` response body. */
export type GenikiTaxTrackResponse = {
  isSuccess: boolean;
  message?: Nullable<string>;
  errorMessage?: Nullable<string>;
  tracking_info?: Nullable<TrackAndTraceResult>;
};

export type UserInfos = {
  userID?: Nullable<number>;
  userUID?: Nullable<string>;
  username?: Nullable<string>;
  fullName?: Nullable<string>;
  email?: Nullable<string>;
  accessArea?: Nullable<string>;
  accessTeam?: Nullable<string>;
  roleName?: Nullable<string>;
  pinCode?: Nullable<string>;
  isLogged?: Nullable<number>;
  isSuperAdmin?: Nullable<number>;
  accessColoplast?: Nullable<number>;
  accessSplits?: Nullable<number>;
  accessCommissions?: Nullable<number>;
  accessLedger?: Nullable<number>;
  accessClawback?: Nullable<number>;
  accessExpenses?: Nullable<number>;
  accessItemApografes?: Nullable<number>;
  canCreateTasks?: Nullable<number>;
  accessTargetsUpload?: Nullable<number>;
  accessRebates?: Nullable<number>;
  accessDiseases?: Nullable<number>;
  accessHospitalAddresses?: Nullable<number>;
  accessHospitalGroups?: Nullable<number>;
  accessTravmaTargets?: Nullable<number>;
  travmaArea?: Nullable<string>;
  travmaTeam?: Nullable<string>;
  travmaExtraUsers?: Nullable<string>;
  travmaTargetExecutor?: Nullable<number>;
  accessCRMtarget?: Nullable<number>;
  crmArea?: Nullable<string>;
  crmTeam?: Nullable<string>;
  platformAcc_pnl?: Nullable<number>;
  platformAcc_reports?: Nullable<number>;
  platformAcc_posts?: Nullable<number>;
  platformAcc_sales?: Nullable<number>;
  sellerCode?: Nullable<string>;
  strBUCatUIDs?: Nullable<string>;
  salesAccessSiteCodes?: Nullable<string>;
};

export type ApiUserProfileResp = {
  currentUser?: Nullable<UserInfos>;
  available_selections?: Nullable<WcDiadikasiaFilterAccessItems>;
};

export type ApiUserInfo = {
  userID: number;
  userUID?: Nullable<string>;
  username?: Nullable<string>;
  fname?: Nullable<string>;
  lname?: Nullable<string>;
  area?: Nullable<string>;
  team?: Nullable<string>;
  isSuperAdmin: boolean;
  isSalesAdmin: boolean;
  isSeller: boolean;
  isManager: boolean;
  sellerCode?: Nullable<string>;
  listAccessSellers?: Nullable<ApiAccessSellerItem[]>;
  listAccessAreaTeam?: Nullable<ApiAccessAreaTeamItem[]>;
  travmaArea?: Nullable<string>;
  travmaTeam?: Nullable<string>;
};

/** AMSA `/api/login` payload. */
export type LoginReq = {
  username?: Nullable<string>;
  password?: Nullable<string>;
};

/** AMSA `/api/login` response body (also returned by `/api/auth/login` with `ok: true`). */
export type LoginResp = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
  accessToken?: Nullable<string>;
  tokenType?: Nullable<string>;
  expiresIn?: Nullable<number>;
  userInfos?: Nullable<ApiUserInfo>;
  warningMessage?: Nullable<string>;
  availableAiClients?: Nullable<AiClient[]>;
};
