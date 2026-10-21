import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorText, Field } from '@/components/Feedback';
import ProductImage from '@/components/ProductImage';
import { fetchCategories } from '@/features/shop/shopSlice';
import { showToast } from '@/features/ui/uiSlice';
import { rupees } from '@/lib/format';
import { deleteProduct, fetchAdminProducts, saveProduct } from './adminSlice';

function ProductForm({ product, categories, onDone }) {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        _id: product?._id,
        name: product?.name || '',
        category: product?.category?._id || categories[0]?._id || '',
        price: product?.price ?? '',
        unit: product?.unit || '',
        stock: product?.stock ?? 10,
        aliases: product?.aliases?.join(', ') || '',
        image: product?.image || '',
        description: product?.description || '',
    });
    const [error, setError] = useState('');

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await dispatch(saveProduct({ ...form, price: Number(form.price), stock: Number(form.stock) })).unwrap();
            dispatch(showToast(form._id ? 'Product saved' : 'Product added'));
            onDone();
        } catch (reason) {
            setError(reason);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card grid gap-3 p-5 sm:grid-cols-2">
            <h2 className="text-xl sm:col-span-2">{form._id ? `Edit ${product.name}` : 'New product'}</h2>
            <Field label="Name">
                <input className="input" name="name" value={form.name} onChange={handleChange} required />
            </Field>
            <Field label="Category">
                <select className="input" name="category" value={form.category} onChange={handleChange} required>
                    {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                            {category.icon} {category.name}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Price (Rs)">
                <input className="input" type="number" name="price" value={form.price} onChange={handleChange} min="0" required />
            </Field>
            <Field label="Unit" hint='e.g. "1 litre", "12 pcs", "10 kg" (the list reader uses this)'>
                <input className="input" name="unit" value={form.unit} onChange={handleChange} required />
            </Field>
            <Field label="Stock">
                <input className="input" type="number" name="stock" value={form.stock} onChange={handleChange} min="0" max="9999" required />
            </Field>
            <Field label="Image URL (optional)">
                <input className="input" type="url" name="image" value={form.image} onChange={handleChange} placeholder="https://…" />
            </Field>
            <div className="sm:col-span-2">
                <Field label="Other names people write" hint="Comma separated, e.g. doodh, dudh, milk">
                    <input className="input" name="aliases" value={form.aliases} onChange={handleChange} />
                </Field>
            </div>
            <div className="sm:col-span-2">
                <Field label="Description">
                    <textarea className="input" name="description" value={form.description} onChange={handleChange} rows={2} />
                </Field>
            </div>
            <div className="sm:col-span-2">
                <ErrorText>{error}</ErrorText>
            </div>
            <div className="flex gap-2 sm:col-span-2">
                <button className="btn btn-primary">Save product</button>
                <button type="button" className="btn btn-ghost" onClick={onDone}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function AdminProducts() {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.admin.products);
    const categories = useSelector((state) => state.shop.categories);
    const [editing, setEditing] = useState(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
        dispatch(fetchAdminProducts());
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleDelete = async (product) => {
        if (!window.confirm(`Delete ${product.name}? It is also removed from carts and unlinked from family lists.`)) return;
        try {
            await dispatch(deleteProduct(product._id)).unwrap();
            dispatch(showToast('Product deleted'));
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
        }
    };

    if (editing) {
        return (
            <ProductForm
                product={editing === 'new' ? null : editing}
                categories={categories}
                onDone={() => {
                    setEditing(null);
                    dispatch(fetchCategories());
                }}
            />
        );
    }

    const needle = query.trim().toLowerCase();
    const visible = products.filter(
        (product) => !needle || product.name.toLowerCase().includes(needle) || product.aliases.some((alias) => alias.includes(needle)),
    );

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                    className="input max-w-xs"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Filter ${products.length} products`}
                    aria-label="Filter products"
                />
                <button type="button" className="btn btn-primary" onClick={() => setEditing('new')} disabled={categories.length === 0}>
                    Add product
                </button>
            </div>

            <div className="card mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                    <thead className="eyebrow text-left">
                        <tr className="border-b border-line">
                            <th className="p-3">Product</th>
                            <th className="p-3">Category</th>
                            <th className="p-3 text-right">Price</th>
                            <th className="p-3 text-right">Stock</th>
                            <th className="p-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {visible.map((product) => (
                            <tr key={product._id}>
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <ProductImage product={product} size="sm" />
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            <p className="text-xs text-muted">
                                                {product.unit}
                                                {product.aliases.length > 0 && ` · ${product.aliases.slice(0, 3).join(', ')}`}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 text-muted">{product.category?.name}</td>
                                <td className="price p-3 text-right">{rupees(product.price)}</td>
                                <td className={`price p-3 text-right ${product.stock < 10 ? 'text-margin' : ''}`}>{product.stock}</td>
                                <td className="p-3 text-right">
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(product)}>
                                        Edit
                                    </button>
                                    <button type="button" className="btn btn-ghost btn-sm text-margin" onClick={() => handleDelete(product)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
