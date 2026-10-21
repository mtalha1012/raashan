import { createSlice } from '@reduxjs/toolkit';
import { apiThunk } from '@/lib/api';
import { logout } from '@/features/auth/authSlice';

export const fetchSlots = apiThunk('orders/slots', (date) => [date ? `/slots?date=${date}` : '/slots']);
export const placeOrder = apiThunk('orders/place', (details) => ['/order/new', { method: 'POST', body: details }]);
export const fetchMyOrders = apiThunk('orders/mine', () => ['/orders/me']);
export const fetchHouseholdOrders = apiThunk('orders/household', () => ['/household/orders']);
export const fetchOrder = apiThunk('orders/one', (id) => [`/order/${id}`]);
export const cancelOrder = apiThunk('orders/cancel', (id) => [`/order/${id}/cancel`, { method: 'PUT' }]);

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        mine: [],
        household: [],
        order: null,
        slots: { date: null, dates: [], slots: [] },
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSlots.fulfilled, (state, action) => {
                const { date, dates, slots } = action.payload;
                state.slots = { date, dates, slots };
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.mine = action.payload.orders;
            })
            .addCase(fetchHouseholdOrders.fulfilled, (state, action) => {
                state.household = action.payload.orders;
            })
            .addCase(fetchOrder.pending, (state) => {
                state.order = null;
            })
            .addCase(fetchOrder.fulfilled, (state, action) => {
                state.order = action.payload.order;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                const { order } = action.payload;
                if (state.order?._id === order._id) state.order = { ...state.order, orderStatus: order.orderStatus };
                state.mine = state.mine.map((existing) => (existing._id === order._id ? order : existing));
            })
            .addCase(logout.fulfilled, (state) => {
                state.mine = [];
                state.household = [];
                state.order = null;
            });
    },
});

export default ordersSlice.reducer;
