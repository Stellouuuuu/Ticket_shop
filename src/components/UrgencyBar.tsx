import {
  TICKETS_WEEKLY_REMAINING,
  TICKETS_WEEKLY_TOTAL,
} from "@/lib/constants";

export default function UrgencyBar() {
  const pct = Math.round(
    (TICKETS_WEEKLY_REMAINING / TICKETS_WEEKLY_TOTAL) * 100
  );

  return (
    <div className="urgency-bar">
      <p className="urgency-bar__text">
        Il reste{" "}
        <strong>{TICKETS_WEEKLY_REMAINING} tickets</strong> sur{" "}
        {TICKETS_WEEKLY_TOTAL} cette semaine
      </p>
      <div
        className="urgency-bar__track"
        role="progressbar"
        aria-valuenow={TICKETS_WEEKLY_REMAINING}
        aria-valuemin={0}
        aria-valuemax={TICKETS_WEEKLY_TOTAL}
        aria-label="Tickets restants cette semaine"
      >
        <div className="urgency-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
