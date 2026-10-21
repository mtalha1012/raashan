import { createSlice } from '@reduxjs/toolkit';

let nextToastId = 1;

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        toast: null,
    },
    reducers: {
        // tone: 'success' | 'error'
        showToast: {
            reducer(state, action) {
                state.toast = action.payload;
            },
            prepare(message, tone = 'success') {
                return { payload: { id: nextToastId++, message, tone } };
            },
        },
        hideToast(state, action) {
            if (state.toast?.id === action.payload) state.toast = null;
        },
    },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
