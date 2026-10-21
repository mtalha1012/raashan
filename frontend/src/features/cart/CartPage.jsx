import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { EmptyState, Loader } from '@/components/Feedback';
import { TrashIcon } from '@/components/Icons';
import ProductImage from '@/components/ProductImage';
import QuantityStepper from '@/components/QuantityStepper';
import { showToast } from '@/features/ui/uiSlice';
import { rupees } from '@/lib/format';
import { clearCart, removeCartItem, updateCartItem } from './cartSlice';

export default function CartPage() {
    const dispatch = useDispatch();
    const { cart, loaded } = useSelector((state) => state.cart);

    const run = async (action) => {
        try {
            await dispatch(action).unwrap();
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
        }
    };

    if (!loaded) return <Loader />;

    if (cart.items.length === 0) {
        return (
            <EmptyState
                title="Your cart is empty"
                action={
                    <div className="flex gap-2">
                        <Link to="/list" className="btn btn-primary">
                            Send the family list here
                        </Link>
                        <Link to="/" className="btn btn-outline">
                            Browse the shop
                        </Link>
                    </div>
                }
            >
                Fill it from the family list in one tap, or add things from the shop.
            </EmptyState>
        );
    }

    const toFreeDelivery = cart.freeDeliveryThreshold - cart.totalPrice;

    return (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section>
                <div className="flex items-end justify-between">
                    <h1 className="text-4xl">Cart</h1>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.confirm('Empty the whole cart?') && run(clearCart())}>
                        Empty cart
                    </button>
                </div>

                <ul className="card mt-5 divide-y divide-line">
                    {cart.items.map(({ product, quantity }) => (
                        <li key={product._id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
                            <ProductImage product={product} size="sm" />
                            <div className="min-w-0 flex-1">
                                <Link to={`/product/${product._id}`} className="font-semibold hover:text-ink">
                                    {product.name}
                                </Link>
                                <p className="text-sm text-muted">
                                    {product.unit} · <span className="price">{rupees(product.price)}</span>
                                </p>
                            </div>
                            <QuantityStepper
                                value={quantity}
                                max={Math.max(quantity, product.stock)}
                                onChange={(next) => run(updateCartItem({ productId: product._id, quantity: next }))}
                                label={`Quantity of ${product.name}`}
                            />
                            <span className="price w-24 text-right">{rupees(product.price * quantity)}</span>
                            <button
                                type="button"
                                className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-margin-soft hover:text-margin"
                                onClick={() => run(removeCartItem(product._id))}
                                aria-label={`Remove ${product.name}`}
                            >
                                <TrashIcon />
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            <aside className="card h-fit p-5 lg:sticky lg:top-24">
                <h2 className="text-xl">Summary</h2>
                <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-muted">Items ({cart.totalItems})</dt>
                        <dd className="price">{rupees(cart.totalPrice)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-muted">Delivery</dt>
                        <dd className="price">{cart.deliveryFee ? rupees(cart.deliveryFee) : 'Free'}</dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                        <dt>Total</dt>
                        <dd className="price">{rupees(cart.totalPrice + cart.deliveryFee)}</dd>
                    </div>
                </dl>
                {toFreeDelivery > 0 && (
                    <p className="mt-3 rounded-lg bg-haldi-soft px-3 py-2 text-sm">
                        Add <span className="price">{rupees(toFreeDelivery)}</span> more for free delivery.
                    </p>
                )}
                <Link to="/checkout" className="btn btn-primary mt-5 w-full">
                    Choose delivery slot
                </Link>
            </aside>
        </div>
    );
}
