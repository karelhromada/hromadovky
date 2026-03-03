import { useState } from 'react';
import './HowToPlay.css';

const rules = [
    {
        id: '01',
        title: 'Rozdejte karty',
        desc: 'Zamíchejte balíček a rozdejte všechny karty rovnoměrně mezi hráče. Každý drží své karty tak, aby viděl pouze vrchní.'
    },
    {
        id: '02',
        title: 'Zvolte nejlepší vlastnost',
        desc: 'Hráč na tahu vybere z vrchní karty tu vlastnost (např. Síla nebo Rychlost), o které si myslí, že je v ní jeho postava nejsilnější.'
    },
    {
        id: '03',
        title: 'Vyšší bere vše!',
        desc: 'Ostatní hráči nahlásí hodnotu stejné vlastnosti. Karta s nejlepším (zpravidla nejvyšším) číslem vyhrává a bere karty všech poražených!'
    }
];

const kvartetoRules = [
    {
        id: '01',
        title: 'Cíl hry a rozdání',
        desc: 'Zamíchejte balíček a rozdejte všechny karty mezi hráče. Cílem hry je nasbírat co nejvíce kvartet (čtveřic karet ze stejné rodiny, např. 1A, 1B, 1C, 1D).'
    },
    {
        id: '02',
        title: 'Vyžádejte si kartu',
        desc: 'Hráč na tahu se zeptá kohokoliv na konkrétní kartu (např. "Máš 1C?"). Podmínkou je, že musí sám držet alespoň jednu jinou kartu z dotazované čtveřice (např. 1A).'
    },
    {
        id: '03',
        title: 'Pokračování v tahu',
        desc: 'Pokud vyzvaný hráč kartu má, musí ji odevzdat a tvůj tah pokračuje další otázkou. Pokud ji nemá, tvůj tah končí a hraje vyzvaný hráč. Kdo složí kvarteto, ihned si jej vyloží.'
    }
];

const HowToPlay = () => {
    const [activeTab, setActiveTab] = useState<'vyssi' | 'kvarteto'>('vyssi');

    const activeRules = activeTab === 'vyssi' ? rules : kvartetoRules;

    return (
        <section className="how-to-play-section" id="how-to-play">
            <div className="container">
                <div className="section-header text-center">
                    <span className="badge mb-4">Pravidla hry</span>
                    <h2 className="section-title">Jak se hraje <span className="text-gradient-gold">{activeTab === 'vyssi' ? 'Vyšší bere' : 'Kvarteto'}</span>?</h2>
                    <p className="section-subtitle">
                        {activeTab === 'vyssi'
                            ? 'Tři jednoduché kroky, které zaručí hodiny akční zábavy pro celou rodinu.'
                            : 'Klasická strategická paměťovka pro všechny generace. Kdo získá nejvíce čtveřic?'}
                    </p>
                </div>

                <div className="rules-toggle-container">
                    <div className="rules-toggle">
                        <button
                            className={`toggle-btn ${activeTab === 'vyssi' ? 'active' : ''}`}
                            onClick={() => setActiveTab('vyssi')}
                        >
                            Vyšší bere
                        </button>
                        <button
                            className={`toggle-btn ${activeTab === 'kvarteto' ? 'active' : ''}`}
                            onClick={() => setActiveTab('kvarteto')}
                        >
                            Klasické Kvarteto
                        </button>
                    </div>
                </div>

                <div className="timeline-container">
                    <div className="timeline-line"></div>
                    {activeRules.map((rule, index) => (
                        <div key={rule.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                            <div className="timeline-dot"></div>
                            <div className="timeline-content glass-panel">
                                <div className="rule-number">{rule.id}</div>
                                <h3>{rule.title}</h3>
                                <p>{rule.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowToPlay;
