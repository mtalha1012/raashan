import { ORDER_STATUSES } from '@/lib/format';

const BADGE_TONES = {
    Placed: 'bg-ink-soft text-ink',
    Packed: 'bg-haldi-soft text-text',
    'Out for Delivery': 'bg-haldi text-text',
    Delivered: 'bg-leaf-soft text-leaf',
    Cancelled: 'bg-margin-soft text-margin',
};

export function StatusBadge({ status }) {
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONES[status]}`}>{status}</span>;
}

export function StatusTrack({ status }) {
    if (status === 'Cancelled') return <StatusBadge status={status} />;

    const reached = ORDER_STATUSES.indexOf(status);

    return (
        <ol className="flex items-center gap-1 sm:gap-2" aria-label={`Order status: ${status}`}>
            {ORDER_STATUSES.map((step, index) => (
                <li key={step} className="flex flex-1 items-center gap-1 sm:gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${index <= reached ? 'bg-ink' : 'bg-line'}`} />
                    <span className={`text-xs ${index === reached ? 'inline' : 'hidden sm:inline'} ${index <= reached ? 'font-semibold text-text' : 'text-muted'}`}>
                        {step}
                    </span>
                    {index < ORDER_STATUSES.length - 1 && <span className={`h-0.5 flex-1 ${index < reached ? 'bg-ink' : 'bg-line'}`} />}
                </li>
            ))}
        </ol>
    );
}
