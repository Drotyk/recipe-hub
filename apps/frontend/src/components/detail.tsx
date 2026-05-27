import React from 'react';

import { PanelHeader } from './surface';

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="detail-grid">{children}</div>;
}

export function DetailCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function DetailSection({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="detail-section">
      <PanelHeader title={title} meta={meta} />
      {children}
    </section>
  );
}
