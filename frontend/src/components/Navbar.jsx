import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '@/features/auth/authSlice';
import { showToast } from '@/features/ui/uiSlice';
import { CartIcon } from './Icons';

const linkClass = ({ isActive }) =>
    `rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
        isActive ? 'bg-ink-soft text-ink' : 'text-muted hover:text-text'
    }`;

export default function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const cartCount = useSelector((state) => state.cart.cart.totalItems);
    const openItems = useSelector((state) => state.household.items.filter((item) => !item.done).length);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        setMenuOpen(false);
        await dispatch(logout());
        dispatch(showToast('Logged out'));
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <Link to="/" className="flex items-baseline gap-2" aria-label="Raashan home">
                    <span className="font-display text-2xl font-black tracking-tight text-ink [font-stretch:125%]">Raashan</span>
                    <span className="hidden font-hand text-sm text-margin sm:inline">ghar ka saamaan</span>
                </Link>

                <div className="order-3 flex w-full items-center gap-1 sm:order-none sm:ml-4 sm:w-auto">
                    <NavLink to="/" end className={linkClass}>
                        Shop
                    </NavLink>
                    <NavLink to="/list" className={linkClass}>
                        Family list
                        {user && openItems > 0 && (
                            <span className="ml-1.5 rounded-full bg-haldi px-1.5 text-xs text-text">{openItems}</span>
                        )}
                    </NavLink>
                    {user && (
                        <NavLink to="/orders" className={linkClass}>
                            Orders
                        </NavLink>
                    )}
                    {user?.role === 'admin' && (
                        <NavLink to="/admin" className={linkClass}>
                            Admin
                        </NavLink>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {user ? (
                        <>
                            <Link to="/cart" className="btn btn-outline btn-sm relative" aria-label={`Cart, ${cartCount} items`}>
                                <CartIcon className="text-base" />
                                <span className="price">{cartCount}</span>
                            </Link>
                            <div className="relative">
                                <button
                                    type="button"
                                    className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display font-bold text-white"
                                    onClick={() => setMenuOpen((open) => !open)}
                                    aria-expanded={menuOpen}
                                    aria-label="Account menu"
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </button>
                                {menuOpen && (
                                    <div
                                        className="card absolute right-0 mt-2 w-48 overflow-hidden py-1 shadow-lg"
                                        onMouseLeave={() => setMenuOpen(false)}
                                    >
                                        <p className="truncate px-4 py-2 text-xs text-muted">{user.email}</p>
                                        <Link to="/account" className="block px-4 py-2 text-sm hover:bg-page" onClick={() => setMenuOpen(false)}>
                                            Account & addresses
                                        </Link>
                                        <button type="button" className="block w-full px-4 py-2 text-left text-sm text-margin hover:bg-page" onClick={handleLogout}>
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm">
                                Log in
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
