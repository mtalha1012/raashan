export function Loader({ label = 'Loading' }) {
    return (
        <div className="flex items-center justify-center gap-3 py-16 text-muted" role="status">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
            <span>{label}…</span>
        </div>
    );
}

export function EmptyState({ title, children, action }) {
    return (
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
            <h2 className="text-2xl">{title}</h2>
            {children && <p className="max-w-md text-muted">{children}</p>}
            {action}
        </div>
    );
}

export function ErrorText({ children }) {
    if (!children) return null;
    return (
        <p className="rounded-lg bg-margin-soft px-3 py-2 text-sm text-margin" role="alert">
            {children}
        </p>
    );
}

export function Field({ label, children, hint }) {
    return (
        <label className="block">
            <span className="label">{label}</span>
            {children}
            {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
        </label>
    );
}
