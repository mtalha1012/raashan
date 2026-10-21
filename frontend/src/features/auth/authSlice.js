import { createSlice } from '@reduxjs/toolkit';
import { apiThunk } from '@/lib/api';

export const loadUser = apiThunk('auth/load', () => ['/me']);
export const login = apiThunk('auth/login', (credentials) => ['/login', { method: 'POST', body: credentials }]);
export const register = apiThunk('auth/register', (details) => ['/register', { method: 'POST', body: details }]);
export const logout = apiThunk('auth/logout', () => ['/logout']);
export const updateProfile = apiThunk('auth/updateProfile', (details) => ['/me/update', { method: 'PUT', body: details }]);
export const updatePassword = apiThunk('auth/updatePassword', (passwords) => ['/password/update', { method: 'PUT', body: passwords }]);
export const forgotPassword = apiThunk('auth/forgot', (email) => ['/password/forgot', { method: 'POST', body: { email } }]);
export const resetPassword = apiThunk('auth/reset', ({ token, ...passwords }) => [
    `/password/reset/${token}`,
    { method: 'PUT', body: passwords },
]);

const setUser = (state, action) => {
    state.user = action.payload.user;
    state.checked = true;
};

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        // False until the first /me call answers, so protected pages don't bounce to login on refresh
        checked: false,
    },
    reducers: {
        // The household changed (created / joined / left), keep the user's copy in step
        setHouseholdId(state, action) {
            if (state.user) state.user.household = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadUser.fulfilled, setUser)
            .addCase(loadUser.rejected, (state) => {
                state.user = null;
                state.checked = true;
            })
            .addCase(login.fulfilled, setUser)
            .addCase(register.fulfilled, setUser)
            .addCase(resetPassword.fulfilled, setUser)
            .addCase(updateProfile.fulfilled, setUser)
            .addCase(updatePassword.fulfilled, setUser)
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            });
    },
});

export const { setHouseholdId } = authSlice.actions;
export default authSlice.reducer;
