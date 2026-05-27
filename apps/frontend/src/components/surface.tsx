import React from 'react';

export function PanelHeader({
  title,
  meta,
}: {
  title: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="panel-header">
      <h2>{title}</h2>
      {meta ? <span>{meta}</span> : null}
    </div>
  );
}

export function StatusMessage({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'error' | 'success';
}) {
  const className =
    tone === 'error'
      ? 'message message-error'
      : tone === 'success'
        ? 'message message-success'
        : 'message';

  return <div className={className}>{children}</div>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state-label">Немає даних</span>
      <p>{children}</p>
    </div>
  );
}

export function ContentList({ children }: { children: React.ReactNode }) {
  return <div className="list">{children}</div>;
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="list" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-row">
          <div className="skeleton-copy">
            <span className="skeleton-line skeleton-line-title" />
            <span className="skeleton-line skeleton-line-body" />
          </div>
          <span className="skeleton-line skeleton-line-meta" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton({ cards = 4, sections = 1 }: { cards?: number; sections?: number }) {
  return (
    <div className="detail-skeleton" aria-hidden="true">
      <div className="detail-grid">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="detail-card skeleton-card">
            <span className="skeleton-line skeleton-line-body" />
            <span className="skeleton-line skeleton-line-title" />
          </div>
        ))}
      </div>

      {Array.from({ length: sections }).map((_, index) => (
        <section key={index} className="detail-section skeleton-section">
          <span className="skeleton-line skeleton-line-title" />
          <span className="skeleton-line skeleton-line-body" />
          <span className="skeleton-line skeleton-line-body" />
          <span className="skeleton-line skeleton-line-short" />
        </section>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="table-skeleton" aria-hidden="true">
      <div className="table-skeleton-head">
        {Array.from({ length: columns }).map((_, index) => (
          <span key={index} className="skeleton-line skeleton-line-body" />
        ))}
      </div>

      <div className="table-skeleton-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="table-skeleton-row">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <span
                key={colIndex}
                className={`skeleton-line ${colIndex === 0 ? 'skeleton-line-short' : 'skeleton-line-body'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
