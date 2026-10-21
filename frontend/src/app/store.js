import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import shopReducer from '@/features/shop/shopSlice';
import cartReducer from '@/features/cart/cartSlice';
import householdReducer from '@/features/household/householdSlice';
import addressesReducer from '@/features/addresses/addressesSlice';
import ordersReducer from '@/features/orders/ordersSlice';
import adminReducer from '@/features/admin/adminSlice';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        shop: shopReducer,
        cart: cartReducer,
        household: householdReducer,
        addresses: addressesReducer,
        orders: ordersReducer,
        admin: adminReducer,
        ui: uiReducer,
    },
});
