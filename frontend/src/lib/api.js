import { createAsyncThunk } from '@reduxjs/toolkit';

// Thin fetch wrapper for the Express API. The JWT lives in an httpOnly cookie,
// so every request just sends cookies along; errors come back as the API's message.
export async function api(path, { method = 'GET', body } = {}) {
    let res;
    try {
        const options = { method, credentials: 'include' };
        if (body) {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(body);
        }
        res = await fetch(`/api/v1${path}`, options);
    } catch {
        throw new Error('Could not reach the server. Check your connection and try again.');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
        throw new Error(data.message || `Request failed (${res.status})`);
    }

    return data;
}

// createAsyncThunk that calls the API. makeRequest(arg) returns [path, options];
// failures reject with the API's message so components can .unwrap() and show it.
export const apiThunk = (type, makeRequest) =>
    createAsyncThunk(type, async (arg, { rejectWithValue }) => {
        try {
            const [path, options] = makeRequest(arg);
            return await api(path, options);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    });
