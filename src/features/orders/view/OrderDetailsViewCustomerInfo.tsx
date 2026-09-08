"use client";

import type { Order, OrderFile } from "@/types/orders";
import { useAppSelector } from "@/store/hooks";
import React from "react";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import {
  isDocumentCategory,
} from "@/lib/utils/order";
import { AddressMapFields, AddressMapLink } from "@/components/ui/AddressMapLink";
import { OrderFilePreviewButtons, ORDER_FILE_PREVIEW_BUTTON_STYLE } from "@/components/ui/OrderFilePreviewButton";
import { PhoneLink, PhoneLinks } from "@/components/ui/PhoneLink";
import { usePersonErpContactLookup } from "@/hooks/usePersonErpContactLookup";
import {
  formatRecipientAddress,
  formatRecipientContact,
  getOrderRecipientDisplayName,
  hasDifferentPersonErpRecipient,
  hasOrderRecipientInfo,
  shouldShowOrderRecipientSection,
} from "@/lib/utils/orderRecipient";

export default function OrderDetailsViewCustomerInfo({
  order,
}: {
  order: Order;
}) {
  const [customerOpen, setCustomerOpen] = React.useState(true);
  const files = useAppSelector(
    (s) => s.orders.selected?.files ?? [],
  ) as OrderFile[];
  const consentFiles = files.filter((f) =>
    isDocumentCategory(f, "consent_form"),
  );
  const showRecipientInfo = shouldShowOrderRecipientSection(order);
  const showRecipientDetails = hasOrderRecipientInfo(order);
  const showPersonErpRecipient = hasDifferentPersonErpRecipient(order);
  const recipientName = getOrderRecipientDisplayName(order);
  const { contact: personErpContact, loading: personErpContactLoading } =
    usePersonErpContactLookup(
      order.person_ErpGID,
      customerOpen && showPersonErpRecipient,
    );
  const recipientAddress = formatRecipientAddress(order);
  const recipientContact = formatRecipientContact(order);
  const customerPhones = [
    ...new Set(
      [order.customer_tel, order.customer_mobile]
        .map((value) => value?.trim())
        .filter(Boolean),
    ),
  ].join(" / ");

  return (
    <div className="app-card p-0">
      <div
        onClick={() => setCustomerOpen((x) => !x)}
        className="fw-semibold text-light d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: order.customer_ErpGID
            ? "var(--bs-success)"
            : "var(--bs-danger)",
          padding: "0.5rem",
          borderRadius: "0.5rem",
        }}
      >
        <div>
          Πελάτης/Ασθενής
          {order.customer_ErpGID ? (
            <i className="bi bi-check-lg ms-2"></i>
          ) : (
            <i className="bi bi-ban ms-2"></i>
          )}
        </div>
        {customerOpen ? (
          <MdOutlineKeyboardArrowUp className="ms-2" />
        ) : (
          <MdOutlineKeyboardArrowDown />
        )}
      </div>

      {customerOpen && (
        <div className="row g-2 p-3">
          <div className="col-12">
            <div className="small text-secondary">Ονοματεπώνυμο</div>
            <div className="fw-medium">{order.customer_name}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">ΑΜΚΑ</div>
            <div className="fw-medium">{order.customer_amka}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Ημ/νία γέννησης</div>
            <div className="fw-medium">{order.customer_dob}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Διεύθυνση</div>
            <AddressMapFields
              address={order.customer_address}
              city={order.customer_city}
              postalCode={order.customer_tk}
              className="fw-medium"
            />
          </div>

          <div className="col-6">
            <div className="small text-secondary">Πόλη</div>
            <div className="fw-medium">{order.customer_city}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">ΤΚ</div>
            <div className="fw-medium">{order.customer_tk}</div>
          </div>
          <div className="col-6">
            <div className="small text-secondary">OTP</div>
            <div className="fw-medium">
              <PhoneLink phone={order.customer_tel_otp ?? ""} />
            </div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Τηλέφωνο</div>
            <div className="fw-medium">
              <PhoneLinks value={customerPhones} />
            </div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Email</div>
            <div className="fw-medium">{order.customer_email}</div>
          </div>

          {showRecipientInfo ? (
            <>
              <div className="col-12">
                <div
                  style={{
                    height: 1,
                    background: "var(--bs-border-color-translucent)",
                    margin: "6px 0",
                  }}
                />
                <div className="fw-semibold">Παραλήπτης</div>
              </div>

              {recipientName ? (
                <div className="col-12">
                  <div className="small text-secondary">Ονοματεπώνυμο</div>
                  <div className="fw-medium">{recipientName}</div>
                </div>
              ) : null}

              {showPersonErpRecipient && personErpContactLoading ? (
                <div className="col-12">
                  <div className="small text-secondary">
                    Φόρτωση στοιχείων παραλήπτη…
                  </div>
                </div>
              ) : null}

              {showPersonErpRecipient && personErpContact?.amka ? (
                <div className="col-6">
                  <div className="small text-secondary">ΑΜΚΑ</div>
                  <div className="fw-medium">{personErpContact.amka}</div>
                </div>
              ) : null}

              {showPersonErpRecipient && personErpContact?.phone ? (
                <div className="col-6">
                  <div className="small text-secondary">Τηλέφωνο</div>
                  <div className="fw-medium">
                    <PhoneLinks value={personErpContact.phone} />
                  </div>
                </div>
              ) : null}

              {showPersonErpRecipient && personErpContact?.address ? (
                <div className="col-12">
                  <div className="small text-secondary">Διεύθυνση</div>
                  <AddressMapLink
                    address={personErpContact.address}
                    mapQuery={personErpContact.addressMapQuery}
                    className="fw-medium"
                  />
                </div>
              ) : null}

              {showRecipientDetails && order.recipient_reason ? (
                <div className="col-6">
                  <div className="small text-secondary">Αιτία παραλαβής</div>
                  <div className="fw-medium">{order.recipient_reason}</div>
                </div>
              ) : null}

              {showRecipientDetails && order.recipient_relation ? (
                <div className="col-6">
                  <div className="small text-secondary">Σχέση</div>
                  <div className="fw-medium">{order.recipient_relation}</div>
                </div>
              ) : null}

              {showRecipientDetails && order.recipient_amka ? (
                <div className="col-6">
                  <div className="small text-secondary">ΑΜΚΑ</div>
                  <div className="fw-medium">{order.recipient_amka}</div>
                </div>
              ) : null}

              {showRecipientDetails && order.recipient_afm ? (
                <div className="col-6">
                  <div className="small text-secondary">ΑΦΜ</div>
                  <div className="fw-medium">{order.recipient_afm}</div>
                </div>
              ) : null}

              {showRecipientDetails && order.recipient_passport ? (
                <div className="col-6">
                  <div className="small text-secondary">ΑΤ/Διαβατήριο</div>
                  <div className="fw-medium">{order.recipient_passport}</div>
                </div>
              ) : null}

              {showRecipientDetails && recipientContact ? (
                <div className="col-6">
                  <div className="small text-secondary">Τηλέφωνο</div>
                  <div className="fw-medium">
                    <PhoneLinks value={recipientContact} />
                  </div>
                </div>
              ) : null}

              {showRecipientDetails && recipientAddress ? (
                <div className="col-12">
                  <div className="small text-secondary">Διεύθυνση</div>
                  <AddressMapFields
                    address={order.recipient_address}
                    city={order.recipient_city}
                    postalCode={order.recipient_tk}
                    className="fw-medium"
                  />
                </div>
              ) : null}

              {showRecipientDetails && order.recipient_Notes ? (
                <div className="col-12">
                  <div className="small text-secondary">Σχόλια</div>
                  <div className="fw-medium">{order.recipient_Notes}</div>
                </div>
              ) : null}
            </>
          ) : null}

          {consentFiles.length > 0 ? (
            <div className="col-12">
              <div className="small text-secondary mb-2">Έντυπο συναίνεσης</div>
              <OrderFilePreviewButtons
                files={consentFiles}
                style={ORDER_FILE_PREVIEW_BUTTON_STYLE}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
