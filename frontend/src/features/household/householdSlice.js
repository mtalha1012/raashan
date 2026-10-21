import { createSlice } from '@reduxjs/toolkit';
import { apiThunk } from '@/lib/api';
import { logout } from '@/features/auth/authSlice';

// Household
export const fetchHousehold = apiThunk('household/fetch', () => ['/household']);
export const createHousehold = apiThunk('household/create', (details) => ['/household', { method: 'POST', body: details }]);
export const joinHousehold = apiThunk('household/join', (details) => ['/household/join', { method: 'POST', body: details }]);
export const renameHousehold = apiThunk('household/rename', (name) => ['/household', { method: 'PUT', body: { name } }]);
export const setNickname = apiThunk('household/nickname', (nickname) => ['/household/nickname', { method: 'PUT', body: { nickname } }]);
export const newInviteCode = apiThunk('household/inviteCode', () => ['/household/invite-code', { method: 'PUT' }]);
export const removeMember = apiThunk('household/removeMember', (userId) => [`/household/members/${userId}`, { method: 'DELETE' }]);
export const leaveHousehold = apiThunk('household/leave', () => ['/household/leave', { method: 'POST' }]);
export const deleteHousehold = apiThunk('household/delete', () => ['/household', { method: 'DELETE' }]);

// List
export const fetchList = apiThunk('household/list', () => ['/household/list']);
export const addListItem = apiThunk('household/addItem', (item) => ['/household/list', { method: 'POST', body: item }]);
export const parseMessage = apiThunk('household/parse', (message) => ['/household/list/parse', { method: 'POST', body: { message } }]);
export const addListItems = apiThunk('household/addItems', (items) => ['/household/list/bulk', { method: 'POST', body: { items } }]);
export const updateListItem = apiThunk('household/updateItem', ({ id, ...changes }) => [
    `/household/list/${id}`,
    { method: 'PUT', body: changes },
]);
export const deleteListItem = apiThunk('household/deleteItem', (id) => [`/household/list/${id}`, { method: 'DELETE' }]);
export const clearDoneItems = apiThunk('household/clearDone', () => ['/household/list/done', { method: 'DELETE' }]);
export const moveListToCart = apiThunk('household/toCart', () => ['/household/list/to-cart', { method: 'POST' }]);

const sortItems = (items) =>
    items.sort((a, b) => Number(a.done) - Number(b.done) || new Date(b.createdAt) - new Date(a.createdAt));

const householdSlice = createSlice({
    name: 'household',
    initialState: {
        household: null,
        loaded: false,
        items: [],
        listLoaded: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        const setHousehold = (state, action) => {
            state.household = action.payload.household;
            state.loaded = true;
        };
        const reset = (state) => {
            state.household = null;
            state.items = [];
            state.listLoaded = false;
            state.loaded = true;
        };

        builder
            .addCase(fetchHousehold.fulfilled, setHousehold)
            .addCase(createHousehold.fulfilled, setHousehold)
            .addCase(joinHousehold.fulfilled, setHousehold)
            .addCase(renameHousehold.fulfilled, setHousehold)
            .addCase(setNickname.fulfilled, setHousehold)
            .addCase(newInviteCode.fulfilled, setHousehold)
            .addCase(removeMember.fulfilled, setHousehold)
            .addCase(leaveHousehold.fulfilled, reset)
            .addCase(deleteHousehold.fulfilled, reset)
            .addCase(logout.fulfilled, (state) => {
                reset(state);
                state.loaded = false;
            })
            .addCase(fetchList.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.listLoaded = true;
            })
            .addCase(addListItem.fulfilled, (state, action) => {
                state.items = sortItems([action.payload.item, ...state.items]);
            })
            .addCase(updateListItem.fulfilled, (state, action) => {
                const { item } = action.payload;
                state.items = sortItems(state.items.map((existing) => (existing._id === item._id ? item : existing)));
            })
            .addCase(deleteListItem.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item._id !== action.meta.arg);
            })
            .addCase(clearDoneItems.fulfilled, (state) => {
                state.items = state.items.filter((item) => !item.done);
            });
    },
});

export default householdSlice.reducer;
