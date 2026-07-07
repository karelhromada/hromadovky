import { Link } from 'react-router-dom';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';

// Reálná 404 stránka (místo tichého redirectu na /). SPA sice nevrátí HTTP 404,
// ale zobrazí korektní stav a je noindex, aby ji crawler nebral jako plnohodnotný obsah.
export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      <PageHead {...SEO.notFound} />
      <h1 style={{ fontSize: '3rem', margin: 0 }}>404</h1>
      <p>Taková stránka bohužel neexistuje nebo byla přesunuta.</p>
      <Link to="/" className="btn-primary">Zpět na úvod</Link>
    </div>
  );
}
