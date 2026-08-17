import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Table, Badge, Button, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { inventoryService } from '../../services/inventoryService';
import Loader from '../../components/common/Loader';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [restockAmounts, setRestockAmounts] = useState({});

  const { data: ingredients, isLoading, isError } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.list,
  });

  const restockMutation = useMutation({
    mutationFn: ({ ingredientId, quantity }) => inventoryService.restock(ingredientId, quantity),
    onSuccess: () => {
      toast.success('Stock updated');
      // Refetch instead of hand-rolling an optimistic update — restock also writes an
      // audit row server-side, so the list is cheap to just re-pull.
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => toast.error('Could not update stock'),
  });

  const handleRestock = (ingredientId) => {
    const qty = Number(restockAmounts[ingredientId]);
    if (!qty || qty <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    restockMutation.mutate({ ingredientId, quantity: qty });
  };

  if (isLoading) return <Loader label="Loading inventory..." />;
  if (isError) return <Alert variant="danger">Could not load inventory.</Alert>;

  return (
    <Container>
      <h1 className="h4 mb-3">Inventory</h1>
      <Table responsive bordered>
        <thead>
          <tr>
            <th scope="col">Ingredient</th>
            <th scope="col">Stock</th>
            <th scope="col">Reorder Level</th>
            <th scope="col">Status</th>
            <th scope="col">Restock</th>
          </tr>
        </thead>
        <tbody>
          {(ingredients || []).map((ing) => {
            const low = Number(ing.stock_qty) <= Number(ing.reorder_level);
            return (
              <tr key={ing.ingredient_id}>
                <td>{ing.name}</td>
                <td>{ing.stock_qty} {ing.unit}</td>
                <td>{ing.reorder_level} {ing.unit}</td>
                <td><Badge bg={low ? 'danger' : 'success'}>{low ? 'Low Stock' : 'OK'}</Badge></td>
                <td className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    style={{ maxWidth: 100 }}
                    aria-label={`Restock quantity for ${ing.name}`}
                    onChange={(e) => setRestockAmounts({ ...restockAmounts, [ing.ingredient_id]: e.target.value })}
                  />
                  <Button size="sm" className="rounded-pill" disabled={restockMutation.isPending} onClick={() => handleRestock(ing.ingredient_id)}>
                    Add
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}
