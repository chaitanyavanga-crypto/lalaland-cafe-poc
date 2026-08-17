import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';

// Read-only, cacheable server data -> TanStack Query rather than a Redux slice + useEffect.
// Redux stays reserved for client/app state (auth, cart, UI); this endpoint just needs
// caching, refetch-on-demand, and loading/error state, which useQuery gives for free.
function useSalesReport() {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const to = today.toISOString();

  return useQuery({
    queryKey: ['salesReport', from, to],
    queryFn: () => orderService.salesReport(from, to),
  });
}

export default function AdminDashboard() {
  const { data: report, isLoading, isError } = useSalesReport();

  if (isLoading) return <Loader label="Loading dashboard..." />;
  if (isError) return <Alert variant="danger">Could not load the sales report.</Alert>;

  const totalRevenue = (report || []).reduce((sum, r) => sum + Number(r.revenue || 0), 0);
  const totalOrders = (report || []).reduce((sum, r) => sum + Number(r.order_count || 0), 0);

  return (
    <Container>
      <h1 className="h4 mb-4">Admin Dashboard</h1>
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card body className="text-center shadow-sm">
            <div className="text-muted small">Orders (this month)</div>
            <div className="fs-3 fw-bold">{totalOrders}</div>
          </Card>
        </Col>
        <Col md={4}>
          <Card body className="text-center shadow-sm">
            <div className="text-muted small">Revenue (this month)</div>
            <div className="fs-3 fw-bold">{formatCurrency(totalRevenue)}</div>
          </Card>
        </Col>
        <Col md={4}>
          <Card body className="text-center shadow-sm">
            <div className="text-muted small">Avg Order Value</div>
            <div className="fs-3 fw-bold">{formatCurrency(totalOrders ? totalRevenue / totalOrders : 0)}</div>
          </Card>
        </Col>
      </Row>
      <p className="text-muted">
        Daily breakdown, menu performance, and staff management screens plug into this same layout —
        this POC wires up the sales report endpoint as the reference example.
      </p>
    </Container>
  );
}
