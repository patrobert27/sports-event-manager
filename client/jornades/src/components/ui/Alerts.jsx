import React from 'react';

// Icones svg genèriques
const SuccessIcon = () => (
  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function SuccessAlert({ message }) {
  if (!message) {
    return null;
  }
  return (
    <div className="flex items-center gap-3 p-4 mb-4 text-sm text-success-dark bg-success/10 rounded-xl border border-success/20">
      <SuccessIcon />
      <span className="font-medium">{message}</span>
    </div>
  );
}

export function WarningAlert({ message }) {
  if (!message) {
    return null;
  }
  return (
    <div className="flex items-center gap-3 p-4 mb-4 text-sm text-warning-dark bg-warning/10 rounded-xl border border-warning/20">
      <WarningIcon />
      <span className="font-medium">{message}</span>
    </div>
  );
}

export function ErrorAlert({ message }) {
  if (!message) {
    return null;
  }
  return (
    <div className="flex items-center gap-3 p-4 mb-4 text-sm text-danger-dark bg-danger/10 rounded-xl border border-danger/20">
      <ErrorIcon />
      <span className="font-medium">{message}</span>
    </div>
  );
}

export function InfoAlert({ message }) {
  if (!message) {
    return null;
  }
  return (
    <div className="flex items-center gap-3 p-4 mb-4 text-sm text-primary-dark bg-primary/10 rounded-xl border border-primary/20">
      <InfoIcon />
      <span className="font-medium">{message}</span>
    </div>
  );
}
