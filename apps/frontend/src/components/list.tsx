import React from 'react';

export function EntityListButton({
  selected = false,
  title,
  subtitle,
  meta,
  onClick,
}: {
  selected?: boolean;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" className={`list-item${selected ? ' is-selected' : ''}`} onClick={onClick}>
      <div>
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      {meta ? <time>{meta}</time> : null}
    </button>
  );
}

export function StaticListRow({
  title,
  subtitle,
  meta,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="list-item static-item">
      <div>
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      {meta ? <time>{meta}</time> : null}
    </div>
  );
}
