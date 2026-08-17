import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="lc-footer mt-5 pt-5 pb-3" role="contentinfo">
      <Container>
        <Row className="gy-4">
          <Col xs={12} md={4}>
            <div className="lc-brand-text mb-2">☕ Lalaland Cafe</div>
            <p className="small mb-0" style={{ maxWidth: 320 }}>
              Handcrafted milk teas, matcha, and coffee, made your way. Order ahead and skip the line.
            </p>
          </Col>
          <Col xs={6} md={4} lg={2}>
            <h6>Menu</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="/">All drinks</a></li>
              <li className="mb-2"><a href="/">Coffee</a></li>
              <li className="mb-2"><a href="/">Milk Tea</a></li>
            </ul>
          </Col>
          <Col xs={6} md={4} lg={2}>
            <h6>Get to know us</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="/login">Login</a></li>
              <li className="mb-2"><a href="/register">Sign Up</a></li>
            </ul>
          </Col>
          <Col xs={12} md={4} lg={4}>
            <h6>Connect with us</h6>
            <ul className="list-unstyled small d-flex gap-3">
              <li><a href="#" aria-label="Facebook">Facebook</a></li>
              <li><a href="#" aria-label="Instagram">Instagram</a></li>
              <li><a href="#" aria-label="Twitter">Twitter</a></li>
            </ul>
          </Col>
        </Row>
        <div className="lc-footer-bottom mt-4 pt-3 text-center small">
          &copy; {new Date().getFullYear()} Lalaland Cafe & Drink Studio. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
