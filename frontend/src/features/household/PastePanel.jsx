import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ErrorText } from '@/components/Feedback';
import { ChatIcon, CloseIcon } from '@/components/Icons';
import QuantityStepper from '@/components/QuantityStepper';
import { showToast } from '@/features/ui/uiSlice';
import { addListItems, fetchList, parseMessage } from './householdSlice';
import ProductPicker from './ProductPicker';

const SAMPLE = `[21/10/26, 9:14 pm] Ammi: doodh 2, anday 12 aur double roti
[21/10/26, 9:16 pm] Abbu: cheeni 2 kg, chai patti bhi
[21/10/26, 9:20 pm] Sara: chips aur achaar`;

// Paste WhatsApp messages -> preview what each line became -> fix anything -> add to the list
export default function PastePanel() {
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(null);
    const [pickingIndex, setPickingIndex] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const handleRead = async (event) => {
        event.preventDefault();
        setError('');
        setBusy(true);
        try {
            const { items } = await dispatch(parseMessage(message)).unwrap();
            setPreview(items);
        } catch (reason) {
            setError(reason);
        } finally {
            setBusy(false);
        }
    };

    const updateLine = (index, changes) => setPreview(preview.map((line, i) => (i === index ? { ...line, ...changes } : line)));

    const handleAdd = async () => {
        setBusy(true);
        try {
            const items = preview.map((line) => ({
                text: line.text,
                productId: line.product?._id,
                quantity: line.quantity,
                requestedBy: line.from,
            }));
            const { added } = await dispatch(addListItems(items)).unwrap();
            await dispatch(fetchList());
            dispatch(showToast(`${added} item${added === 1 ? '' : 's'} written on the list`));
            setPreview(null);
            setMessage('');
        } catch (reason) {
            setError(reason);
        } finally {
            setBusy(false);
        }
    };

    if (preview) {
        const matched = preview.filter((line) => line.product).length;
        return (
            <section className="card p-5">
                <p className="eyebrow">Check before adding</p>
                <h2 className="mt-1 text-xl">
                    {matched} of {preview.length} matched
                </h2>
                <p className="mt-1 text-sm text-muted">Unmatched lines still go on the list, you can link them later.</p>

                <ul className="mt-4 divide-y divide-line">
                    {preview.map((line, index) => (
                        <li key={index} className="relative py-2.5">
                            <div className="flex items-center gap-2">
                                <span className="handwriting min-w-0 flex-1 truncate text-lg">
                                    {line.text}
                                    {line.from && <span className="ml-1 text-sm text-muted">— {line.from}</span>}
                                </span>
                                <QuantityStepper value={line.quantity} onChange={(quantity) => updateLine(index, { quantity })} />
                                <button
                                    type="button"
                                    className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-margin"
                                    onClick={() => setPreview(preview.filter((_, i) => i !== index))}
                                    aria-label={`Skip ${line.text}`}
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                            <button type="button" className="mt-0.5 text-left text-sm" onClick={() => setPickingIndex(index)}>
                                {line.product ? (
                                    <span>
                                        → <span className="font-semibold">{line.product.name}</span>{' '}
                                        <span className="text-muted">({line.product.unit})</span>
                                    </span>
                                ) : (
                                    <span className="text-haldi-ink underline decoration-dotted underline-offset-2">No match, pick a product</span>
                                )}
                            </button>
                            {pickingIndex === index && (
                                <div className="absolute inset-x-0 top-full z-20">
                                    <ProductPicker
                                        onPick={(product) => {
                                            updateLine(index, { product });
                                            setPickingIndex(null);
                                        }}
                                        onCancel={() => setPickingIndex(null)}
                                    />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                <ErrorText>{error}</ErrorText>
                <div className="mt-4 flex gap-2">
                    <button type="button" className="btn btn-primary flex-1" onClick={handleAdd} disabled={busy || preview.length === 0}>
                        Add {preview.length} to the list
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setPreview(null)}>
                        Back
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="card p-5">
            <div className="flex items-center gap-2">
                <ChatIcon className="text-xl text-leaf" />
                <h2 className="text-xl">Paste from WhatsApp</h2>
            </div>
            <p className="mt-1 text-sm text-muted">
                Copy the grocery messages from your family group, or export the chat and paste it here.
            </p>
            <form onSubmit={handleRead} className="mt-4 space-y-3">
                <textarea
                    className="input min-h-36 font-mono text-sm"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={'Ammi: doodh 2, anday 12 aur double roti'}
                    aria-label="WhatsApp messages"
                    maxLength={5000}
                />
                <ErrorText>{error}</ErrorText>
                <div className="flex flex-wrap items-center gap-2">
                    <button className="btn btn-primary" disabled={busy || !message.trim()}>
                        {busy ? 'Reading…' : 'Read messages'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMessage(SAMPLE)}>
                        Use a sample chat
                    </button>
                </div>
            </form>
        </section>
    );
}
