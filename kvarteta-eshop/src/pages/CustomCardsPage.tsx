import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import { customCardFaqs, customCardOptions, customCardSteps } from '../data/customCards';
import './CustomCardsPage.css';

// Landing page pro karty z vlastních fotek — cíl reklam (Google Ads) i organického
// hledání „pexeso z fotek" apod. Samotné editory žijí na stránkách kategorií,
// CTA na ně vedou přes hash (#creator / #family-configurator).
export default function CustomCardsPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="custom-cards-page">
            <PageHead {...SEO.customCards} />

            <section className="container cc-hero">
                <span className="badge mb-4">Osobní dárek</span>
                <h1>
                    Pexeso, kvarteto a hrací karty <span className="text-gradient-gold">z vlastních fotek</span>
                </h1>
                <p className="cc-lead">
                    Babička na esu, děti v pexesu, celá rodina v kvartetu. Nahrajte fotky v online editoru,
                    náhled uvidíte hned a hotové karty vám do 5 pracovních dnů doručíme domů.
                </p>
            </section>

            <section className="container cc-options" aria-label="Co si můžete vytvořit">
                {customCardOptions.map((option) => (
                    <article key={option.href} className="glass-panel cc-option">
                        <img src={option.image} alt={option.imageAlt} loading="lazy" className="cc-option-img" />
                        <div className="cc-option-body">
                            <h2>{option.title}</h2>
                            <p className="cc-price">{option.priceLabel}</p>
                            <p>{option.description}</p>
                            <Link to={option.href} className="btn-confirm cc-cta">
                                {option.cta}
                            </Link>
                        </div>
                    </article>
                ))}
            </section>

            <section className="container cc-section">
                <h2 className="cc-section-title">Jak to funguje</h2>
                <ol className="cc-steps">
                    {customCardSteps.map((step, idx) => (
                        <li key={step.title} className="glass-panel">
                            <span className="cc-step-number">{idx + 1}</span>
                            <h3>{step.title}</h3>
                            <p>{step.text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="container cc-section">
                <div className="glass-panel cc-quality">
                    <h2 className="cc-section-title">Karty, které vydrží</h2>
                    <p>
                        Tiskneme na prémiový lesklý fotopapír 220 mikronů a každou kartu oboustranně laminujeme
                        fólií 200 mikronů. Barvy fotek zůstanou syté a karty snesou ohýbání, polité kakao
                        i hraní na dovolené. Zadní stranu si vyberete z desítek motivů.
                    </p>
                </div>
            </section>

            <section className="container cc-section">
                <h2 className="cc-section-title">Časté otázky</h2>
                <dl className="cc-faq">
                    {customCardFaqs.map((faq) => (
                        <div key={faq.question} className="glass-panel">
                            <dt>{faq.question}</dt>
                            <dd>{faq.answer}</dd>
                        </div>
                    ))}
                </dl>
                <p className="cc-more">
                    Další odpovědi najdete v <Link to="/faq">často kladených otázkách</Link>, nebo nám napište
                    na <a href="mailto:info@hromadovky.cz">info@hromadovky.cz</a>.
                </p>
            </section>
        </div>
    );
}
