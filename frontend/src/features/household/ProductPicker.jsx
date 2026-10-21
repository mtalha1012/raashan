import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { rupees } from '@/lib/format';

export default function ProductPicker({ initialQuery = '', onPick, onCancel }) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);

    useEffect(() => {
        const keyword = query.trim();
        if (keyword.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            api(`/products?keyword=${encodeURIComponent(keyword)}`)
                .then((data) => setResults(data.products.slice(0, 6)))
                .catch(() => setResults([]));
        }, 250);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="rounded-xl border border-line bg-white p-2 shadow-lg">
            <input
                className="input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the shop…"
                autoFocus
                onKeyDown={(event) => event.key === 'Escape' && onCancel()}
                aria-label="Search product to link"
            />
            <ul className="mt-1 max-h-60 overflow-y-auto">
                {results.map((product) => (
                    <li key={product._id}>
                        <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-page"
                            onClick={() => onPick(product)}
                        >
                            <span>
                                {product.category?.icon} {product.name} <span className="text-muted">· {product.unit}</span>
                            </span>
                            <span className="price text-xs">{rupees(product.price)}</span>
                        </button>
                    </li>
                ))}
                {query.trim().length >= 2 && results.length === 0 && <li className="px-2 py-1.5 text-sm text-muted">No match in the shop</li>}
            </ul>
            <button type="button" className="btn btn-ghost btn-sm mt-1" onClick={onCancel}>
                Cancel
            </button>
        </div>
    );
}
