export interface SellerSalesWC {
  RegistrationDate: string;
  SellerCode: string;
  NEWREP: string;
  ADCode: string;
  ReferenceDocument: string;
  TrackingNo: string;
  Doctor: string;
  CustomerName: string;
  COLAI: string;
  Turnover: string;
}

export interface SellerTeamatesWC {
  SELLERCODE: string;
  SellerName: string;
  NEW: string;
  REP: string;
  TOT: string;
  TURNOVER: string;
}

export type ColaiSearchAmkaTypos = "NAME" | "AMKA" | "TELEPHONE";

export type ColaiSearchAmkaRowTypos =
  | "01 CUSTOMER_MAIN_ADDRESS"
  | "02 CUSTOMER_EXTRA_ADDRESS"
  | "03 CUSTOMER_RELATED_PERSON_MAIN"
  | "04 CUSTOMER_RELATED_PERSON_EXTRA"
  | string;

export interface ColaiSearchAmkaRow {
  TYPOS?: ColaiSearchAmkaRowTypos | null;
  GID?: string | null;
  TR_CODE?: string | null;
  TR_NAME?: string | null;
  fSalesPersonGID?: string | null;
  AMKA?: string | null;
  APP_CREATED?: string | null;
  TR_PERSON_GID?: string | null;
  CERTIFIED?: string | null;
  PERSON_CODE?: string | null;
  PERSON_NAME?: string | null;
  fMainAddressGID?: string | null;
  PERSON_MOBILE1_EOPYY?: string | null;
  TaxRegistrationNumber?: string | null;
  IDCode?: string | null;
  PERSON_AMKA?: string | null;
  Address1?: string | null;
  fCityCode?: string | null;
  fPostalCode?: string | null;
  Telephone1?: string | null;
  J1?: string | null;
  J2?: string | null;
  J3?: string | null;
  ESDCreated?: string | null;
  ESDModified?: string | null;
  STATUS_PERSON?: string | null;
  TELEPHONE_ALL?: string | null;
  TR_NAME_GREEKLISH?: string | null;
  DATE_OF_CREATION?: string | null;
}

export interface ColaiSearchAmkaAddress {
  key: string;
  addressGid: string;
  address: string;
  city: string;
  postalCode: string;
  telephone: string;
  isMain: boolean;
  isLastDelivery: boolean;
  statusPerson: string;
  row: ColaiSearchAmkaRow;
}

export interface ColaiSearchAmkaRelatedPerson {
  key: string;
  personGid: string;
  personCode: string;
  personName: string;
  personAmka: string;
  taxRegistrationNumber: string;
  idCode: string;
  mobile: string;
  addresses: ColaiSearchAmkaAddress[];
}

export interface ColaiSearchAmkaCustomer {
  key: string;
  customerGid: string;
  traderCode: string;
  traderName: string;
  amka: string;
  personGid: string;
  personCode: string;
  personName: string;
  personAmka: string;
  taxRegistrationNumber: string;
  idCode: string;
  mobile: string;
  telephone: string;
  phones: string[];
  certified: boolean;
  addresses: ColaiSearchAmkaAddress[];
  relatedPersons: ColaiSearchAmkaRelatedPerson[];
}

