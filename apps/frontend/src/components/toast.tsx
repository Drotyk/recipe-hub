import React from 'react';

import { Button } from './button';

export type ToastItem = {
  id: number;
  tone: 'error' | 'success';
  text: string;
};

export function ToastStack({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {items.map((item) => (
        <section key={item.id} className={`toast toast-${item.tone}`} role="status">
          <div className="toast-copy">
            <span className="toast-label">{item.tone === 'error' ? 'Помилка' : 'Успіх'}</span>
            <p>{item.text}</p>
          </div>

          <Button type="button" variant="ghost" className="toast-dismiss" onClick={() => onDismiss(item.id)}>
            Закрити
          </Button>
        </section>
      ))}
    </div>
  );
}
