import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorText, Loader } from '@/components/Feedback';
import { ArrowIcon, SearchIcon } from '@/components/Icons';
import { fetchCategories, fetchProducts } from './shopSlice';
import Hero from './Hero';
import ProductCard from './ProductCard';

export default function ShopPage() {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, filteredCount, perPage, status, error, categories } = useSelector((state) => state.shop);
    const user = useSelector((state) => state.auth.user);
    const openItems = useSelector((state) => state.household.items.filter((item) => !item.done).length);

    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const page = Number(searchParams.get('page')) || 1;
    const [search, setSearch] = useState(keyword);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchProducts({ keyword, category, page }));
    }, [keyword, category, page, dispatch]);

    const updateFilters = (changes) => {
        const next = { keyword, category, page: 1, ...changes };
        const params = {};
        if (next.keyword) params.keyword = next.keyword;
        if (next.category) params.category = next.category;
        if (next.page > 1) params.page = next.page;
        setSearchParams(params);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        updateFilters({ keyword: search.trim() });
    };

    const pageCount = Math.ceil(filteredCount / perPage);
    const activeCategory = categories.find((item) => item._id === category);

    return (
        <div>
            {user?.household ? (
                <Link to="/list" className="mb-8 flex items-center justify-between gap-4 rounded-2xl bg-ink px-5 py-4 text-white">
                    <span>
                        <span className="block font-display text-xl font-bold">Your family list</span>
                        <span className="text-sm text-white/80">
                            {openItems ? `${openItems} item${openItems === 1 ? '' : 's'} still to buy` : 'Nothing pending right now'}
                        </span>
                    </span>
                    <ArrowIcon className="text-2xl" />
                </Link>
            ) : (
                <Hero ctaTo={user ? '/list' : '/register'} />
            )}

            <section id="shop" className="scroll-mt-24">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <h2 className="text-3xl">{activeCategory ? `${activeCategory.icon} ${activeCategory.name}` : 'The shop'}</h2>
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80" role="search">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            className="input pl-9"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search: doodh, atta, sabun…"
                            aria-label="Search products"
                        />
                    </form>
                </div>

                <div className="-mx-4 mt-4 no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
                    <button
                        type="button"
                        className={`btn btn-sm shrink-0 ${!category ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => updateFilters({ category: '' })}
                    >
                        Everything
                    </button>
                    {categories.map((item) => (
                        <button
                            key={item._id}
                            type="button"
                            className={`btn btn-sm shrink-0 ${category === item._id ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => updateFilters({ category: item._id })}
                        >
                            <span aria-hidden="true">{item.icon}</span> {item.name}
                        </button>
                    ))}
                </div>

                {keyword && (
                    <p className="mt-3 text-sm text-muted">
                        {filteredCount} result{filteredCount === 1 ? '' : 's'} for "{keyword}" ·{' '}
                        <button
                            type="button"
                            className="font-semibold text-ink"
                            onClick={() => {
                                setSearch('');
                                updateFilters({ keyword: '' });
                            }}
                        >
                            Clear search
                        </button>
                    </p>
                )}

                <div className="mt-5">
                    {status === 'loading' && products.length === 0 && <Loader label="Loading the shelves" />}
                    <ErrorText>{error}</ErrorText>

                    {status === 'ready' && products.length === 0 && (
                        <EmptyState title="Nothing on this shelf">
                            Try another spelling, or search in Urdu words like "cheeni" or "dahi".
                        </EmptyState>
                    )}

                    <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 ${status === 'loading' ? 'opacity-60' : ''}`}>
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {pageCount > 1 && (
                        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pages">
                            <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => updateFilters({ page: page - 1 })}>
                                Previous
                            </button>
                            <span className="price px-3 text-sm text-muted">
                                {page} / {pageCount}
                            </span>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled={page >= pageCount}
                                onClick={() => updateFilters({ page: page + 1 })}
                            >
                                Next
                            </button>
                        </nav>
                    )}
                </div>
            </section>
        </div>
    );
}
