import { isBlank } from "@/lib/utils/string";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import type { AppDispatch } from "@/store/store";
import { store } from "@/store/store";
import type { OrderListOfAddressPersons } from "@/types/orders";
import {
  findAddressPersonByAmka,
  getCustomerMobileFromAddressPerson,
  getCustomerPassportFromAddressPerson,
} from "./customerAddressesUtils";

export function applyCustomerFieldsFromLoadedAddresses(
  dispatch: AppDispatch,
  addresses: OrderListOfAddressPersons[],
  customerAmka: string,
): void {
  const matchedPerson = findAddressPersonByAmka(addresses, customerAmka);
  const passport = getCustomerPassportFromAddressPerson(matchedPerson);
  if (
    passport &&
    isBlank(store.getState().orders.draft.order.customer_passport)
  ) {
    dispatch(setDraftProperty({ key: "customer_passport", value: passport }));
  }

  const mobile = getCustomerMobileFromAddressPerson(matchedPerson);
  if (
    mobile &&
    isBlank(store.getState().orders.draft.order.customer_mobile)
  ) {
    dispatch(setDraftProperty({ key: "customer_mobile", value: mobile }));
  }
}
