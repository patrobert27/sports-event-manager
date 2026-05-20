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

export default function JornadaStatusBadge({ 
  status = "REGISTRATION",
  registrationStart = null,
  registrationDeadline = null 
}) {
  const now = new Date();
  
  let label = statusMap[status]?.label || status;
  let tone = statusMap[status]?.tone || "bg-muted/10 text-muted";
  let isActive = status === 'REGISTRATION' || status === 'GROUP_STAGE';

  if (status === 'REGISTRATION') {
    if (registrationDeadline && new Date(registrationDeadline) < now) {
      label = "Inscripcions tancades";
      tone = "bg-danger/10 text-danger";
      isActive = false;
    } else if (registrationStart && new Date(registrationStart) > now) {
      label = "Inscripcions pendents";
      tone = "bg-amber-100 text-amber-700";
      isActive = false;
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${tone} ${isActive ? 'animate-pulse-subtle' : ''}`}>
      {isActive && <div className="w-1 h-1 rounded-full bg-current" />}
      {label}
    </span>
  );
}
