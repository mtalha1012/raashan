import { createSlice } from '@reduxjs/toolkit';
import { apiThunk } from '@/lib/api';

// filters: { keyword, category, page }
export const fetchProducts = apiThunk('shop/products', ({ keyword, category, page } = {}) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (category) params.set('category', category);
    if (page > 1) params.set('page', page);
    return [`/products?${params}`];
});

export const fetchProduct = apiThunk('shop/product', (id) => [`/products/${id}`]);
export const fetchCategories = apiThunk('shop/categories', () => ['/categories']);

const shopSlice = createSlice({
    name: 'shop',
    initialState: {
        products: [],
        filteredCount: 0,
        perPage: 12,
        status: 'idle',
        error: null,
        categories: [],
        product: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'ready';
                state.products = action.payload.products;
                state.filteredCount = action.payload.filteredProductCount;
                state.perPage = action.payload.resultPerPage;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchProduct.pending, (state) => {
                state.product = null;
            })
            .addCase(fetchProduct.fulfilled, (state, action) => {
                state.product = action.payload.product;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload.categories;
            });
    },
});

export default shopSlice.reducer;
