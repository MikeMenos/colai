"use client";

import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import AppLoader from "@/components/ui/AppLoader";
import { fetchDashboardData } from "@/store/dashboard/slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  RecentOrdersByDayChart,
  WcDistributionCharts,
} from "@/features/home/components/DashboardCharts";
import { parseProxyJson } from "@/lib/api/client";
import {
  isManagerWithoutSellerRole,
  normalizeSellerCode,
} from "@/lib/sellerAccess";
import { formatIntGR, parseLocaleNumber } from "@/lib/utils/number";
import type { WcStoixoiMina } from "@/types/dashboard";
import type { GetWcTeamatesSuccess, SellerTeamatesWC } from "@/types/api";
import Link from "next/link";
import React from "react";
import { Alert } from "react-bootstrap";

type WcEndpointSummary = {
  newCount: number;
  repeatCount: number;
  turnover: number;
};

const emptyWcSummary: WcEndpointSummary = {
  newCount: 0,
  repeatCount: 0,
  turnover: 0,
};

const SELLER_REPORTS_HREF = "/powerbi/seller-reports";

function sumTeamRows(records: SellerTeamatesWC[]): WcEndpointSummary {
  return records.reduce<WcEndpointSummary>(
    (acc, record) => ({
      newCount: acc.newCount + parseLocaleNumber(record.NEW),
      repeatCount: acc.repeatCount + parseLocaleNumber(record.REP),
      turnover: acc.turnover + parseLocaleNumber(record.TURNOVER),
    }),
    emptyWcSummary,
  );
}

function wcSummaryToChartData(summary: WcEndpointSummary): WcStoixoiMina {
  const total = summary.newCount + summary.repeatCount;
  const newShare = total > 0 ? summary.newCount / total : 0;
  const amountNew = summary.turnover * newShare;

  return {
    count_paragg_new: summary.newCount,
    count_paragg_repeat: summary.repeatCount,
    amount_paragg_new: amountNew,
    amount_paragg_repeat: summary.turnover - amountNew,
  };
}

type MetricCardProps = {
  title: string;
  value: string;
  delta?: string | null;
  deltaDirection?: "up" | "down" | "neutral";
  icon: string;
  href?: string;
};

function MetricCard({
  title,
  value,
  delta,
  deltaDirection = "neutral",
  icon,
  href,
}: MetricCardProps) {
  const showDelta = delta != null && delta !== "";

  let badgeClass = "text-bg-secondary";
  let arrowIcon = "bi-dash-lg";
  if (deltaDirection === "up") {
    badgeClass = "text-bg-success";
    arrowIcon = "bi-arrow-up";
  } else if (deltaDirection === "down") {
    badgeClass = "text-bg-danger";
    arrowIcon = "bi-arrow-down";
  }

  const body = (
    <div
      className={`app-card px-3 py-2 h-100${href ? "app-card-pressable" : ""}`}
      style={href ? { WebkitTapHighlightColor: "transparent" } : undefined}
    >
      <div className="d-flex align-items-start justify-content-between">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-3 bg-body-tertiary"
          style={{ width: 40, height: 40 }}
        >
          <i className={`bi ${icon}`} style={{ fontSize: "1.15rem" }} />
        </div>
        {showDelta ? (
          <span className={`badge ${badgeClass} app-pill`}>
            {deltaDirection !== "neutral" ? (
              <i className={`bi ${arrowIcon} me-1`} />
            ) : null}
            {delta}
          </span>
        ) : href ? (
          <i
            className="bi bi-chevron-right text-secondary"
            style={{ fontSize: "1.1rem" }}
            aria-hidden
          />
        ) : null}
      </div>

      <div className="mt-3">
        <div className="small text-secondary" style={{ lineHeight: 1.1 }}>
          {title}
        </div>
        <div
          className="h5 fw-bold mt-1 mb-0"
          style={{ letterSpacing: "-0.02em" }}
        >
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div className="col-6">
      {href ? (
        <Link
          href={href}
          className="text-decoration-none text-reset d-block h-100"
          aria-label={`${title} — μετάβαση`}
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

function WcMonthCard() {
  const userInfos = useAppSelector((s) => s.auth.userInfos);
  const isManager = isManagerWithoutSellerRole(userInfos);
  const loggedSellerCode = normalizeSellerCode(userInfos?.sellerCode);
  const [summary, setSummary] =
    React.useState<WcEndpointSummary>(emptyWcSummary);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!userInfos) return;

    let alive = true;

    async function loadWcSummary() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/wc/teamates", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        const data = await parseProxyJson<GetWcTeamatesSuccess>(
          res,
          "Failed to load WC sales summary",
        );
        if (!alive) return;

        const records = data.records ?? [];

        if (isManager) {
          setSummary(sumTeamRows(records));
          return;
        }

        const sellerRecord =
          records.find(
            (record) =>
              normalizeSellerCode(record.SELLERCODE) === loggedSellerCode,
          ) ??
          records[0] ??
          null;

        setSummary(
          sellerRecord
            ? {
                newCount: parseLocaleNumber(sellerRecord.NEW),
                repeatCount: parseLocaleNumber(sellerRecord.REP),
                turnover: parseLocaleNumber(sellerRecord.TURNOVER),
              }
            : emptyWcSummary,
        );
      } catch (err) {
        if (!alive) return;
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load WC sales summary";
        setSummary(emptyWcSummary);
        setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadWcSummary();

    return () => {
      alive = false;
    };
  }, [userInfos, isManager, loggedSellerCode]);

  return (
    <Link
      href="/salesWC"
      className="text-decoration-none text-reset d-block"
      aria-label="WC μήνας — μετάβαση στις πωλήσεις WC"
    >
      <div
        className="app-card app-card-pressable p-3"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <div className="fw-semibold">Πωλήσεις WC </div>
            <div className="small text-secondary">
              Νέες και επαναλαμβανόμενες παραγγελίες
            </div>
          </div>
          <i className="bi bi-chevron-right text-secondary" aria-hidden />
        </div>
        {loading ? (
          <div className="small text-secondary mt-3">Φόρτωση...</div>
        ) : (
          <WcDistributionCharts wc={wcSummaryToChartData(summary)} />
        )}
        {error ? (
          <div className="small text-danger mt-2">
            Δεν φορτώθηκαν τα στοιχεία WC.
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function MonthComparisonCard({
  current,
  previous,
  pendingReviews,
}: {
  current: number;
  previous: number;
  pendingReviews: number;
}) {
  const max = Math.max(current, previous, 1);
  const currPct = (current / max) * 100;
  const prevPct = (previous / max) * 100;

  return (
    <div className="app-card px-3 py-2">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="fw-semibold">Παραγγελίες & εκκρεμότητες</div>
          <div className="small text-secondary">
            Τρέχων vs προηγούμενος μήνας
          </div>
        </div>
        <span
          className={`badge app-pill ${pendingReviews > 0 ? "bg-warning-subtle text-warning-emphasis" : "bg-success-subtle text-success-emphasis"}`}
        >
          {formatIntGR(pendingReviews)} εκκρεμείς
        </span>
      </div>

      <div className="mt-3">
        <div className="d-flex justify-content-between small text-secondary mb-1">
          <span>Προηγούμενος μήνας</span>
          <span className="fw-medium text-body">{formatIntGR(previous)}</span>
        </div>
        <div
          className="rounded-pill bg-body-tertiary mb-3"
          style={{ height: 8, overflow: "hidden" }}
          role="presentation"
        >
          <div
            className="bg-secondary rounded-pill h-100"
            style={{ width: `${prevPct}%`, opacity: 0.45 }}
          />
        </div>

        <div className="d-flex justify-content-between small text-secondary mb-1">
          <span>Τρέχων μήνας</span>
          <span className="fw-medium text-body">{formatIntGR(current)}</span>
        </div>
        <div
          className="rounded-pill bg-body-tertiary"
          style={{ height: 8, overflow: "hidden" }}
          role="presentation"
        >
          <div
            className="bg-primary rounded-pill h-100"
            style={{ width: `${currPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function HomeStats() {
  const dispatch = useAppDispatch();
  const dash = useAppSelector((s) => s.dashboard);

  React.useEffect(() => {
    void dispatch(fetchDashboardData());
  }, [dispatch]);

  const showInitialDashLoader = dash.loading && dash.lastFetchedAt === 0;

  return (
    <div
      className="d-flex flex-column h-100"
      style={{
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {dash.error ? (
        <Alert variant="danger" className="mb-3 py-2">
          {dash.error}
        </Alert>
      ) : null}

      {showInitialDashLoader ? <AppLoader label="Φόρτωση αρχικής…" /> : null}

      <div className={showInitialDashLoader ? "d-none" : undefined}>
        <div className="row g-3 mb-3">
          <MetricCard
            title="Αναφορές πωλητών"
            value="PowerBI"
            delta={null}
            icon="bi-bar-chart-line"
            href={SELLER_REPORTS_HREF}
          />
          <MetricCard
            title="Συνταγές επόμενων 10 ημερών"
            value={formatIntGR(dash.next10DaysSyntages)}
            delta={null}
            icon="bi-paperclip"
            href="/diadikasia-wc?next10=1"
          />
        </div>

        <div className="d-grid gap-3">
          <WcMonthCard />
          <MonthComparisonCard
            current={dash.totalOrders_month}
            previous={dash.totalOrders_prev_month}
            pendingReviews={dash.pendingReviews}
          />
          <div className="app-card px-3 py-2">
            <div className="fw-semibold">Πρόσφατες παραγγελίες</div>
            <div className="small text-secondary">Τελευταίες 14 ημέρες</div>
            <RecentOrdersByDayChart orders={dash.lastOrders} />
          </div>
        </div>
      </div>

      <FloatingActionButton href="/orders/0" ariaLabel="Νέα παραγγελία" />
    </div>
  );
}
