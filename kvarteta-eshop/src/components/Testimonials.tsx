import './Testimonials.css';

const reviews = [
    {
        id: 1,
        author: 'Martina Novotná',
        role: 'Maminka 2 dětí',
        text: 'Konečně Kvarteto, které není jen o nudném sbírání čtyř stejných obrázků. Vyšší bere děti milují a já s nimi! Líbí se mi ta přidaná matematická hodnota pro mladšího syna.',
        rating: 5,
        avatar: '👩'
    },
    {
        id: 2,
        author: 'Lukáš M.',
        role: 'Sběratel deskových her',
        text: 'Ilustrace dráčků i dinosaurů jsou dechberoucí. Kvalita laminace je super. Balíček snese i to nejdrsnější míchání malými dětmi bez ohnutých rohů.',
        rating: 5,
        avatar: '👨‍🎤'
    },
    {
        id: 3,
        author: 'Petr a Anička (8 a 10 let)',
        role: 'Malí šampioni',
        text: 'Nejlepší je Magmísek s obrovskou silou! Hrajeme to s bráchou pořád, i ve vlaku a v autě. Jednoduchý a hned se hraje.',
        rating: 5,
        avatar: '👧'
    }
];

const Testimonials = () => {
    return (
        <section className="testimonials-section" id="testimonials">
            <div className="container">
                <div className="section-header text-center">
                    <span className="badge mb-4">Ohlasy</span>
                    <h2 className="section-title">Co říkají <span className="text-gradient-gold">malí hráči a rodiče</span></h2>
                    <p className="section-subtitle">Připojte se k tisícům spokojených rodin, které objevily zábavu s našimi kartami.</p>
                </div>

                <div className="testimonials-grid">
                    {reviews.map((review) => (
                        <div key={review.id} className="testimonial-card glass-panel">
                            <div className="stars">
                                {[...Array(review.rating)].map((_, i) => (
                                    <span key={i}>⭐</span>
                                ))}
                            </div>
                            <p className="testimonial-text">"{review.text}"</p>
                            <div className="testimonial-author-box">
                                <div className="author-avatar">{review.avatar}</div>
                                <div>
                                    <div className="author-name">{review.author}</div>
                                    <div className="author-role">{review.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
