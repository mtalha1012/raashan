import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EmptyState } from '@/components/Feedback';
import { loadUser } from '@/features/auth/authSlice';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';
import AccountPage from '@/features/auth/AccountPage';
import ShopPage from '@/features/shop/ShopPage';
import ProductPage from '@/features/shop/ProductPage';
import CartPage from '@/features/cart/CartPage';
import ListPage from '@/features/household/ListPage';
import CheckoutPage from '@/features/orders/CheckoutPage';
import OrdersPage from '@/features/orders/OrdersPage';
import OrderPage from '@/features/orders/OrderPage';
import AdminPage from '@/features/admin/AdminPage';

export default function App() {
    const dispatch = useDispatch();

    // Restore the session from the cookie on first load
    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/password/forgot" element={<ForgotPasswordPage />} />
                <Route path="/password/reset/:token" element={<ResetPasswordPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/list" element={<ListPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderPage />} />
                    <Route path="/account" element={<AccountPage />} />
                </Route>

                <Route element={<ProtectedRoute adminOnly />}>
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/:tab" element={<AdminPage />} />
                </Route>

                <Route path="*" element={<EmptyState title="Page not found">That link doesn't go anywhere.</EmptyState>} />
            </Route>
        </Routes>
    );
}
