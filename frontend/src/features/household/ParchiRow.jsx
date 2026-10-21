import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { CloseIcon } from '@/components/Icons';
import QuantityStepper from '@/components/QuantityStepper';
import { showToast } from '@/features/ui/uiSlice';
import { rupees } from '@/lib/format';
import { deleteListItem, updateListItem } from './householdSlice';
import ProductPicker from './ProductPicker';

// One line of the family parchi: what was written (handwriting) .... what it matched (type)
export default function ParchiRow({ item }) {
    const dispatch = useDispatch();
    const [picking, setPicking] = useState(false);

    const save = async (changes) => {
        try {
            await dispatch(updateListItem({ id: item._id, ...changes })).unwrap();
        } catch (message) {
            dispatch(showToast(message, 'error'));
        }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteListItem(item._id)).unwrap();
        } catch (message) {
            dispatch(showToast(message, 'error'));
        }
    };

    const { product } = item;

    return (
        <li className={`parchi-row animate-write-in relative flex flex-wrap items-center gap-x-3 gap-y-1 py-2 pr-1 ${item.done ? 'opacity-55' : ''}`}>
            <input
                type="checkbox"
                checked={item.done}
                onChange={(event) => save({ done: event.target.checked })}
                className="absolute -left-10 top-1/2 h-4 w-4 -translate-y-1/2 accent-ink"
                aria-label={`Bought ${item.text}`}
            />

            {/* Full width on phones so the handwriting never gets squeezed; controls wrap below */}
            <span className="flex w-full min-w-0 items-end gap-2 sm:w-auto sm:flex-1">
                <span className={`handwriting truncate text-xl leading-tight sm:text-2xl ${item.done ? 'line-through decoration-margin decoration-2' : ''}`}>
                    {item.text}
                </span>
                {item.requestedBy && <span className="handwriting shrink-0 text-sm text-muted">— {item.requestedBy}</span>}
                <span className="leader hidden sm:block" />
            </span>

            <span className="ml-auto flex items-center gap-2">
                {product ? (
                    <button type="button" className="text-right leading-tight hover:text-ink" onClick={() => setPicking(true)} title="Change product">
                        <span className="block text-sm font-semibold">{product.name}</span>
                        <span className="price block text-xs text-muted">
                            {item.quantity} × {product.unit} · {rupees(product.price * item.quantity)}
                        </span>
                    </button>
                ) : (
                    <button type="button" className="btn btn-sm border border-dashed border-haldi bg-haldi-soft text-text" onClick={() => setPicking(true)}>
                        Link a product
                    </button>
                )}

                {!item.done && (
                    <QuantityStepper value={item.quantity} onChange={(quantity) => save({ quantity })} label={`Quantity of ${item.text}`} />
                )}

                <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-margin-soft hover:text-margin" onClick={handleDelete} aria-label={`Remove ${item.text}`}>
                    <CloseIcon />
                </button>
            </span>

            {picking && (
                <div className="absolute right-0 top-full z-20 w-full max-w-sm">
                    <ProductPicker
                        initialQuery={product ? '' : item.text.replace(/\d+/g, '').trim()}
                        onPick={(picked) => {
                            setPicking(false);
                            save({ productId: picked._id });
                        }}
                        onCancel={() => setPicking(false)}
                    />
                </div>
            )}
        </li>
    );
}
