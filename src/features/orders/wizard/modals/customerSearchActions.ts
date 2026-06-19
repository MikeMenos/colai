import { parseProxyJson } from "@/lib/api/client";
import {
  applyLastErpOrderData,
  applyLastOrderData,
  applyPersonErpGIDFromLastOrder,
  extractAddressErpGID,
  extractPersonErpGID,
  extractShipToOtherAddress,
  syncShipToOtherAddressFlags,
} from "@/lib/applyLastOrderData";
import {
  loadCustomerAddressesAsync,
  setCustomerProsEbs,
  setCustomerSelectedFromList,
  setCustomerIsCompletelyNew,
  setDraftProperty,
  setLastOrderInfoCustomerErpGID,
  setLastWebOrderFromLoadInfo,
} from "@/store/orders/ordersSlice";
import type { AppDispatch } from "@/store/store";
import { store } from "@/store/store";
import { hasText } from "@/lib/utils/string";
import {
  findAddressPersonByAmka,
  getCustomerMobileFromAddressPerson,
} from "../eopyy/wizard/customerAddressesUtils";
import type { OrderListOfAddressPersons } from "@/types/orders";
import type {
  CustomerSearchResult,
  LoadLastCustomerOrderInfoSuccess,
  SearchCustomersSuccess,
} from "@/types/api/responses";
import {
  resetDraftForDifferentCustomerSelection,
  shouldResetWizardForCustomerAmkaChange,
} from "../eopyy/wizard/resetWizardForCustomerSelection";

export type ApplyCustomerFromSearchOptions = {
  baselineCustomerAmka?: string | null;
  resetWizardOnDifferentAmka?: boolean;
};

function maybeResetWizardForDifferentAmka(
  dispatch: AppDispatch,
  baselineCustomerAmka: string | null | undefined,
  selectedCustomerAmka: string | null | undefined,
  resetWizardOnDifferentAmka?: boolean,
): void {
  if (!resetWizardOnDifferentAmka) return;
  if (
    !shouldResetWizardForCustomerAmkaChange(
      baselineCustomerAmka,
      selectedCustomerAmka,
    )
  ) {
    return;
  }
  resetDraftForDifferentCustomerSelection(dispatch);
}

export type CustomerSearchOutcome = {
  results: CustomerSearchResult[];
  lastCustomerWebOrder: Record<string, unknown> | null;
  error: string | null;
};

function isNonEmptyRecord(v: unknown): v is Record<string, unknown> {
  return (
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.keys(v as object).length > 0
  );
}

function getCustomerSearchErrorMessage(
  data: SearchCustomersSuccess,
): string | null {
  if (data.isSuccess !== false) return null;

  const message = data.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  return "Η αναζήτηση απέτυχε.";
}

export async function searchCustomersByQuery(
  query: string,
): Promise<CustomerSearchOutcome> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { results: [], lastCustomerWebOrder: null, error: null };
  }

  try {
    const res = await fetch(
      `/api/customers?q=${encodeURIComponent(trimmed)}&_ts=${Date.now()}`,
      {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      },
    );
    const data = await parseProxyJson<SearchCustomersSuccess>(
      res,
      "Search failed",
    );

    const searchError = getCustomerSearchErrorMessage(data);
    if (searchError) {
      return { results: [], lastCustomerWebOrder: null, error: searchError };
    }

    const listCustomers = data.listCustomers ?? [];
    const webOrder = isNonEmptyRecord(data.lastCustomerWebOrder)
      ? data.lastCustomerWebOrder
      : null;

    return {
      results: listCustomers,
      lastCustomerWebOrder:
        listCustomers.length === 0 && webOrder ? webOrder : null,
      error: null,
    };
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Η αναζήτηση απέτυχε.";
    return { results: [], lastCustomerWebOrder: null, error: message };
  }
}

export async function applyCustomerFromSearch(
  dispatch: AppDispatch,
  c: CustomerSearchResult,
  options: ApplyCustomerFromSearchOptions = {},
): Promise<void> {
  maybeResetWizardForDifferentAmka(
    dispatch,
    options.baselineCustomerAmka,
    c.tR_StringField5 ?? "",
    options.resetWizardOnDifferentAmka,
  );

  dispatch(setCustomerProsEbs(false));
  dispatch(setCustomerSelectedFromList(true));
  dispatch(setCustomerIsCompletelyNew(false));

  let preferredPerson: string | undefined;
  let preferredAddr: string | undefined;
  let shipToFromLast: 0 | 1 | undefined;
  let mobileFromLastWebOrder: string | undefined;
  let telFromLastWebOrder: string | undefined;

  try {
    const res = await fetch("/api/load-last-customer-order-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_gid: c.tR_GID,
        customer_amka: c.tR_StringField5 ?? "",
      }),
    });
    const data = await parseProxyJson<LoadLastCustomerOrderInfoSuccess>(
      res,
      "Failed to load customer order info",
    );
    const sc = data.statusCode ?? undefined;
    const statusOk = sc === undefined || sc === 0 || sc === 200;
    if (statusOk) {
      const lwo = data.last_web_order;
      const leo = data.last_erp_order;
      if (isNonEmptyRecord(lwo)) {
        dispatch(setLastWebOrderFromLoadInfo(lwo));
        const lwoRec = lwo as Record<string, unknown>;
        if (hasText(lwoRec.customer_mobile)) {
          mobileFromLastWebOrder = String(lwoRec.customer_mobile);
        }
        if (hasText(lwoRec.customer_tel)) {
          telFromLastWebOrder = String(lwoRec.customer_tel);
        }
        const lwoCopy = { ...lwoRec };
        const lwoPerson = extractPersonErpGID(lwoRec);
        const lwoAddr = extractAddressErpGID(lwoRec);
        shipToFromLast = extractShipToOtherAddress(lwoRec);
        delete lwoCopy.person_ErpGID;
        delete lwoCopy.address_ErpGID;
        delete lwoCopy.preselected_person_GID;
        delete lwoCopy.preselected_address_GID;
        applyLastOrderData(lwoCopy, dispatch, true);
        preferredPerson = lwoPerson;
        preferredAddr = lwoAddr;
      } else if (isNonEmptyRecord(leo)) {
        dispatch(setLastWebOrderFromLoadInfo(null));
        applyLastErpOrderData(leo, dispatch);
        preferredPerson =
          String(leo.deliveryPersonGID ?? "").trim() || undefined;
        preferredAddr =
          String(leo.deliveryAddressGID ?? "").trim() || undefined;
      } else {
        dispatch(setLastWebOrderFromLoadInfo(null));
      }
    } else {
      dispatch(setLastWebOrderFromLoadInfo(null));
    }
  } catch {
    dispatch(setLastWebOrderFromLoadInfo(null));
  }

  dispatch(setDraftProperty({ key: "customer_ErpGID", value: c.tR_GID }));
  dispatch(setDraftProperty({ key: "customer_name", value: c.pE_NAME }));
  dispatch(
    setDraftProperty({ key: "customer_amka", value: c.tR_StringField5 }),
  );
  dispatch(
    setDraftProperty({ key: "customer_address", value: c.peS_Address1 }),
  );
  dispatch(setDraftProperty({ key: "customer_city", value: c.peS_CityCode }));
  dispatch(
    setDraftProperty({ key: "customer_tk", value: c.peS_FPOSTALCODE }),
  );
  dispatch(
    setDraftProperty({
      key: "customer_tel",
      value: hasText(telFromLastWebOrder) ? telFromLastWebOrder : (c.telephone1 ?? ""),
    }),
  );
  dispatch(
    setDraftProperty({
      key: "customer_mobile",
      value: hasText(mobileFromLastWebOrder)
        ? mobileFromLastWebOrder
        : (c.peS_TEL_1 ?? ""),
    }),
  );
  dispatch(setDraftProperty({ key: "customer_dob", value: "" }));
  dispatch(setDraftProperty({ key: "customer_email", value: "" }));
  dispatch(
    setDraftProperty({ key: "customer_passport", value: c.taytothta }),
  );

  try {
    const addressResult = await dispatch(
      loadCustomerAddressesAsync({
        customer_ErpGID: c.tR_GID,
        customer_name: c.pE_NAME ?? undefined,
        customer_amka: c.tR_StringField5 ?? undefined,
        customer_address: c.peS_Address1 ?? undefined,
        preferredPersonErpGID: preferredPerson,
        preferredAddressErpGID: preferredAddr,
      }),
    ).unwrap();

    if (addressResult.ok) {
      const addresses = (addressResult.addresses ??
        []) as OrderListOfAddressPersons[];
      const matchedPerson = findAddressPersonByAmka(
        addresses,
        c.tR_StringField5 ?? "",
      );
      const mobileFromAddresses =
        getCustomerMobileFromAddressPerson(matchedPerson);
      if (
        mobileFromAddresses &&
        !hasText(store.getState().orders.draft.order.customer_mobile)
      ) {
        dispatch(
          setDraftProperty({
            key: "customer_mobile",
            value: mobileFromAddresses,
          }),
        );
      }
    }

    if (shipToFromLast === 1) {
      syncShipToOtherAddressFlags(dispatch, 1);
      applyPersonErpGIDFromLastOrder(dispatch, preferredPerson);
      const prePerson = store.getState().orders.draft.preselected_person_GID;
      if (
        !store.getState().orders.draft.order.person_ErpGID?.trim() &&
        prePerson
      ) {
        dispatch(
          setDraftProperty({ key: "person_ErpGID", value: prePerson }),
        );
      }
    } else {
      dispatch(setDraftProperty({ key: "shipTo_other_address", value: 0 }));
      dispatch(
        setDraftProperty({ key: "shipToOtherAddressBool", value: false }),
      );
      dispatch(setDraftProperty({ key: "has_other_recipient", value: 0 }));
      dispatch(
        setDraftProperty({ key: "recipient_from_erp_lookup", value: null }),
      );
    }
  } catch {
    if (shipToFromLast === 1) {
      syncShipToOtherAddressFlags(dispatch, 1);
      applyPersonErpGIDFromLastOrder(dispatch, preferredPerson);
    }
  }

  dispatch(setLastOrderInfoCustomerErpGID(c.tR_GID));
}

export async function applyLastCustomerWebOrderFromSearch(
  dispatch: AppDispatch,
  lwo: Record<string, unknown>,
  options: ApplyCustomerFromSearchOptions = {},
): Promise<void> {
  maybeResetWizardForDifferentAmka(
    dispatch,
    options.baselineCustomerAmka,
    String(lwo.customer_amka ?? ""),
    options.resetWizardOnDifferentAmka,
  );

  dispatch(setCustomerProsEbs(true));
  dispatch(setCustomerSelectedFromList(false));
  dispatch(setCustomerIsCompletelyNew(false));
  dispatch(setLastWebOrderFromLoadInfo(lwo));
  dispatch(setDraftProperty({ key: "person_erpid", value: null }));

  let preferredPerson: string | undefined;
  let preferredAddr: string | undefined;
  let shipToFromLast: 0 | 1 | undefined;

  const lwoCopy = { ...lwo };
  preferredPerson = extractPersonErpGID(lwo);
  preferredAddr = extractAddressErpGID(lwo);
  shipToFromLast = extractShipToOtherAddress(lwo);
  delete lwoCopy.person_ErpGID;
  delete lwoCopy.address_ErpGID;
  delete lwoCopy.preselected_person_GID;
  delete lwoCopy.preselected_address_GID;
  applyLastOrderData(lwoCopy, dispatch, true);

  const customerGid = String(lwo.customer_ErpGID ?? "").trim();
  const customerName = String(lwo.customer_name ?? "").trim();
  const customerAmka = String(lwo.customer_amka ?? "").trim();
  const customerAddress = String(lwo.customer_address ?? "").trim();

  if (customerGid) {
    dispatch(
      setDraftProperty({ key: "customer_ErpGID", value: customerGid }),
    );
  }
  if (customerName) {
    dispatch(setDraftProperty({ key: "customer_name", value: customerName }));
  }
  if (customerAmka) {
    dispatch(setDraftProperty({ key: "customer_amka", value: customerAmka }));
  }
  if (customerAddress) {
    dispatch(
      setDraftProperty({ key: "customer_address", value: customerAddress }),
    );
  }
  if (hasText(lwo.customer_city)) {
    dispatch(
      setDraftProperty({
        key: "customer_city",
        value: String(lwo.customer_city),
      }),
    );
  }
  if (hasText(lwo.customer_tk)) {
    dispatch(
      setDraftProperty({
        key: "customer_tk",
        value: String(lwo.customer_tk),
      }),
    );
  }
  if (hasText(lwo.customer_tel)) {
    dispatch(
      setDraftProperty({
        key: "customer_tel",
        value: String(lwo.customer_tel),
      }),
    );
  }
  if (hasText(lwo.customer_mobile)) {
    dispatch(
      setDraftProperty({
        key: "customer_mobile",
        value: String(lwo.customer_mobile),
      }),
    );
  }
  if (hasText(lwo.customer_passport)) {
    dispatch(
      setDraftProperty({
        key: "customer_passport",
        value: String(lwo.customer_passport),
      }),
    );
  }

  try {
    if (customerGid && customerAmka) {
      await dispatch(
        loadCustomerAddressesAsync({
          customer_ErpGID: customerGid,
          customer_name: customerName,
          customer_amka: customerAmka,
          customer_address: customerAddress,
          preferredPersonErpGID: preferredPerson,
          preferredAddressErpGID: preferredAddr,
        }),
      ).unwrap();

      if (shipToFromLast === 1) {
        syncShipToOtherAddressFlags(dispatch, 1);
        applyPersonErpGIDFromLastOrder(dispatch, preferredPerson);
        const prePerson =
          store.getState().orders.draft.preselected_person_GID;
        if (
          !store.getState().orders.draft.order.person_ErpGID?.trim() &&
          prePerson
        ) {
          dispatch(
            setDraftProperty({ key: "person_ErpGID", value: prePerson }),
          );
        }
      } else {
        dispatch(setDraftProperty({ key: "shipTo_other_address", value: 0 }));
        dispatch(
          setDraftProperty({ key: "shipToOtherAddressBool", value: false }),
        );
        dispatch(setDraftProperty({ key: "has_other_recipient", value: 0 }));
        dispatch(
          setDraftProperty({ key: "recipient_from_erp_lookup", value: null }),
        );
      }
    }
  } catch {
    if (shipToFromLast === 1) {
      syncShipToOtherAddressFlags(dispatch, 1);
      applyPersonErpGIDFromLastOrder(dispatch, preferredPerson);
    }
  }

  if (customerGid) {
    dispatch(setLastOrderInfoCustomerErpGID(customerGid));
  }
}

export function applyCompletelyNewCustomerFromAmka(
  dispatch: AppDispatch,
  amka: string,
  options: ApplyCustomerFromSearchOptions = {},
): void {
  maybeResetWizardForDifferentAmka(
    dispatch,
    options.baselineCustomerAmka,
    amka,
    options.resetWizardOnDifferentAmka,
  );

  dispatch(setCustomerProsEbs(false));
  dispatch(setCustomerSelectedFromList(false));
  dispatch(setCustomerIsCompletelyNew(true));
  dispatch(setLastWebOrderFromLoadInfo(undefined));
  dispatch(setLastOrderInfoCustomerErpGID(undefined));
  dispatch(setDraftProperty({ key: "customer_amka", value: amka }));
  dispatch(setDraftProperty({ key: "customer_ErpGID", value: null }));
}
