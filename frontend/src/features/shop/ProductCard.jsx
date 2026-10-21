import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import ProductImage from '@/components/ProductImage';
import { addToCart } from '@/features/cart/cartSlice';
import { addListItem } from '@/features/household/householdSlice';
import { showToast } from '@/features/ui/uiSlice';
import { rupees } from '@/lib/format';

export default function ProductCard({ product }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [busy, setBusy] = useState(false);
    const outOfStock = product.stock === 0;

    // Logged out visitors are sent to log in first
    const run = async (action, successMessage) => {
        if (!user) return navigate('/login', { state: { from: `/product/${product._id}` } });
        setBusy(true);
        try {
            await dispatch(action).unwrap();
            dispatch(showToast(successMessage));
        } catch (message) {
            dispatch(showToast(message, 'error'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <article className="group card flex flex-col overflow-hidden p-3 transition-shadow hover:shadow-md">
            <Link to={`/product/${product._id}`} className="block aspect-[4/3]" tabIndex={-1} aria-hidden="true">
                <ProductImage product={product} />
            </Link>

            <div className="mt-3 flex flex-1 flex-col">
                <Link to={`/product/${product._id}`} className="font-semibold leading-snug hover:text-ink">
                    {product.name}
                </Link>
                <p className="text-sm text-muted">{product.unit}</p>
                {product.aliases?.[0] && <p className="handwriting text-sm">"{product.aliases[0]}"</p>}

                <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <span className="price text-lg">{rupees(product.price)}</span>
                    {outOfStock && <span className="eyebrow text-margin">Out of stock</span>}
                </div>

                <div className="mt-3 flex gap-2">
                    <button
                        type="button"
                        className="btn btn-primary btn-sm flex-1"
                        disabled={busy || outOfStock}
                        onClick={() => run(addToCart({ productId: product._id }), `${product.name} added to cart`)}
                    >
                        Add to cart
                    </button>
                    {user?.household && (
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            disabled={busy}
                            onClick={() => run(addListItem({ productId: product._id }), `${product.name} written on the family list`)}
                            title="Add to family list"
                        >
                            + List
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
