import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorText } from '@/components/Feedback';
import { fetchCategories } from '@/features/shop/shopSlice';
import { showToast } from '@/features/ui/uiSlice';
import { deleteCategory, saveCategory } from './adminSlice';

const EMPTY = { name: '', icon: '🛒', description: '', sortOrder: 0 };

export default function AdminCategories() {
    const dispatch = useDispatch();
    const categories = useSelector((state) => state.shop.categories);
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await dispatch(saveCategory({ ...form, sortOrder: Number(form.sortOrder) })).unwrap();
            await dispatch(fetchCategories());
            dispatch(showToast(form._id ? 'Category saved' : 'Category added'));
            setForm(EMPTY);
        } catch (reason) {
            setError(reason);
        }
    };

    const handleDelete = async (category) => {
        if (!window.confirm(`Delete ${category.name}?`)) return;
        try {
            await dispatch(deleteCategory(category._id)).unwrap();
            await dispatch(fetchCategories());
            dispatch(showToast('Category deleted'));
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <ul className="card divide-y divide-line">
                {categories.map((category) => (
                    <li key={category._id} className="flex items-center gap-3 p-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-page text-xl" aria-hidden="true">
                            {category.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold">{category.name}</p>
                            <p className="truncate text-xs text-muted">
                                {category.productCount} products · {category.description || 'No description'}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setForm({ _id: category._id, name: category.name, icon: category.icon, description: category.description, sortOrder: category.sortOrder })}
                        >
                            Edit
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm text-margin" onClick={() => handleDelete(category)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit} className="card h-fit space-y-3 p-5">
                <h2 className="text-xl">{form._id ? 'Edit category' : 'New category'}</h2>
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                    <input className="input text-center text-xl" name="icon" value={form.icon} onChange={handleChange} aria-label="Icon (emoji)" maxLength={4} />
                    <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Name" required maxLength={40} />
                </div>
                <input className="input" name="description" value={form.description} onChange={handleChange} placeholder="Short description" />
                <label className="flex items-center gap-2 text-sm text-muted">
                    Position
                    <input className="input w-24" type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange} />
                </label>
                <ErrorText>{error}</ErrorText>
                <div className="flex gap-2">
                    <button className="btn btn-primary">{form._id ? 'Save category' : 'Add category'}</button>
                    {form._id && (
                        <button type="button" className="btn btn-ghost" onClick={() => setForm(EMPTY)}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
