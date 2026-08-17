import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { menuService } from '../../services/menuService';

export const fetchCategories = createAsyncThunk('menu/fetchCategories', async () => {
  return menuService.getCategories();
});

export const fetchItems = createAsyncThunk('menu/fetchItems', async (filters = {}) => {
  return menuService.getItems(filters);
});

export const fetchItemDetail = createAsyncThunk('menu/fetchItemDetail', async (itemId) => {
  return menuService.getItemDetail(itemId);
});

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    categories: [],
    items: [],
    pagination: null,
    selectedItem: null,
    status: 'idle',
    error: null,
    itemDetailStatus: 'idle',
    itemDetailError: null,
  },
  reducers: {
    clearSelectedItem(state) {
      state.selectedItem = null;
      state.itemDetailStatus = 'idle';
      state.itemDetailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        // Without this, a dead/unreachable backend leaves the page stuck on
        // skeleton loaders forever with no indication anything is wrong —
        // which looks exactly like "clicking a drink does nothing".
        state.status = 'failed';
        state.items = [];
        state.error =
          action.error?.message === 'Network Error'
            ? 'Cannot reach the API. Is the backend running?'
            : action.error?.message || 'Failed to load the menu.';
      })
      .addCase(fetchItemDetail.pending, (state) => {
        state.itemDetailStatus = 'loading';
        state.itemDetailError = null;
      })
      .addCase(fetchItemDetail.fulfilled, (state, action) => {
        state.itemDetailStatus = 'succeeded';
        state.selectedItem = action.payload;
      })
      .addCase(fetchItemDetail.rejected, (state, action) => {
        state.itemDetailStatus = 'failed';
        state.itemDetailError =
          action.error?.message === 'Network Error'
            ? 'Cannot reach the API. Is the backend running?'
            : action.error?.message || 'Failed to load this drink.';
      });
  },
});

export const { clearSelectedItem } = menuSlice.actions;
export default menuSlice.reducer;
