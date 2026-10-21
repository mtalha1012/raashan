import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, Loader } from '@/components/Feedback';
import { showToast } from '@/features/ui/uiSlice';
import { dateTime, dayLabel, rupees } from '@/lib/format';
import { cancelOrder, fetchOrder } from './ordersSlice';
import { StatusTrack } from './StatusTrack';

export default function OrderPage() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const order = useSelector((state) => state.orders.order);
    const userId = useSelector((state) => state.auth.user._id);
    const [error, setError] = useState('');

    useEffect(() => {
        dispatch(fetchOrder(id))
            .unwrap()
            .catch((reason) => setError(reason));
    }, [id, dispatch]);

    if (error) return <EmptyState title="Order not available">{error}</EmptyState>;
    if (!order || order._id !== id) return <Loader />;

    const canCancel = order.orderStatus === 'Placed' && order.user._id === userId;

    const handleCancel = async () => {
        if (!window.confirm('Cancel this order?')) return;
        try {
            await dispatch(cancelOrder(order._id)).unwrap();
            dispatch(showToast('Order cancelled'));
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-5">
            <Link to="/orders" className="text-sm text-muted hover:text-text">
                ← All orders
            </Link>

            <div>
                <p className="eyebrow">Order #{order._id.slice(-6).toUpperCase()}</p>
                <h1 className="mt-1 text-4xl">
                    {dayLabel(order.deliverySlot.date)}, {order.deliverySlot.label}
                </h1>
                <p className="mt-1 text-sm text-muted">
                    Placed {dateTime(order.createdAt)} by {order.user.name}
                </p>
            </div>

            <div className="card p-4">
                <StatusTrack status={order.orderStatus} />
            </div>

            <div className="grid gap-5 sm:grid-cols-[1.5fr_1fr]">
                <section className="parchi py-2 pl-14 pr-5">
                    <ul>
                        {order.orderItems.map((item) => (
                            <li key={item._id} className="parchi-row flex items-end gap-2 pb-2">
                                <span className="text-sm font-semibold">
                                    {item.quantity} × {item.name}
                                    <span className="font-normal text-muted"> ({item.unit})</span>
                                </span>
                                <span className="leader" />
                                <span className="price text-sm">{rupees(item.price * item.quantity)}</span>
                            </li>
                        ))}
                        <li className="parchi-row flex items-end gap-2 pb-2 text-sm text-muted">
                            Delivery <span className="leader" />
                            <span className="price">{order.deliveryFee ? rupees(order.deliveryFee) : 'Free'}</span>
                        </li>
                        <li className="parchi-row flex items-end gap-2 pb-2 font-semibold">
                            Total, cash on delivery <span className="leader" />
                            <span className="price text-lg">{rupees(order.totalPrice)}</span>
                        </li>
                    </ul>
                </section>

                <aside className="card h-fit space-y-3 p-4 text-sm">
                    <div>
                        <p className="eyebrow">Deliver to</p>
                        <p className="mt-1">
                            {order.shippingInfo.line1}, {order.shippingInfo.area}, {order.shippingInfo.city}
                        </p>
                        <p className="text-muted">{order.shippingInfo.phone}</p>
                    </div>
                    <div>
                        <p className="eyebrow">Payment</p>
                        <p className="mt-1">{order.paidAt ? `Paid ${dateTime(order.paidAt)}` : 'Cash on delivery'}</p>
                    </div>
                    {canCancel && (
                        <button type="button" className="btn btn-danger btn-sm w-full" onClick={handleCancel}>
                            Cancel order
                        </button>
                    )}
                </aside>
            </div>
        </div>
    );
}
