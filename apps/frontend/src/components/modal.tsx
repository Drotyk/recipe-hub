import React from 'react';

import { Button } from './button';

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-copy">
          <span className="modal-label">Підтвердження</span>
          <h2 id="confirm-modal-title">{title}</h2>
          <p>{description}</p>
        </div>

        <div className="inline-actions">
          <Button type="button" onClick={onCancel} disabled={busy}>
            Скасувати
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Виконується...' : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
