import React from "react";

const statusMap = {
  REGISTRATION: {
    label: "Inscripcions",
    tone: "bg-primary/10 text-primary"
  },
  GROUP_STAGE: {
    label: "Fase de grups",
    tone: "bg-vote/10 text-vote"
  },
  SEMIFINALS: {
    label: "Semifinals",
    tone: "bg-warning/10 text-warning"
  },
  FINAL_STAGE: {
    label: "Final",
    tone: "bg-accent/10 text-accent"
  },
  FINISHED: {
    label: "Finalitzada",
    tone: "bg-danger/10 text-danger"
  },
};

export default function JornadaStatusBadge({ status = "REGISTRATION" }) {
  const meta = statusMap[status] || { label: status, tone: "bg-muted/10 text-muted" };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${meta.tone}`}>
      {meta.label}
    </span>
  );
}
