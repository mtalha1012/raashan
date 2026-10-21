import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@/components/Feedback';
import { fetchCart } from '@/features/cart/cartSlice';
import { showToast } from '@/features/ui/uiSlice';
import { rupees } from '@/lib/format';
import { addListItem, clearDoneItems, fetchList, moveListToCart } from './householdSlice';
import HouseholdPanel from './HouseholdPanel';
import HouseholdSetup from './HouseholdSetup';
import ParchiRow from './ParchiRow';
import PastePanel from './PastePanel';

export default function ListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { household, loaded, items, listLoaded } = useSelector((state) => state.household);
    const [text, setText] = useState('');
    const [moveResult, setMoveResult] = useState(null);

    if (!loaded) return <Loader />;
    if (!household) return <HouseholdSetup />;

    const openItems = items.filter((item) => !item.done);
    const doneCount = items.length - openItems.length;
    const linkedOpen = openItems.filter((item) => item.product);
    const estimate = linkedOpen.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const handleAdd = async (event) => {
        event.preventDefault();
        if (!text.trim()) return;
        try {
            await dispatch(addListItem({ text })).unwrap();
            setText('');
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
        }
    };

    const handleMoveToCart = async () => {
        try {
            const result = await dispatch(moveListToCart()).unwrap();
            await Promise.all([dispatch(fetchList()), dispatch(fetchCart())]);
            if (result.moved.length && !result.skipped.length) {
                dispatch(showToast(`${result.moved.length} items moved to your cart`));
                navigate('/cart');
            } else {
                setMoveResult(result);
            }
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="eyebrow">{household.name}</p>
                        <h1 className="mt-1 text-4xl sm:text-5xl">The family list</h1>
                    </div>
                    {doneCount > 0 && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => dispatch(clearDoneItems())}>
                            Clear {doneCount} ticked
                        </button>
                    )}
                </div>

                <div className="parchi mt-5 pb-4 pl-14 pr-3 pt-2 sm:pr-5">
                    <form onSubmit={handleAdd} className="parchi-row flex items-center gap-2">
                        <input
                            className="handwriting w-full bg-transparent text-xl placeholder:text-ink/35 focus:outline-none sm:text-2xl"
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="Write an item… dahi 1 kg"
                            maxLength={80}
                            aria-label="Add an item to the list"
                        />
                        <button className="btn btn-primary btn-sm" disabled={!text.trim()}>
                            Add
                        </button>
                    </form>

                    {!listLoaded && <Loader />}
                    {listLoaded && items.length === 0 && (
                        <p className="parchi-row flex items-center text-muted">
                            Nothing on the list. Write an item above or paste the family group.
                        </p>
                    )}

                    <ul>
                        {items.map((item) => (
                            <ParchiRow key={item._id} item={item} />
                        ))}
                    </ul>
                </div>

                {openItems.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-line">
                        <div>
                            <p className="text-sm text-muted">
                                {linkedOpen.length} of {openItems.length} open items are linked to the shop
                            </p>
                            <p className="price text-xl">≈ {rupees(estimate)}</p>
                        </div>
                        <button type="button" className="btn btn-primary" onClick={handleMoveToCart} disabled={linkedOpen.length === 0}>
                            Send to my cart
                        </button>
                    </div>
                )}

                {moveResult && (
                    <div className="mt-4 rounded-2xl bg-haldi-soft p-4 text-sm">
                        <p className="font-semibold">
                            {moveResult.moved.length} moved to your cart, {moveResult.skipped.length} left on the list
                        </p>
                        <ul className="mt-2 list-inside list-disc text-muted">
                            {moveResult.skipped.map((skip, index) => (
                                <li key={index}>
                                    <span className="handwriting text-base text-ink">{skip.text}</span>: {skip.reason}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 flex gap-2">
                            {moveResult.moved.length > 0 && (
                                <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/cart')}>
                                    Go to cart
                                </button>
                            )}
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMoveResult(null)}>
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <aside className="space-y-6">
                <PastePanel />
                <HouseholdPanel household={household} />
            </aside>
        </div>
    );
}
