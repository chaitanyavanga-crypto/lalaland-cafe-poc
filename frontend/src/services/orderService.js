import axiosClient from '../api/axiosClient';

export const orderService = {
  placeOrder: (payload) => axiosClient.post('/orders', payload).then((res) => res.data.data),
  getOrder: (orderId) => axiosClient.get(`/orders/${orderId}`).then((res) => res.data.data),
  getQueue: () => axiosClient.get('/orders').then((res) => res.data.data),
  updateStatus: (orderId, status) =>
    axiosClient.patch(`/orders/${orderId}/status`, { status }).then((res) => res.data.data),
  salesReport: (from, to) =>
    axiosClient.get('/orders/reports/sales', { params: { from, to } }).then((res) => res.data.data),
};
