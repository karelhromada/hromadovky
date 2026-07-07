import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHead } from '../components/seo/PageHead';
import { productPageSeo } from '../data/seo';
import {
    CATEGORY_INFO,
    PEXESO_PRICE_RANGE,
    getProductBySlug,
    listProducts,
    productPath,
    type ProductCategory,
} from '../data/catalog';
import NotFoundPage from './NotFoundPage';
import './ProductDetailPage.css';

const MAX_THUMBS = 11;
const MAX_RELATED = 4;

interface ProductDetailPageProps {
    category: ProductCategory;
}

const ProductDetailPage = ({ category }: ProductDetailPageProps) => {
    const { slug } = useParams();
    const product = slug ? getProductBySlug(category, slug) : undefined;
    const [activeIdx, setActiveIdx] = useState(0);

    // Reset galerie při přechodu na jiný produkt (stejná route → komponenta se nepřemountuje).
    // Vzor „adjust state during render" z React docs — setState v effectu by kaskádoval render.
    const [prevSlug, setPrevSlug] = useState(slug);
    if (slug !== prevSlug) {
        setPrevSlug(slug);
        setActiveIdx(0);
    }

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [category, slug]);

    if (!product) return <NotFoundPage />;

    const info = CATEGORY_INFO[category];
    const gallery = product.gallery;
    const mainImage = gallery[activeIdx] ?? gallery[0];
    const thumbs = gallery.slice(0, MAX_THUMBS + 1);
    const priceLabel = info.priceFrom ? `od ${PEXESO_PRICE_RANGE.low} Kč` : `${product.price} Kč`;
    const orderHref = `${info.path}?pridat=${encodeURIComponent(product.id)}#products`;
    const related = listProducts(category)
        .filter((p) => p.id !== product.id)
        .slice(0, MAX_RELATED);

    return (
        <div className="pdp">
            <PageHead {...productPageSeo(category, product)} />

            <div className="container">
                <nav className="pdp-breadcrumb" aria-label="Drobečková navigace">
                    <Link to="/">Domů</Link>
                    <span aria-hidden="true">/</span>
                    <Link to={info.path}>{info.label}</Link>
                    <span aria-hidden="true">/</span>
                    <span className="pdp-breadcrumb-current">{product.name}</span>
                </nav>

                <div className="pdp-layout">
                    <div className="pdp-gallery">
                        <div className="pdp-main-image" style={{ '--pdp-glow': product.themeColor } as React.CSSProperties}>
                            {mainImage && (
                                <img
                                    src={mainImage}
                                    alt={`${product.name} — ukázka karty`}
                                    width={product.imgWidth}
                                    height={product.imgHeight}
                                    fetchPriority="high"
                                    decoding="async"
                                />
                            )}
                        </div>
                        {thumbs.length > 1 && (
                            <div className="pdp-thumbs" role="list">
                                {thumbs.map((img, idx) => (
                                    <button
                                        key={img}
                                        type="button"
                                        role="listitem"
                                        className={`pdp-thumb ${idx === activeIdx ? 'active' : ''}`}
                                        onClick={() => setActiveIdx(idx)}
                                        aria-label={`Zobrazit kartu ${idx + 1}`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} — náhled karty ${idx + 1}`}
                                            width={product.imgWidth}
                                            height={product.imgHeight}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pdp-info">
                        <span className="badge">{info.label}</span>
                        <h1 className="pdp-title">{product.name}</h1>
                        <p className="pdp-price">
                            {priceLabel}
                            {info.priceFrom && <span className="pdp-price-note"> podle počtu a velikosti karet</span>}
                        </p>
                        <p className="pdp-short">{product.description}</p>

                        <div className="pdp-cta">
                            <Link to={orderHref} className="btn-primary">
                                Objednat — vybrat rub karet
                            </Link>
                            <Link to={info.path} className="btn-secondary">
                                Všechny naše {info.label.toLowerCase()}
                            </Link>
                        </div>

                        <ul className="pdp-specs">
                            {info.specs.map((spec) => (
                                <li key={spec.label}>
                                    <span className="pdp-spec-label">{spec.label}</span>
                                    <span className="pdp-spec-value">{spec.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <section className="pdp-desc">
                    <h2>
                        O produktu <span className="text-gradient-gold">{product.name}</span>
                    </h2>
                    {product.longDescription.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </section>

                {related.length > 0 && (
                    <section className="pdp-related">
                        <h2>Mohlo by se vám líbit</h2>
                        <div className="pdp-related-grid">
                            {related.map((p) => (
                                <Link key={p.id} to={productPath(category, p)} className="pdp-related-card">
                                    <img
                                        src={p.gallery[0]}
                                        alt={p.name}
                                        width={p.imgWidth}
                                        height={p.imgHeight}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <span>{p.name}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;
