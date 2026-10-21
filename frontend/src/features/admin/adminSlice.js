import { createSlice } from '@reduxjs/toolkit';
import { apiThunk } from '@/lib/api';

// Products
export const fetchAdminProducts = apiThunk('admin/products', () => ['/admin/products']);
export const saveProduct = apiThunk('admin/saveProduct', ({ _id, ...product }) =>
    _id ? [`/products/${_id}`, { method: 'PUT', body: product }] : ['/products/new', { method: 'POST', body: product }],
);
export const deleteProduct = apiThunk('admin/deleteProduct', (id) => [`/products/${id}`, { method: 'DELETE' }]);

// Categories (listing is public, it lives in the shop slice)
export const saveCategory = apiThunk('admin/saveCategory', ({ _id, ...category }) =>
    _id
        ? [`/admin/categories/${_id}`, { method: 'PUT', body: category }]
        : ['/admin/categories', { method: 'POST', body: category }],
);
export const deleteCategory = apiThunk('admin/deleteCategory', (id) => [`/admin/categories/${id}`, { method: 'DELETE' }]);

// Delivery slots
export const fetchAdminSlots = apiThunk('admin/slots', () => ['/admin/slots']);
export const saveSlot = apiThunk('admin/saveSlot', ({ _id, ...slot }) =>
    _id ? [`/admin/slots/${_id}`, { method: 'PUT', body: slot }] : ['/admin/slots', { method: 'POST', body: slot }],
);
export const deleteSlot = apiThunk('admin/deleteSlot', (id) => [`/admin/slots/${id}`, { method: 'DELETE' }]);

// Orders
export const fetchAdminOrders = apiThunk('admin/orders', () => ['/admin/orders']);
export const updateOrderStatus = apiThunk('admin/orderStatus', ({ id, status }) => [
    `/admin/order/${id}`,
    { method: 'PUT', body: { status } },
]);
export const deleteOrder = apiThunk('admin/deleteOrder', (id) => [`/admin/order/${id}`, { method: 'DELETE' }]);

// Users
export const fetchAdminUsers = apiThunk('admin/users', () => ['/admin/users']);
export const updateUserRole = apiThunk('admin/userRole', ({ id, role }) => [`/admin/user/${id}`, { method: 'PUT', body: { role } }]);
export const deleteUser = apiThunk('admin/deleteUser', (id) => [`/admin/user/${id}`, { method: 'DELETE' }]);

// Replace the saved record in a list, or add it at the top when it is new
const upsert = (list, record) =>
    list.some((item) => item._id === record._id)
        ? list.map((item) => (item._id === record._id ? record : item))
        : [record, ...list];

const removeById = (list, id) => list.filter((item) => item._id !== id);

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        products: [],
        slots: [],
        orders: [],
        totalAmount: 0,
        users: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminProducts.fulfilled, (state, action) => {
                state.products = action.payload.products;
            })
            .addCase(saveProduct.fulfilled, (state, action) => {
                state.products = upsert(state.products, action.payload.product);
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = removeById(state.products, action.meta.arg);
            })
            .addCase(fetchAdminSlots.fulfilled, (state, action) => {
                state.slots = action.payload.slots;
            })
            .addCase(saveSlot.fulfilled, (state, action) => {
                state.slots = upsert(state.slots, action.payload.slot).sort((a, b) => a.startTime.localeCompare(b.startTime));
            })
            .addCase(deleteSlot.fulfilled, (state, action) => {
                state.slots = removeById(state.slots, action.meta.arg);
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.orders = action.payload.orders;
                state.totalAmount = action.payload.totalAmount;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.orders = upsert(state.orders, action.payload.order);
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.orders = removeById(state.orders, action.meta.arg);
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action) => {
                state.users = action.payload.users;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.users = upsert(state.users, action.payload.user);
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = removeById(state.users, action.meta.arg);
            });
    },
});

export default adminSlice.reducer;
