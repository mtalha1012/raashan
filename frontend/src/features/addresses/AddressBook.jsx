import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '@/features/ui/uiSlice';
import { createAddress, deleteAddress, fetchAddresses, updateAddress } from './addressesSlice';
import AddressForm from './AddressForm';

export default function AddressBook({ selectedId, onSelect }) {
    const dispatch = useDispatch();
    const { items, loaded } = useSelector((state) => state.addresses);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        dispatch(fetchAddresses());
    }, [dispatch]);

    useEffect(() => {
        if (onSelect && !selectedId && items.length) onSelect(items[0]._id);
    }, [items, selectedId, onSelect]);

    const handleSave = async (address) => {
        const action = address._id ? updateAddress(address) : createAddress(address);
        const { address: saved } = await dispatch(action).unwrap();
        await dispatch(fetchAddresses());
        dispatch(showToast('Address saved'));
        setEditing(null);
        onSelect?.(saved._id);
    };

    const handleDelete = async (address) => {
        if (!window.confirm(`Delete the ${address.label} address at ${address.line1}?`)) return;
        try {
            await dispatch(deleteAddress(address._id)).unwrap();
            await dispatch(fetchAddresses());
            if (selectedId === address._id) onSelect?.(null);
            dispatch(showToast('Address deleted'));
        } catch (message) {
            dispatch(showToast(message, 'error'));
        }
    };

    if (editing) {
        return (
            <AddressForm
                initial={editing === 'new' ? { isDefault: items.length === 0 } : editing}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
            />
        );
    }

    return (
        <div className="space-y-3">
            {loaded && items.length === 0 && <p className="text-muted">No saved addresses yet.</p>}

            {items.map((address) => {
                const isSelected = onSelect && selectedId === address._id;
                return (
                    <div
                        key={address._id}
                        className={`flex items-start gap-3 rounded-xl border p-3 ${isSelected ? 'border-ink bg-ink-soft/40' : 'border-line bg-white'}`}
                    >
                        {onSelect && (
                            <input
                                type="radio"
                                name="address"
                                className="mt-1.5 accent-ink"
                                checked={isSelected}
                                onChange={() => onSelect(address._id)}
                                aria-label={`Deliver to ${address.label}`}
                            />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold">
                                {address.label}
                                {address.isDefault && <span className="eyebrow ml-2 text-leaf">default</span>}
                            </p>
                            <p className="text-sm text-muted">
                                {address.line1}, {address.area}, {address.city} · {address.phone}
                            </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(address)}>
                                Edit
                            </button>
                            <button type="button" className="btn btn-ghost btn-sm text-margin" onClick={() => handleDelete(address)}>
                                Delete
                            </button>
                        </div>
                    </div>
                );
            })}

            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing('new')}>
                Add address
            </button>
        </div>
    );
}
