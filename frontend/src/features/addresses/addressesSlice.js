import { createSlice } from '@reduxjs/toolkit';
import { apiThunk } from '@/lib/api';
import { logout } from '@/features/auth/authSlice';

export const fetchAddresses = apiThunk('addresses/fetch', () => ['/addresses']);
export const createAddress = apiThunk('addresses/create', (address) => ['/addresses', { method: 'POST', body: address }]);
export const updateAddress = apiThunk('addresses/update', ({ _id, ...address }) => [
    `/addresses/${_id}`,
    { method: 'PUT', body: address },
]);
export const deleteAddress = apiThunk('addresses/delete', (id) => [`/addresses/${id}`, { method: 'DELETE' }]);

const addressesSlice = createSlice({
    name: 'addresses',
    initialState: {
        items: [],
        loaded: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.items = action.payload.addresses;
                state.loaded = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.items = [];
                state.loaded = false;
            });
    },
});

export default addressesSlice.reducer;
