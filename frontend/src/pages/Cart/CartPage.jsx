import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { removeLine, updateQuantity, clearCart, selectCartTotal } from '../../redux/slices/cartSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import { placeOrder } from '../../redux/slices/orderSlice';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lines = useSelector((state) => state.cart.lines);
  const total = useSelector(selectCartTotal);

  const handleCheckout = async () => {
    if (lines.length === 0) return;
    const payload = {
      channel: 'WEB',
      tableId: null,
      items: lines.map((l) => ({ itemId: l.itemId, quantity: l.quantity, optionValueIds: l.optionValueIds })),
    };
    const result = await dispatch(placeOrder(payload));
    if (placeOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      toast.success(`Order ${result.payload.order_number} placed!`);
      navigate(`/`);
    } else {
      toast.error(result.payload || 'Could not place order');
    }
  };

  if (lines.length === 0) {
    return (
      <Container>
        <h1 className="h4">Your cart is empty</h1>
        <Button variant="primary" onClick={() => navigate('/')}>Browse Menu</Button>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="h4 mb-3">Your Cart</h1>
      <Table responsive bordered>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Options</th>
            <th scope="col">Qty</th>
            <th scope="col">Unit Price</th>
            <th scope="col">Line Total</th>
            <th scope="col"><span className="visually-hidden">Remove</span></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx}>
              <td>{line.name}</td>
              <td className="small text-muted">{(line.optionLabels || []).join(', ')}</td>
              <td style={{ maxWidth: 90 }}>
                <Form.Control
                  type="number"
                  min={1}
                  value={line.quantity}
                  aria-label={`Quantity for ${line.name}`}
                  onChange={(e) => dispatch(updateQuantity({ index: idx, quantity: Number(e.target.value) }))}
                />
              </td>
              <td>{formatCurrency(line.unitPrice)}</td>
              <td>{formatCurrency(line.unitPrice * line.quantity)}</td>
              <td>
                <Button variant="outline-danger" size="sm" onClick={() => dispatch(removeLine(idx))}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center">
        <strong className="fs-5">Subtotal: {formatCurrency(total)}</strong>
        <Button variant="success" onClick={handleCheckout}>Place Order</Button>
      </div>
    </Container>
  );
}
