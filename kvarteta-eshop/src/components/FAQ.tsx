import React, { useState, useRef, useEffect } from 'react';
import './FAQ.css';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: 'Jak dlouho trvá výroba a doručení?',
        answer: 'Hotové zboží odesíláme do 3 pracovních dnů na Vámi zvolenou adresu, nebo výdejní místo.'
    },
    {
        question: 'Jaké jsou rozměry kartiček?',
        answer: 'Karty vyrábíme ve velikosti klasických hracích karet, tedy 62 x 88 mm, aby Vám perfektně padly do ruky.'
    },
    {
        question: 'Do čeho jsou karty laminované?',
        answer: 'Používáme profesionální oboustranné laminovací fólie prémiové kvality s tloušťkou 200 mikronů. To kartám dodává maximální odolnost proti ohybu, vodě i zašpinění a zároveň exkluzivní lesk.'
    },
    {
        question: 'Na jaký papír se tiskne?',
        answer: 'Tiskneme na prémiový křídový papír s vysokou gramáží (350g/m²). Díky tomu jsou barvy brilantně syté a karta má perfektní tuhost ještě před samotnou laminací.'
    },
    {
        question: 'Mohu si karty navrhnout kompletně sám?',
        answer: 'Ano! Náš jedinečný konfigurátor Vám umožní vybrat si od tvaru a rozložení statistik až po styl ilustrací úplně vše. Kreativitě se u nás meze nekladou!'
    },
    {
        question: 'Co když chci na karty vlastní fotky dětí a rodiny?',
        answer: 'Samozřejmě! Součást našeho editoru na výrobu vlastního kvarteta je možnost zaškrtnout volbu nahrát svoje vlastní fotografie. Potom můžete každou fotografii pojmenovat, nadefinovat, a dokonce ji i přiřadit vlastnosti. Zároveň i můžete zadat, že na svých kvartetech nechcete žádné vlastnosti.'
    }
];

const FAQAccordionItem: React.FC<{ faq: FAQItem; isOpen: boolean; onClick: () => void; index: number }> = ({ faq, isOpen, onClick, index }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | 'auto'>(0);

    useEffect(() => {
        if (isOpen) {
            const contentEl = contentRef.current;
            if (contentEl) {
                setHeight(contentEl.scrollHeight);
            }
        } else {
            setHeight(0);
        }
    }, [isOpen]);

    return (
        <div className={`faq-item ${isOpen ? 'open' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
            <button className="faq-question" onClick={onClick} aria-expanded={isOpen}>
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </button>
            <div
                className="faq-answer-wrapper"
                style={{ height: isOpen ? height : 0, opacity: isOpen ? 1 : 0 }}
            >
                <div className="faq-answer" ref={contentRef}>
                    {faq.answer}
                </div>
            </div>
        </div>
    );
};

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="faq-section" id="faq">
            <div className="container">
                <div className="section-header text-center">
                    <span className="badge mb-4">Často kladené otázky</span>
                    <h2 className="section-title">Vše, co potřebujete <span className="text-gradient-gold">vědět</span></h2>
                    <p className="section-subtitle">Odpovědi na nejčastější dotazy ohledně výroby, kvality a doručení našich prémiových karet.</p>
                </div>

                <div className="faq-container">
                    {faqs.map((faq, index) => (
                        <FAQAccordionItem
                            key={index}
                            index={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
