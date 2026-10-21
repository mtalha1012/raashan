import { NavLink, Navigate, useParams } from 'react-router-dom';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminSlots from './AdminSlots';
import AdminUsers from './AdminUsers';

const TABS = {
    orders: ['Orders', AdminOrders],
    products: ['Products', AdminProducts],
    categories: ['Categories', AdminCategories],
    slots: ['Delivery slots', AdminSlots],
    users: ['Users', AdminUsers],
};

export default function AdminPage() {
    const { tab = 'orders' } = useParams();

    if (!TABS[tab]) return <Navigate to="/admin" replace />;

    const [, Section] = TABS[tab];

    return (
        <div>
            <p className="eyebrow">Shop admin</p>
            <h1 className="mt-1 text-4xl">Back of the shop</h1>

            <nav className="-mx-4 no-scrollbar mt-5 flex gap-1 overflow-x-auto border-b border-line px-4" aria-label="Admin sections">
                {Object.entries(TABS).map(([key, [label]]) => (
                    <NavLink
                        key={key}
                        to={key === 'orders' ? '/admin' : `/admin/${key}`}
                        end
                        className={() =>
                            `-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ${
                                tab === key ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-text'
                            }`
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-6">
                <Section />
            </div>
        </div>
    );
}
