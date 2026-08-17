import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, ListGroup, Badge, Button, Row, Col } from 'react-bootstrap';
import { fetchQueue, updateOrderStatus } from '../../redux/slices/orderSlice';
import { NEXT_STATUS } from '../../constants/orderStatus';

export default function QueuePage() {
  const dispatch = useDispatch();
  const queue = useSelector((state) => state.order.queue);

  useEffect(() => {
    dispatch(fetchQueue());
    // Poll every 15s so baristas see new orders without a manual refresh.
    const interval = setInterval(() => dispatch(fetchQueue()), 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Container>
      <h1 className="h4 mb-3">Kitchen Queue</h1>
      <ListGroup>
        {queue.length === 0 && <ListGroup.Item>No active orders right now.</ListGroup.Item>}
        {queue.map((order) => (
          <ListGroup.Item key={order.order_id}>
            <Row className="align-items-center">
              <Col xs={12} md={6}>
                <strong>#{order.queue_number}</strong> — {order.order_number}{' '}
                <Badge bg={order.status === 'PREPARING' ? 'warning' : 'secondary'}>{order.status}</Badge>
              </Col>
              <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
                {NEXT_STATUS[order.status] && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="rounded-pill"
                    onClick={() => dispatch(updateOrderStatus({ orderId: order.order_id, status: NEXT_STATUS[order.status] }))}
                  >
                    Mark as {NEXT_STATUS[order.status]}
                  </Button>
                )}
              </Col>
            </Row>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}
