import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Table, Badge, Button, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { menuService } from '../../services/menuService';
import { formatCurrency } from '../../utils/formatCurrency';
import FoodImage from '../../components/common/FoodImage';
import Loader from '../../components/common/Loader';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function MenuManagementPage() {
  const queryClient = useQueryClient();
  const fileInputRefs = useRef({});
  const [uploadingItemId, setUploadingItemId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['menuItems', 'admin'],
    queryFn: () => menuService.getItems({ page: 1, limit: 100 }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }) => menuService.toggleAvailability(itemId, isAvailable),
    onSuccess: () => {
      toast.success('Availability updated');
      queryClient.invalidateQueries({ queryKey: ['menuItems', 'admin'] });
    },
    onError: () => toast.error('Could not update availability'),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ itemId, file }) => menuService.uploadImage(itemId, file),
    onSuccess: () => {
      toast.success('Image updated');
      queryClient.invalidateQueries({ queryKey: ['menuItems', 'admin'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
    onSettled: () => setUploadingItemId(null),
  });

  const handleFileChange = (itemId, e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploadingItemId(itemId);
    uploadMutation.mutate({ itemId, file });
  };

  if (isLoading) return <Loader label="Loading menu items..." />;
  if (isError) return <Alert variant="danger">Could not load menu items.</Alert>;

  const items = data?.items || [];

  return (
    <Container>
      <h1 className="h4 mb-3">Menu Management</h1>
      <p className="text-muted">
        Toggle availability or replace a product photo. New photos upload immediately and take
        effect on the customer-facing menu right away.
      </p>
      <Table responsive bordered className="align-middle">
        <thead>
          <tr>
            <th scope="col">Image</th>
            <th scope="col">Name</th>
            <th scope="col">Price</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.item_id}>
              <td style={{ width: 80 }}>
                <div style={{ width: 64, height: 48, borderRadius: 8, overflow: 'hidden' }}>
                  <FoodImage src={item.image_url} alt={item.name} className="w-100 h-100" />
                </div>
              </td>
              <td>{item.name}</td>
              <td>{formatCurrency(item.base_price)}</td>
              <td>
                <Badge bg={item.is_available ? 'success' : 'secondary'}>
                  {item.is_available ? 'Available' : 'Sold Out'}
                </Badge>
              </td>
              <td className="d-flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={item.is_available ? 'outline-secondary' : 'outline-success'}
                  disabled={toggleMutation.isPending}
                  onClick={() =>
                    toggleMutation.mutate({ itemId: item.item_id, isAvailable: !item.is_available })
                  }
                >
                  {item.is_available ? 'Mark Sold Out' : 'Mark Available'}
                </Button>

                <Form.Control
                  ref={(el) => (fileInputRefs.current[item.item_id] = el)}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="d-none"
                  onChange={(e) => handleFileChange(item.item_id, e)}
                />
                <Button
                  size="sm"
                  variant="outline-primary"
                  disabled={uploadingItemId === item.item_id}
                  onClick={() => fileInputRefs.current[item.item_id]?.click()}
                >
                  {uploadingItemId === item.item_id ? 'Uploading...' : 'Change Photo'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
