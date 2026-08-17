import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" role="status" aria-live="polite">
      <Spinner animation="border" variant="primary" />
      <span className="mt-2">{label}</span>
    </div>
  );
}
