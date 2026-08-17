import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Offcanvas, Button, Badge } from 'react-bootstrap';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { removeLine, selectCartTotal } from '../../redux/slices/cartSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from './EmptyState';

export default function CartDrawer() {
  const { isOpen, closeCartDrawer } = useCartDrawer();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lines = useSelector((state) => state.cart.lines);
  const total = useSelector(selectCartTotal);

  const goToCart = () => {
    closeCartDrawer();
    navigate('/cart');
  };

  return (
    <Offcanvas show={isOpen} onHide={closeCartDrawer} placement="end" aria-labelledby="cart-drawer-title">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="cart-drawer-title">
          Your Cart {lines.length > 0 && <Badge bg="secondary">{lines.length}</Badge>}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column">
        {lines.length === 0 ? (
          <EmptyState
            icon="🧋"
            title="Your cart is empty"
            message="Add a drink to get started."
            actionLabel="Browse Menu"
            onAction={() => {
              closeCartDrawer();
              navigate('/');
            }}
          />
        ) : (
          <>
            <div className="flex-grow-1 overflow-auto">
              {lines.map((line, idx) => (
                <div key={idx} className="lc-cart-item d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold">{line.name} &times; {line.quantity}</div>
                    <div className="text-muted small">{(line.optionLabels || []).join(', ')}</div>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold">{formatCurrency(line.unitPrice * line.quantity)}</div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => dispatch(removeLine(idx))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-top pt-3 mt-2">
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-semibold">Subtotal</span>
                <span className="fw-bold">{formatCurrency(total)}</span>
              </div>
              <Button variant="primary" className="w-100 rounded-pill" onClick={goToCart}>
                View Cart & Checkout
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
