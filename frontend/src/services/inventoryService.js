import axiosClient from '../api/axiosClient';

export const inventoryService = {
  list: () => axiosClient.get('/inventory').then((res) => res.data.data),
  lowStock: () => axiosClient.get('/inventory/low-stock').then((res) => res.data.data),
  restock: (ingredientId, quantity) =>
    axiosClient.post(`/inventory/${ingredientId}/restock`, { quantity }).then((res) => res.data.data),
};
