import React, { useState, useRef, useEffect } from 'react';
import { faqs, type FAQItem } from '../data/faq';
import './FAQ.css';

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
