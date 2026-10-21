import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/Feedback';
import { dateTime, dayLabel, rupees } from '@/lib/format';
import { fetchHouseholdOrders, fetchMyOrders } from './ordersSlice';
import { StatusBadge } from './StatusTrack';

export default function OrdersPage() {
    const dispatch = useDispatch();
    const { mine, household } = useSelector((state) => state.orders);
    const hasHousehold = useSelector((state) => Boolean(state.auth.user?.household));
    const [view, setView] = useState('mine');

    useEffect(() => {
        dispatch(fetchMyOrders());
        if (hasHousehold) dispatch(fetchHouseholdOrders());
    }, [hasHousehold, dispatch]);

    const orders = view === 'mine' ? mine : household;

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="text-4xl">Orders</h1>
                {hasHousehold && (
                    <div className="inline-flex rounded-full border border-line bg-white p-1">
                        <button type="button" className={`btn btn-sm ${view === 'mine' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('mine')}>
                            Mine
                        </button>
                        <button type="button" className={`btn btn-sm ${view === 'family' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('family')}>
                            Whole family
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-5 space-y-3">
                {orders.length === 0 && (
                    <EmptyState title="No orders yet" action={<Link to="/list" className="btn btn-primary">Open the family list</Link>}>
                        Orders you place show up here with their delivery slot.
                    </EmptyState>
                )}

                {orders.map((order) => (
                    <Link
                        key={order._id}
                        to={`/orders/${order._id}`}
                        className="card flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md"
                    >
                        <div>
                            <p className="font-semibold">
                                {dayLabel(order.deliverySlot.date)} · {order.deliverySlot.label}
                            </p>
                            <p className="text-sm text-muted">
                                {order.orderItems.length} items · placed {dateTime(order.createdAt)}
                                {view === 'family' && order.user?.name && ` by ${order.user.name}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusBadge status={order.orderStatus} />
                            <span className="price">{rupees(order.totalPrice)}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
