export default function AuthCard({ title, subtitle, children, footer }) {
    return (
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-line bg-white md:grid-cols-[1fr_1.1fr]">
            <aside className="parchi hidden flex-col justify-between rounded-none p-8 pl-16 md:flex">
                <p className="eyebrow">Today's parchi</p>
                <ul className="handwriting text-2xl">
                    {['doodh 2', 'anday 12', 'double roti'].map((line) => (
                        <li key={line} className="parchi-row flex items-end pb-1">
                            {line}
                        </li>
                    ))}
                    <li className="parchi-row flex items-end pb-1 line-through decoration-margin decoration-2">cheeni 2 kg</li>
                </ul>
                <p className="text-sm text-muted">One list for the whole family, delivered in the slot you pick.</p>
            </aside>

            <section className="p-6 sm:p-10">
                <h1 className="text-3xl sm:text-4xl">{title}</h1>
                {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
                <div className="mt-6">{children}</div>
                {footer && <div className="mt-6 text-sm text-muted">{footer}</div>}
            </section>
        </div>
    );
}
