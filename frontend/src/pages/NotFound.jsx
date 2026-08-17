import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

export default function NotFound() {
  return (
    <Container className="text-center py-5">
      <h1 className="display-4">404</h1>
      <p className="lead">We couldn't find the page you're looking for.</p>
      <Button as={Link} to="/" variant="primary">Back to Menu</Button>
    </Container>
  );
}
