import { useState } from 'react';
import { ErrorText, Field } from '@/components/Feedback';

const EMPTY_ADDRESS = { label: 'Home', line1: '', area: '', city: 'Islamabad', phone: '', isDefault: false };

export default function AddressForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({ ...EMPTY_ADDRESS, ...initial });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSaving(true);
        try {
            await onSave(form);
        } catch (message) {
            setError(message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <Field label="Label">
                <select className="input" name="label" value={form.label} onChange={handleChange}>
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                </select>
            </Field>
            <Field label="Phone">
                <input className="input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="0300 1234567" required />
            </Field>
            <div className="sm:col-span-2">
                <Field label="House / street">
                    <input className="input" name="line1" value={form.line1} onChange={handleChange} placeholder="House 12, Street 4" required />
                </Field>
            </div>
            <Field label="Area">
                <input className="input" name="area" value={form.area} onChange={handleChange} placeholder="G-11/2" required />
            </Field>
            <Field label="City">
                <input className="input" name="city" value={form.city} onChange={handleChange} required />
            </Field>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} className="accent-ink" />
                Use as my default address
            </label>
            <div className="sm:col-span-2">
                <ErrorText>{error}</ErrorText>
            </div>
            <div className="flex gap-2 sm:col-span-2">
                <button className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save address'}
                </button>
                {onCancel && (
                    <button type="button" className="btn btn-ghost" onClick={onCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
