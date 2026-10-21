import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { fetchCart } from '@/features/cart/cartSlice';
import { fetchHousehold, fetchList } from '@/features/household/householdSlice';
import Navbar from './Navbar';
import Toast from './Toast';

export default function Layout() {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.auth.user?._id);
    const householdId = useSelector((state) => state.auth.user?.household);

    useEffect(() => {
        if (!userId) return;
        dispatch(fetchCart());
        dispatch(fetchHousehold());
    }, [userId, dispatch]);

    useEffect(() => {
        if (householdId) dispatch(fetchList());
    }, [householdId, dispatch]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
                <Outlet />
            </main>
            <footer className="border-t border-line px-4 py-6 text-center text-xs text-muted">
                Raashan · groceries for the whole family, cash on delivery
            </footer>
            <Toast />
        </div>
    );
}
