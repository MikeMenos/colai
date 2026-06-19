"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AIMaterials, AIMaterialsErpProducts } from "@/types/orders";
import { addDraftYliko, removeAIMaterial } from "../../../../store/orders/ordersSlice";

export default function AIMaterialSelectorModal({
    show,
    onClose,
    aiMaterials,
    idx
}: {
    show: boolean;
    onClose: () => void;
    aiMaterials: AIMaterials;
    idx: number
}) {
    const dispatch = useAppDispatch();
    const { id, uid } = useAppSelector((s) => s.orders.draft.order)

    function applyMaterial(c: AIMaterialsErpProducts, qty: string) {
        dispatch(addDraftYliko({
            id,
            uid,
            orderId: id,
            orderUID: uid,
            erpGid: c.erp_gid || "",
            aiMatchedErpGid: c.erp_gid || "",
            erpCode: c.erp_code || "",
            erpName: c.erp_name || "",
            erp_Price: c.erp_price || 0,
            erp_EoppyPrice: c.erp_eoppyprice || 0,
            qty: parseFloat(qty),
            eoppy_CleanName: aiMaterials.clean_name,
            eoppy_Code: aiMaterials.kodikos_ylikou,
            eoppy_Diagnosi_Code: aiMaterials.kodikos_diagnosis,
            eoppy_Diagnosi_Name: aiMaterials.perigrafi_diagnosis,
            eoppy_Diagnosi2_Code: aiMaterials.kodikos_diagnosis2,
            eoppy_Diagnosi2_Name: aiMaterials.perigrafi_diagnosis2,
            eoppy_DiarkiaTherapias: String(aiMaterials.diarkeia_therapeias_se_mines),
            eoppy_SlugName: aiMaterials.slug_name,
            eoppy_Sxolia: aiMaterials.sxolia,
            eoppy_AnatomPerioxi: aiMaterials.anatomiki_perioxi,
            eoppy_Symmetoxi: aiMaterials.symmetoxi,
            eoppy_SynPosotita: String(aiMaterials.synoliki_posotita_eidous),
            aiMatchedBy: c.matched_by,
            fuzzyMatched: c.fuzzy_matched,
        }));

        dispatch(removeAIMaterial(idx));
        onClose();
    }

    return (
        <Modal dialogClassName="modal-grow-scroll" show={show} onHide={onClose} centered contentClassName="premium-modal">
            <Modal.Header closeButton>
                <Modal.Title className="h6 mb-0">Επιλογή υλικών ERP</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="mt-3 modal-results">
                    {aiMaterials.erp_products?.length ? (
                        <div className="list-group">
                            {aiMaterials.erp_products.map((r, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="list-group-item list-group-item-action"
                                    onClick={() => applyMaterial(r, aiMaterials.synoliki_posotita_eidous)}
                                >
                                    <div className="fw-semibold">{r.erp_code || "—"}</div>
                                    <div className="small text-secondary">{r.erp_name || "—"}</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-secondary small text-center py-3">Δεν υπάρχουν αποτελέσματα.</div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
}
