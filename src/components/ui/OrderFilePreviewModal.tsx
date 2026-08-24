"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import type { OrderFile } from "@/types/orders";
import {
  getOrderFileDisplayName,
  getOrderFileViewUrl,
  isOrderFilePdf,
} from "@/lib/utils/order";

export type OrderFilePreviewModalProps = {
  show: boolean;
  file: OrderFile | null;
  onClose: () => void;
};

export default function OrderFilePreviewModal({
  show,
  file,
  onClose,
}: OrderFilePreviewModalProps) {
  const url = file ? getOrderFileViewUrl(file) : null;
  const title = file ? getOrderFileDisplayName(file) : "Προβολή αρχείου";
  const isPdf = file ? isOrderFilePdf(file) : false;

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      restoreFocus={false}
      className="order-file-preview-modal-root"
      dialogClassName="order-file-preview-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="order-file-preview-title" title={title}>
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 d-flex flex-column">
        {url ? (
          isPdf ? (
            <iframe
              src={url}
              title={title}
              className="order-file-preview-frame w-100 border-0"
            />
          ) : (
            <div className="order-file-preview-image-wrap d-flex align-items-center justify-content-center p-3">
              <img
                src={url}
                alt={title}
                className="order-file-preview-image img-fluid"
              />
            </div>
          )
        ) : (
          <div className="small text-secondary p-4 text-center">
            Δεν ήταν δυνατή η προβολή του αρχείου.
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
