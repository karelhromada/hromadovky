import { NavLink } from 'react-router-dom';
import './AdminNav.css';

const LINKS = [
    { to: '/admin/objednavky', label: 'Objednávky' },
    { to: '/admin/invoices', label: 'Faktury' },
    { to: '/admin/analytika', label: 'Analytika' },
] as const;

/** Přepínání mezi admin stránkami (dřív se adresy psaly ručně). */
export function AdminNav() {
    return (
        <nav className="admin-nav" aria-label="Administrace">
            {LINKS.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => (isActive ? 'admin-nav-link is-active' : 'admin-nav-link')}
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
}
