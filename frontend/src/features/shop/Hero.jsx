import { Link } from 'react-router-dom';
import { ArrowIcon } from '@/components/Icons';

const EXAMPLE = [
    { wrote: 'doodh 2', matched: 'Fresh Milk', detail: '2 × 1 litre' },
    { wrote: 'anday 12', matched: 'Eggs', detail: '1 × 12 pcs' },
    { wrote: 'double roti', matched: 'Bread', detail: '1 × loaf' },
    { wrote: 'cheeni 2 kg', matched: 'Sugar', detail: '2 × 1 kg' },
];

export default function Hero({ ctaTo }) {
    return (
        <section className="grid items-center gap-10 pb-10 pt-2 lg:grid-cols-[1.05fr_1fr]">
            <div>
                <p className="eyebrow">Groceries for the whole household</p>
                <h1 className="mt-3 text-5xl sm:text-6xl">
                    Paste the family group.
                    <br />
                    <span className="text-ink">Get one list.</span>
                </h1>
                <p className="mt-5 max-w-lg text-lg text-muted">
                    Raashan reads messages like <span className="handwriting text-xl">"anday 12 aur doodh"</span>, matches
                    them to what's on the shelf, and keeps one list everyone in the house can add to. When it's
                    ready, it becomes a delivery.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                    <Link to={ctaTo} className="btn btn-primary">
                        Start a family list <ArrowIcon />
                    </Link>
                    <a href="#shop" className="btn btn-outline">
                        Browse the shop
                    </a>
                </div>
            </div>

            <div className="relative">
                <div className="whatsapp-bubble ml-auto max-w-xs px-3 py-2 text-sm shadow sm:-mb-6 sm:mr-6 sm:relative sm:z-10">
                    <p className="text-xs font-semibold text-leaf">Ammi</p>
                    <p>doodh 2, anday 12 aur double roti. cheeni 2 kg bhi</p>
                    <p className="text-right text-[10px] text-muted">9:14 pm</p>
                </div>

                <div className="parchi mt-4 py-2 pl-14 pr-5 sm:mt-0 sm:pt-10">
                    <ul>
                        {EXAMPLE.map((line, index) => (
                            <li
                                key={line.wrote}
                                className="parchi-row animate-write-in flex items-end gap-2 pb-2"
                                style={{ animationDelay: `${300 + index * 180}ms` }}
                            >
                                <span className="handwriting text-xl leading-none sm:text-2xl">{line.wrote}</span>
                                <span className="leader" />
                                <span className="text-right leading-tight">
                                    <span className="block text-sm font-semibold">{line.matched}</span>
                                    <span className="price block text-xs text-muted">{line.detail}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
