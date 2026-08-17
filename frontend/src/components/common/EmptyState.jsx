import React from 'react';
import { Button } from 'react-bootstrap';

/**
 * Shared empty-state block — used for "no search results", "empty cart",
 * "no active orders", etc. so every empty screen looks consistent.
 */
export default function EmptyState({ icon = '🍵', title, message, actionLabel, onAction }) {
  return (
    <div className="lc-empty-state" role="status">
      <div style={{ fontSize: '3rem', lineHeight: 1 }} aria-hidden="true">{icon}</div>
      <h2 className="h5 mt-3 mb-1">{title}</h2>
      {message && <p className="mb-3">{message}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
