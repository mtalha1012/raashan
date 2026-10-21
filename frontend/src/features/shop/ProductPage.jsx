import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/Feedback';
import ProductImage from '@/components/ProductImage';
import QuantityStepper from '@/components/QuantityStepper';
import { addToCart } from '@/features/cart/cartSlice';
import { addListItem } from '@/features/household/householdSlice';
import { showToast } from '@/features/ui/uiSlice';
import { rupees } from '@/lib/format';
import { fetchProduct } from './shopSlice';

export default function ProductPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const product = useSelector((state) => state.shop.product);
    const user = useSelector((state) => state.auth.user);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');
        dispatch(fetchProduct(id))
            .unwrap()
            .catch((message) => setError(message));
    }, [id, dispatch]);

    if (error) {
        return (
            <div className="card p-10 text-center">
                <h1 className="text-3xl">Product not found</h1>
                <Link to="/" className="btn btn-outline mt-4">
                    Back to the shop
                </Link>
            </div>
        );
    }

    if (!product || product._id !== id) return <Loader />;

    const run = async (action, successMessage) => {
        if (!user) return navigate('/login', { state: { from: `/product/${id}` } });
        try {
            await dispatch(action).unwrap();
            dispatch(showToast(successMessage));
        } catch (message) {
            dispatch(showToast(message, 'error'));
        }
    };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-square">
                <ProductImage product={product} size="lg" />
            </div>

            <div>
                <Link to={`/?category=${product.category?._id}`} className="eyebrow hover:text-ink">
                    {product.category?.icon} {product.category?.name}
                </Link>
                <h1 className="mt-2 text-4xl sm:text-5xl">{product.name}</h1>
                <p className="mt-2 text-muted">{product.unit}</p>

                <p className="price mt-6 text-3xl">{rupees(product.price)}</p>
                <p className={`mt-1 text-sm ${product.stock > 0 ? 'text-leaf' : 'text-margin'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>

                {product.description && <p className="mt-6 max-w-prose">{product.description}</p>}

                {product.aliases?.length > 0 && (
                    <div className="mt-6">
                        <p className="eyebrow">Also written as</p>
                        <p className="handwriting mt-1 text-xl">{product.aliases.join(', ')}</p>
                    </div>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, Math.min(99, product.stock))} />
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={product.stock === 0}
                        onClick={() => run(addToCart({ productId: product._id, quantity }), `${quantity} × ${product.name} added to cart`)}
                    >
                        Add to cart
                    </button>
                    {user?.household && (
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => run(addListItem({ productId: product._id, quantity }), `${product.name} written on the family list`)}
                        >
                            Add to family list
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
