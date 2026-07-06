import type { AddressDto } from "@/types/api";

export type ErpContactAddress = AddressDto & {
  address_ErpGID: string;
  address: string;
  city: string;
  tk: string;
};
