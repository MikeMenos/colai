/** OpenAPI nullable field (`nullable: true`). */
export type Nullable<T> = T | null;

/** Value that may be absent or null (e.g. function parameters). */
export type Maybe<T> = T | null | undefined;

/** ISO-8601 date-time string (`format: date-time`). */
export type DateTimeString = string;

/** UUID string (`format: uuid`). */
export type UuidString = string;

/** Standard Next.js proxy failure envelope. */
export type ApiFailure = {
  ok: false;
  message?: string;
  detailedMessage?: Nullable<string>;
};

/** Standard Next.js proxy success envelope. */
export type ApiSuccess<T extends Record<string, unknown> = Record<string, never>> =
  { ok: true } & T;

export type ApiResult<T extends Record<string, unknown>> =
  | ApiSuccess<T>
  | ApiFailure;

export type SelectListGroup = {
  disabled: boolean;
  name?: Nullable<string>;
};

export type SelectListItem = {
  disabled: boolean;
  group?: Nullable<SelectListGroup>;
  selected: boolean;
  text?: Nullable<string>;
  value?: Nullable<string>;
};

export type KatigoriaParoxisItem = SelectListItem & {
  plafonAmount: number;
  plafonGiftAmount: number;
};

export type PagingResults = {
  totalpages?: Nullable<number>;
  totalrecords?: Nullable<number>;
  currentPage?: Nullable<number>;
  currentPagesize?: Nullable<number>;
  searchFunction?: Nullable<string>;
  currentPageHtmlElementId?: Nullable<string>;
  itemsidentifier?: Nullable<string>;
};

/** Backend `ToastMessage` schema. */
export type ToastMessage = {
  result: boolean;
  message?: Nullable<string>;
  type?: Nullable<string>;
  exmessage?: Nullable<string>;
  redirectlink?: Nullable<string>;
  backtopreviouspage: boolean;
  misc1?: Nullable<string>;
  misc2?: Nullable<string>;
  misc3?: Nullable<string>;
  misc4?: Nullable<string>;
  misc5?: Nullable<string>;
  misc6?: Nullable<string>;
  dataobject?: unknown;
};

export type ConsentUploadDataObject = {
  form_score?: number;
};

export type StatusEnvelope = {
  statusCode?: Nullable<number>;
  message?: Nullable<string>;
  detailedMessage?: Nullable<string>;
};
