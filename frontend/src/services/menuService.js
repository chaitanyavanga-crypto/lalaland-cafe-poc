import axiosClient from '../api/axiosClient';

export const menuService = {
  getCategories: () => axiosClient.get('/menu/categories').then((res) => res.data.data),
  getItems: (params) => axiosClient.get('/menu/items', { params }).then((res) => res.data),
  getItemDetail: (itemId) => axiosClient.get(`/menu/items/${itemId}`).then((res) => res.data.data),
  toggleAvailability: (itemId, isAvailable) =>
    axiosClient
      .patch(`/menu/items/${itemId}/availability`, { isAvailable })
      .then((res) => res.data.data),
  uploadImage: (itemId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosClient
      .post(`/menu/items/${itemId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data.data);
  },
};
