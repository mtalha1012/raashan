import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/features/orders/StatusTrack';
import { showToast } from '@/features/ui/uiSlice';
import { dateTime, dayLabel, rupees } from '@/lib/format';
import { deleteOrder, fetchAdminOrders, updateOrderStatus } from './adminSlice';

// Mirrors the API's allowed transitions, so only valid next steps are offered
const NEXT_STATUSES = {
    Placed: ['Packed', 'Cancelled'],
    Packed: ['Out for Delivery', 'Cancelled'],
    'Out for Delivery': ['Delivered', 'Cancelled'],
    Delivered: [],
    Cancelled: [],
};

const FILTERS = ['Active', 'All', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
    const dispatch = useDispatch();
    const { orders, totalAmount } = useSelector((state) => state.admin);
    const [filter, setFilter] = useState('Active');

    useEffect(() => {
        dispatch(fetchAdminOrders());
    }, [dispatch]);

    const run = async (action, message) => {
        try {
            await dispatch(action).unwrap();
            dispatch(showToast(message));
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
        }
    };

    const visible = orders.filter((order) => {
        if (filter === 'All') return true;
        if (filter === 'Active') return !['Delivered', 'Cancelled'].includes(order.orderStatus);
        return order.orderStatus === filter;
    });

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1">
                    {FILTERS.map((name) => (
                        <button key={name} type="button" className={`btn btn-sm ${filter === name ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(name)}>
                            {name}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-muted">
                    Revenue (excluding cancelled): <span className="price text-text">{rupees(totalAmount)}</span>
                </p>
            </div>

            <div className="mt-4 space-y-3">
                {visible.length === 0 && <p className="text-muted">No {filter.toLowerCase()} orders.</p>}
                {visible.map((order) => (
                    <div key={order._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                            <Link to={`/orders/${order._id}`} className="font-semibold hover:text-ink">
                                #{order._id.slice(-6).toUpperCase()} · {order.user?.name || 'Deleted user'}
                            </Link>
                            <p className="text-sm text-muted">
                                {dayLabel(order.deliverySlot.date)}, {order.deliverySlot.label} · {order.shippingInfo.area}, {order.shippingInfo.city}
                            </p>
                            <p className="text-xs text-muted">
                                {order.orderItems.length} items · placed {dateTime(order.createdAt)}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={order.orderStatus} />
                            <span className="price">{rupees(order.totalPrice)}</span>
                            {NEXT_STATUSES[order.orderStatus].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    className={`btn btn-sm ${status === 'Cancelled' ? 'btn-danger' : 'btn-outline'}`}
                                    onClick={() => run(updateOrderStatus({ id: order._id, status }), `Order marked ${status.toLowerCase()}`)}
                                >
                                    {status === 'Cancelled' ? 'Cancel' : `Mark ${status.toLowerCase()}`}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm text-margin"
                                onClick={() => window.confirm('Delete this order record?') && run(deleteOrder(order._id), 'Order deleted')}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
