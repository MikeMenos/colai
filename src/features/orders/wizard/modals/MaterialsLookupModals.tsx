"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addDraftYliko, setDraftProperty } from "@/store/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";
import type {
  ProductSearchResult,
  SearchProductsSuccess,
} from "@/types/api/responses";
import { parseProxyJson } from "@/lib/api/client";

export type MaterialsLookupModal = ProductSearchResult;

export default function MaterialsLookupModal({
    show,
    onClose,
}: {
    show: boolean;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const [q, setQ] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [results, setResults] = React.useState<MaterialsLookupModal[]>([]);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const draftOrder = useAppSelector((s) => s.orders.draft.order)

    React.useEffect(() => {
        setQ("");
        setResults([]);
        setError(null);
        setLoading(false);
    }, [show]);

    async function search() {
        inputRef.current?.blur();
        const query = q.trim();

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/products?q=${encodeURIComponent(query)}&_ts=${Date.now()}`, {
                cache: "no-store",
                headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
            });
            const data = await parseProxyJson<SearchProductsSuccess>(
              res,
              "Search failed",
            );

            setResults(data.items ?? []);
        } catch (e: any) {
            setError(e?.message || "Search failed");
        } finally {
            setLoading(false);
        }
    }

    function applyProduct(c: MaterialsLookupModal) {
        dispatch(addDraftYliko({
            id: draftOrder.id,
            uid: draftOrder.uid,
            orderId: draftOrder.id,
            orderUID: draftOrder.uid,
            erpGid: c.erp_gid || "",
            erpCode: c.erp_code || "",
            erpName: c.erp_name || "",
            erp_Price: c.erp_price || 0,
            erp_EoppyPrice: c.erp_eoppyprice || 0,
            qty: 1,
            fuzzyMatched: c.fuzzy_matched ?? undefined,
            aiMatchedBy: c.matched_by ?? undefined,
            aiMatchedErpGid: c.erp_gid ?? undefined,
        }));

        onClose();
    }

    return (
        <Modal dialogClassName="modal-grow-scroll" show={show} onHide={onClose} centered contentClassName="premium-modal">
            <Modal.Header closeButton>
                <Modal.Title className="h6 mb-0">Αναζήτηση Υλικών</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="d-flex gap-2">
                    <input
                        ref={inputRef}
                        className="form-control"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        inputMode="search"
                        autoFocus
                        placeholder="Αναζήτησε με Κωδικό / Περιγραφή"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") search();
                        }}
                    />
                    <button type="button" className="btn btn-primary" onClick={search} disabled={q.trim().length < 2 || loading}>
                        <i className="bi bi-search" />
                    </button>
                </div>

                {error ? <div className="alert alert-danger py-2 small mt-3 mb-0">{error}</div> : null}

                <div className="mt-3 modal-results">
                    {loading ? (
                        <AppLoader label="Αναζήτηση…" card={false} />
                    ) : results.length ? (
                        <div className="list-group">
                            {results.map((r, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="list-group-item list-group-item-action"
                                    onClick={() => applyProduct(r)}
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
