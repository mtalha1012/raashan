import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { ErrorText, Loader } from '@/components/Feedback';
import AddressBook from '@/features/addresses/AddressBook';
import { fetchCart } from '@/features/cart/cartSlice';
import { showToast } from '@/features/ui/uiSlice';
import { dayLabel, rupees } from '@/lib/format';
import { fetchSlots, placeOrder } from './ordersSlice';

export default function CheckoutPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cart, loaded } = useSelector((state) => state.cart);
    const { date, dates, slots } = useSelector((state) => state.orders.slots);
    const [addressId, setAddressId] = useState(null);
    const [deliveryDate, setDeliveryDate] = useState(null);
    const [slotId, setSlotId] = useState(null);
    const [error, setError] = useState('');
    const [placing, setPlacing] = useState(false);

    // Availability changes with the day picked
    useEffect(() => {
        setSlotId(null);
        dispatch(fetchSlots(deliveryDate));
    }, [deliveryDate, dispatch]);

    // Late in the day nothing is left today, so start on tomorrow instead of a wall of closed slots
    useEffect(() => {
        const nothingOpenToday = !deliveryDate && dates.length > 1 && slots.length > 0 && !slots.some((slot) => slot.available);
        if (nothingOpenToday) setDeliveryDate(dates[1]);
    }, [deliveryDate, dates, slots]);

    if (!loaded) return <Loader />;
    if (cart.items.length === 0 && !placing) return <Navigate to="/cart" replace />;

    const handlePlaceOrder = async () => {
        setError('');
        setPlacing(true);
        try {
            const { order } = await dispatch(placeOrder({ addressId, slotId, deliveryDate: date })).unwrap();
            await dispatch(fetchCart());
            dispatch(showToast('Order placed'));
            navigate(`/orders/${order._id}`, { replace: true });
        } catch (reason) {
            setError(reason);
            setPlacing(false);
            // A slot may have filled up meanwhile
            dispatch(fetchSlots(date));
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
                <h1 className="text-4xl">Checkout</h1>

                <section className="card p-5">
                    <h2 className="text-xl">Deliver to</h2>
                    <div className="mt-4">
                        <AddressBook selectedId={addressId} onSelect={setAddressId} />
                    </div>
                </section>

                <section className="card p-5">
                    <h2 className="text-xl">When</h2>
                    <div className="-mx-1 no-scrollbar mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
                        {dates.map((day, index) => (
                            <button
                                key={day}
                                type="button"
                                className={`btn btn-sm shrink-0 ${day === date ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setDeliveryDate(day)}
                            >
                                {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : dayLabel(day)}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {slots.map((slot) => (
                            <label
                                key={slot._id}
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 ${
                                    !slot.available ? 'cursor-not-allowed opacity-50' : slotId === slot._id ? 'border-ink bg-ink-soft/40' : 'border-line bg-white'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="slot"
                                        className="accent-ink"
                                        disabled={!slot.available}
                                        checked={slotId === slot._id}
                                        onChange={() => setSlotId(slot._id)}
                                    />
                                    <span className="text-sm font-semibold">{slot.label}</span>
                                </span>
                                <span className="eyebrow">{slot.available ? `${slot.remaining} left` : slot.reason}</span>
                            </label>
                        ))}
                        {slots.length === 0 && <p className="text-sm text-muted">No delivery slots are open right now.</p>}
                    </div>
                </section>
            </div>

            <aside className="card h-fit p-5 lg:sticky lg:top-24">
                <h2 className="text-xl">Your order</h2>
                <ul className="mt-3 space-y-1 text-sm">
                    {cart.items.map(({ product, quantity }) => (
                        <li key={product._id} className="flex justify-between gap-3">
                            <span className="truncate">
                                {quantity} × {product.name}
                            </span>
                            <span className="price shrink-0">{rupees(product.price * quantity)}</span>
                        </li>
                    ))}
                </ul>
                <dl className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-muted">Delivery</dt>
                        <dd className="price">{cart.deliveryFee ? rupees(cart.deliveryFee) : 'Free'}</dd>
                    </div>
                    <div className="flex justify-between text-base font-semibold">
                        <dt>Total</dt>
                        <dd className="price">{rupees(cart.totalPrice + cart.deliveryFee)}</dd>
                    </div>
                </dl>
                <p className="mt-3 text-sm text-muted">Pay cash when it arrives.</p>
                <div className="mt-4 space-y-3">
                    <ErrorText>{error}</ErrorText>
                    <button type="button" className="btn btn-primary w-full" disabled={!addressId || !slotId || placing} onClick={handlePlaceOrder}>
                        {placing ? 'Placing order…' : 'Place order'}
                    </button>
                    {(!addressId || !slotId) && (
                        <p className="text-center text-xs text-muted">{!addressId ? 'Add or choose an address' : 'Choose a delivery slot'}</p>
                    )}
                </div>
            </aside>
        </div>
    );
}
