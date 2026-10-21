import { createSlice } from '@reduxjs/toolkit';
import { apiThunk } from '@/lib/api';
import { logout } from '@/features/auth/authSlice';

export const fetchCart = apiThunk('cart/fetch', () => ['/cart']);
export const addToCart = apiThunk('cart/add', ({ productId, quantity = 1 }) => [
    '/cart',
    { method: 'POST', body: { productId, quantity } },
]);
export const updateCartItem = apiThunk('cart/update', ({ productId, quantity }) => [
    `/cart/${productId}`,
    { method: 'PUT', body: { quantity } },
]);
export const removeCartItem = apiThunk('cart/remove', (productId) => [`/cart/${productId}`, { method: 'DELETE' }]);
export const clearCart = apiThunk('cart/clear', () => ['/cart', { method: 'DELETE' }]);

const emptyCart = { items: [], totalItems: 0, totalPrice: 0, deliveryFee: 0, freeDeliveryThreshold: 0 };

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cart: emptyCart,
        loaded: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        // Every cart endpoint answers with the whole cart
        const setCart = (state, action) => {
            state.cart = action.payload.cart;
            state.loaded = true;
        };

        builder
            .addCase(fetchCart.fulfilled, setCart)
            .addCase(addToCart.fulfilled, setCart)
            .addCase(updateCartItem.fulfilled, setCart)
            .addCase(removeCartItem.fulfilled, setCart)
            .addCase(clearCart.fulfilled, setCart)
            .addCase(logout.fulfilled, (state) => {
                state.cart = emptyCart;
                state.loaded = false;
            });
    },
});

export default cartSlice.reducer;
