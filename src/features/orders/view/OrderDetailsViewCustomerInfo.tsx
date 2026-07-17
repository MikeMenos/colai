"use client";

import type { Order, OrderFile } from "@/types/orders";
import { useAppSelector } from "@/store/hooks";
import React from "react";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import {
  getFileSuffix,
  getOrderFileViewUrl,
  isDocumentCategory,
} from "@/lib/utils/order";
import {
  formatRecipientAddress,
  formatRecipientContact,
  hasOrderRecipientInfo,
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
  const showRecipientInfo = hasOrderRecipientInfo(order);
  const recipientAddress = formatRecipientAddress(order);
  const recipientContact = formatRecipientContact(order);

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
            <div className="fw-medium">{order.customer_address}</div>
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
            <div className="fw-medium">{order.customer_tel_otp}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Τηλέφωνο</div>
            <div className="fw-medium">{order.customer_tel}</div>
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

              {order.recipient_name ? (
                <div className="col-12">
                  <div className="small text-secondary">Ονοματεπώνυμο</div>
                  <div className="fw-medium">{order.recipient_name}</div>
                </div>
              ) : null}

              {order.recipient_reason ? (
                <div className="col-6">
                  <div className="small text-secondary">Αιτία παραλαβής</div>
                  <div className="fw-medium">{order.recipient_reason}</div>
                </div>
              ) : null}

              {order.recipient_relation ? (
                <div className="col-6">
                  <div className="small text-secondary">Σχέση</div>
                  <div className="fw-medium">{order.recipient_relation}</div>
                </div>
              ) : null}

              {order.recipient_amka ? (
                <div className="col-6">
                  <div className="small text-secondary">ΑΜΚΑ</div>
                  <div className="fw-medium">{order.recipient_amka}</div>
                </div>
              ) : null}

              {order.recipient_afm ? (
                <div className="col-6">
                  <div className="small text-secondary">ΑΦΜ</div>
                  <div className="fw-medium">{order.recipient_afm}</div>
                </div>
              ) : null}

              {order.recipient_passport ? (
                <div className="col-6">
                  <div className="small text-secondary">ΑΤ/Διαβατήριο</div>
                  <div className="fw-medium">{order.recipient_passport}</div>
                </div>
              ) : null}

              {recipientContact ? (
                <div className="col-6">
                  <div className="small text-secondary">Τηλέφωνο</div>
                  <div className="fw-medium">{recipientContact}</div>
                </div>
              ) : null}

              {recipientAddress ? (
                <div className="col-12">
                  <div className="small text-secondary">Διεύθυνση</div>
                  <div className="fw-medium">{recipientAddress}</div>
                </div>
              ) : null}

              {order.recipient_Notes ? (
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
              <div className="d-flex flex-wrap gap-2">
                {consentFiles.map((f, i) => {
                  const href = getOrderFileViewUrl(f);
                  if (!href) return null;
                  return (
                    <a
                      key={`consent-${f.id ?? i}-${getFileSuffix(f)}`}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        boxShadow: "0 6px 12px rgba(var(--bs-primary-rgb), .2)",
                      }}
                    >
                      <i className="bi bi-eye me-2" />
                      Προβολή{" "}
                      {consentFiles.filter((x) => getFileSuffix(x)).length > 1
                        ? i + 1
                        : ""}
                    </a>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
