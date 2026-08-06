"use client";

import React from "react";
import { Alert, FormSelect } from "react-bootstrap";

import AppLoader from "@/components/ui/AppLoader";
import { parseProxyJson } from "@/lib/api/client";
import PelatologioCustomerCard from "@/features/pelatologio/PelatologioCustomerCard";
import PelatologioCustomerDetailsModal from "@/features/pelatologio/modals/PelatologioCustomerDetailsModal";
import type {
  ColaiSearchAmkaCustomer,
  ColaiSearchAmkaTypos,
  PostWcSearchAmkaResponse,
} from "@/types/api";

const SEARCH_OPTIONS: Array<{
  value: ColaiSearchAmkaTypos;
  label: string;
  placeholder: string;
}> = [
  {
    value: "AMKA",
    label: "ΑΜΚΑ",
    placeholder: "Αναζήτηση…",
  },
  {
    value: "NAME",
    label: "Ονοματεπώνυμο",
    placeholder: "Αναζήτηση…",
  },
  {
    value: "TELEPHONE",
    label: "Τηλέφωνο",
    placeholder: "Αναζήτηση…",
  },
];

export default function PelatologioPage() {
  const [typos, setTypos] = React.useState<ColaiSearchAmkaTypos>("AMKA");
  const [sea, setSea] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searched, setSearched] = React.useState(false);
  const [customers, setCustomers] = React.useState<ColaiSearchAmkaCustomer[]>(
    [],
  );
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<ColaiSearchAmkaCustomer | null>(null);

  const placeholder =
    SEARCH_OPTIONS.find((option) => option.value === typos)?.placeholder ??
    "Αναζήτηση…";

  async function runSearch(event?: React.FormEvent) {
    event?.preventDefault();
    const query = sea.trim();
    if (!query) {
      setError("Συμπληρώστε τιμή αναζήτησης.");
      setCustomers([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wc/search-amka", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typos, sea: query }),
        cache: "no-store",
      });
      const data = await parseProxyJson<PostWcSearchAmkaResponse>(
        res,
        "Η αναζήτηση πελατολογίου απέτυχε",
      );
      if (!data.ok) {
        throw new Error(data.message || "Η αναζήτηση πελατολογίου απέτυχε");
      }
      setCustomers(data.customers ?? []);
      setSearched(true);
    } catch (err) {
      setCustomers([]);
      setSearched(true);
      setError(
        err instanceof Error ? err.message : "Η αναζήτηση πελατολογίου απέτυχε",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="app-card p-3">
        <div className="fw-semibold mb-2">Πελατολόγιο</div>
        <form
          className="d-flex flex-column gap-2"
          onSubmit={(event) => void runSearch(event)}
        >
          <div className="d-flex gap-2">
            <FormSelect
              value={typos}
              onChange={(event) =>
                setTypos(event.target.value as ColaiSearchAmkaTypos)
              }
              aria-label="Τύπος αναζήτησης"
              style={{ maxWidth: 180 }}
            >
              {SEARCH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormSelect>
            <input
              className="form-control"
              value={sea}
              onChange={(event) => setSea(event.target.value)}
              placeholder={placeholder}
              inputMode={typos === "NAME" ? "text" : "numeric"}
              aria-label="Τιμή αναζήτησης"
            />
            <button
              type="submit"
              className="btn btn-primary flex-shrink-0"
              disabled={loading}
              aria-label="Αναζήτηση"
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  aria-hidden
                />
              ) : (
                <i className="bi bi-search" aria-hidden />
              )}
            </button>
          </div>
        </form>
      </div>

      {error ? (
        <Alert variant="danger" className="mb-0 py-2">
          {error}
        </Alert>
      ) : null}

      {loading ? <AppLoader label="Αναζήτηση…" /> : null}

      {!loading && searched && !error && customers.length === 0 ? (
        <div className="small text-secondary px-1">
          Δεν βρέθηκαν αποτελέσματα.
        </div>
      ) : null}

      {!loading && customers.length > 0 ? (
        <div className="d-flex flex-column gap-2">
          {customers.map((customer) => (
            <PelatologioCustomerCard
              key={customer.key}
              customer={customer}
              onOpen={setSelectedCustomer}
            />
          ))}
        </div>
      ) : null}

      {!loading && !searched && !error ? (
        <div className="app-card text-secondary small p-3">
          Επιλέξτε τύπο αναζήτησης και συμπληρώστε ΑΜΚΑ, ονοματεπώνυμο ή
          τηλέφωνο.
        </div>
      ) : null}

      <PelatologioCustomerDetailsModal
        show={selectedCustomer != null}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
