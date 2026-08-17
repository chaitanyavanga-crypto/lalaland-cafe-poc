import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { lines: [] }, // { itemId, name, quantity, unitPrice, optionValueIds, optionLabels }
  reducers: {
    addLine(state, action) {
      state.lines.push(action.payload);
    },
    removeLine(state, action) {
      state.lines.splice(action.payload, 1);
    },
    updateQuantity(state, action) {
      const { index, quantity } = action.payload;
      if (state.lines[index]) state.lines[index].quantity = Math.max(1, quantity);
    },
    clearCart(state) {
      state.lines = [];
    },
  },
});

export const { addLine, removeLine, updateQuantity, clearCart } = cartSlice.actions;

// Selector: derives cart totals rather than storing them redundantly in state
export const selectCartTotal = (state) =>
  state.cart.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

export default cartSlice.reducer;
