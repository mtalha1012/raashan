import { MinusIcon, PlusIcon } from './Icons';

export default function QuantityStepper({ value, onChange, min = 1, max = 99, disabled = false, label = 'Quantity' }) {
    return (
        <div className="inline-flex items-center rounded-full border border-line bg-white" role="group" aria-label={label}>
            <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full text-ink hover:bg-ink-soft disabled:opacity-40"
                onClick={() => onChange(value - 1)}
                disabled={disabled || value <= min}
                aria-label="Decrease"
            >
                <MinusIcon />
            </button>
            <span className="price w-7 text-center text-sm">{value}</span>
            <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full text-ink hover:bg-ink-soft disabled:opacity-40"
                onClick={() => onChange(value + 1)}
                disabled={disabled || value >= max}
                aria-label="Increase"
            >
                <PlusIcon />
            </button>
        </div>
    );
}
