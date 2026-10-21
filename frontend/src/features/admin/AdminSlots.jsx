import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorText } from '@/components/Feedback';
import { showToast } from '@/features/ui/uiSlice';
import { deleteSlot, fetchAdminSlots, saveSlot } from './adminSlice';

const EMPTY = { label: '', startTime: '09:00', endTime: '12:00', capacity: 20, isActive: true };

export default function AdminSlots() {
    const dispatch = useDispatch();
    const slots = useSelector((state) => state.admin.slots);
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');

    useEffect(() => {
        dispatch(fetchAdminSlots());
    }, [dispatch]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const run = async (action, message) => {
        try {
            await dispatch(action).unwrap();
            dispatch(showToast(message));
            return true;
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
            return false;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await dispatch(saveSlot({ ...form, capacity: Number(form.capacity) })).unwrap();
            dispatch(showToast(form._id ? 'Slot saved' : 'Slot added'));
            setForm(EMPTY);
        } catch (reason) {
            setError(reason);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <ul className="card divide-y divide-line">
                {slots.length === 0 && <li className="p-4 text-muted">No delivery slots yet. Customers can't check out until you add one.</li>}
                {slots.map((slot) => (
                    <li key={slot._id} className={`flex flex-wrap items-center gap-3 p-3 ${slot.isActive ? '' : 'opacity-60'}`}>
                        <span className="price rounded-lg bg-page px-2 py-1 text-sm">
                            {slot.startTime}–{slot.endTime}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold">{slot.label}</p>
                            <p className="text-xs text-muted">
                                {slot.capacity} orders a day · {slot.isActive ? 'open' : 'paused'}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => run(saveSlot({ _id: slot._id, isActive: !slot.isActive }), slot.isActive ? 'Slot paused' : 'Slot reopened')}
                        >
                            {slot.isActive ? 'Pause' : 'Reopen'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(slot)}>
                            Edit
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm text-margin"
                            onClick={() => window.confirm(`Delete ${slot.label}?`) && run(deleteSlot(slot._id), 'Slot deleted')}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit} className="card h-fit space-y-3 p-5">
                <h2 className="text-xl">{form._id ? 'Edit slot' : 'New slot'}</h2>
                <input className="input" name="label" value={form.label} onChange={handleChange} placeholder="Morning (9 am - 12 pm)" required />
                <div className="grid grid-cols-2 gap-2">
                    <label className="text-sm text-muted">
                        Starts
                        <input className="input mt-1" type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                    </label>
                    <label className="text-sm text-muted">
                        Ends
                        <input className="input mt-1" type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                    </label>
                </div>
                <label className="block text-sm text-muted">
                    Orders per day
                    <input className="input mt-1" type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1" max="500" required />
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-ink" />
                    Open for booking
                </label>
                <ErrorText>{error}</ErrorText>
                <div className="flex gap-2">
                    <button className="btn btn-primary">{form._id ? 'Save slot' : 'Add slot'}</button>
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
