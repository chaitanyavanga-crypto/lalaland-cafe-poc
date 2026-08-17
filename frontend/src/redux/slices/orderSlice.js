import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

export const placeOrder = createAsyncThunk('order/place', async (payload, { rejectWithValue }) => {
  try {
    return await orderService.placeOrder(payload);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Could not place order');
  }
});

export const fetchQueue = createAsyncThunk('order/fetchQueue', async () => {
  return orderService.getQueue();
});

export const updateOrderStatus = createAsyncThunk('order/updateStatus', async ({ orderId, status }) => {
  return orderService.updateStatus(orderId, status);
});

const orderSlice = createSlice({
  name: 'order',
  initialState: { lastOrder: null, queue: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchQueue.fulfilled, (state, action) => {
        state.queue = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.queue = state.queue.map((o) => (o.order_id === action.payload.order_id ? action.payload : o));
      });
  },
});

export default orderSlice.reducer;
