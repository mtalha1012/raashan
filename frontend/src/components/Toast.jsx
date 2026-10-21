import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '@/features/ui/uiSlice';

export default function Toast() {
    const dispatch = useDispatch();
    const toast = useSelector((state) => state.ui.toast);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => dispatch(hideToast(toast.id)), 3200);
        return () => clearTimeout(timer);
    }, [toast, dispatch]);

    if (!toast) return null;

    const tone = toast.tone === 'error' ? 'bg-margin text-white' : 'bg-text text-white';

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4" aria-live="polite">
            <div key={toast.id} className={`animate-write-in rounded-full px-5 py-2.5 text-sm font-medium shadow-lg ${tone}`}>
                {toast.message}
            </div>
        </div>
    );
}
