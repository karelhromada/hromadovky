// FAQ data — sdílí je komponenta FAQ.tsx (accordion) a seo.ts (FAQPage JSON-LD).
export interface FAQItem {
    question: string;
    answer: string;
}

export const faqs: FAQItem[] = [
    {
        question: 'Jak dlouho trvá výroba a doručení?',
        answer: 'Výroba a doručení trvá do 5 pracovních dní na Vámi zvolenou adresu, nebo výdejní místo.'
    },
    {
        question: 'Jaké jsou rozměry kartiček?',
        answer: 'Můžete si vybrat ze 3 velikostí. Malé cestovní (menší než jsou běžné karty), střední (jako klasické herní karty) a pro milovníky ilustrací a maximální zážitek máme i XL (větší než jsou běžné).'
    },
    {
        question: 'Do čeho jsou karty laminované?',
        answer: 'Používáme profesionální oboustranné laminovací fólie prémiové kvality s tloušťkou 200 mikronů. To kartám dodává maximální odolnost proti ohybu, vodě i zašpinění a zároveň exkluzivní lesk.'
    },
    {
        question: 'Na jaký papír se tiskne?',
        answer: 'Tiskneme na prémiový lesklý fotopapír o tloušťce 220 mikronů. Díky tomu jsou barvy brilantně syté a karta má perfektní tuhost ještě před samotnou laminací.'
    },
    {
        question: 'Mohu si karty navrhnout kompletně sám?',
        answer: 'Ano, s naším interaktivním konfigurátorem máte plnou volnost. Můžete si vybrat z desítek úchvatných ilustrací, přizpůsobit tvar karty i zvolit si zcela vlastní rozložení statistik. Vaší tvořivosti zkrátka nestojí nic v cestě! Nebo nám napište na info@hromadovky.cz vaše nápady, přání či dotazy a my se Vám ozveme :)'
    },
    {
        question: 'Co když chci na karty vlastní fotky dětí a rodiny?',
        answer: 'Samozřejmě! Součást našeho editoru na výrobu vlastního kvarteta je možnost zaškrtnout volbu nahrát svoje vlastní fotografie. Potom můžete každou fotografii pojmenovat, nadefinovat, a dokonce ji i přiřadit vlastnosti. Zároveň i můžete zadat, že na svých kvartetech nechcete žádné vlastnosti.'
    }
];
