import React from 'react';

import type { CollectionMetadata } from '../api';
import { Button } from './button';
import { Field, Select } from './form';

export function CollectionControls({
  metadata,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
}: {
  metadata: CollectionMetadata | null | undefined;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  const totalPages = Math.max(metadata?.totalPages ?? 1, 1);
  const totalItems = metadata?.totalItems ?? 0;

  return (
    <div className="collection-controls">
      <div className="collection-meta">
        <span>Page {page} of {totalPages}</span>
        <span>{totalItems} items</span>
      </div>

      <div className="collection-actions">
        <Field label="Rows">
          <Select value={perPage} onChange={(event) => onPerPageChange(Number(event.target.value))}>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </Select>
        </Field>

        <div className="inline-actions">
          <Button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <Button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
