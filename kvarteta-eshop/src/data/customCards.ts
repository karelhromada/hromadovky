// Data landing page /vlastni-karty (karty z vlastních fotek). Sdílí je stránka
// CustomCardsPage.tsx i seo.ts (FAQPage JSON-LD). Ceny drž v sync s konfigurátory:
// CardCreator (QUARTET_BASE_PRICE), PexesoCreator (16/32/64 karet), FamilyCardConfigurator.
import type { FAQItem } from './faq';

export interface CustomCardOption {
    title: string;
    priceLabel: string;
    description: string;
    image: string;
    imageAlt: string;
    /** Konfigurátor na stránce kategorie — hash odroluje přímo k editoru. */
    href: string;
    cta: string;
}

export const customCardOptions: readonly CustomCardOption[] = [
    {
        title: 'Pexeso z vlastních fotek',
        priceLabel: 'od 249 Kč',
        description:
            'Nahrajte 8, 16 nebo 32 fotografií a my z nich vyrobíme pexeso o 16, 32 nebo 64 kartách. Tři velikosti kartiček, zadní stranu si vyberete z desítek motivů.',
        image: '/images/hero_family_joy.png',
        imageAlt: 'Rodina u stolu hraje pexeso Hromadovky',
        href: '/pexeso#creator',
        cta: 'Vytvořit pexeso',
    },
    {
        title: 'Hrací karty s rodinnými fotkami',
        priceLabel: '299 Kč',
        description:
            'Balíček hracích karet, kde na každé kartě může být někdo z rodiny. Fotky v editoru posunete a zvětšíte přesně podle sebe.',
        image: '/cards/rodina/karikatura.webp',
        imageAlt: 'Ukázka hrací karty s rodinnou fotografií',
        href: '/karty#family-configurator',
        cta: 'Vytvořit hrací karty',
    },
    {
        title: 'Vlastní kvarteto',
        priceLabel: '599 Kč',
        description:
            'Kvarteto navržené podle vás: vlastní fotky, názvy karet i vlastnosti. Nebo vlastnosti úplně vypněte a hrajte jen s obrázky.',
        image: '/cards/mytologie_v4/zeus_v4_1773232441103.webp',
        imageAlt: 'Ukázka karty kvarteta s vlastnostmi',
        href: '/kvarteta#creator',
        cta: 'Vytvořit kvarteto',
    },
];

export const customCardSteps: readonly { title: string; text: string }[] = [
    { title: 'Vyberte hru', text: 'Pexeso, hrací karty, nebo kvarteto — a velikost sady.' },
    { title: 'Nahrajte fotky', text: 'Přímo v prohlížeči. Náhled každé karty vidíte hned a fotky můžete posouvat i zvětšovat.' },
    { title: 'Doručíme domů', text: 'Vytiskneme, zalaminujeme a do 5 pracovních dnů je máte doma nebo na výdejním místě.' },
];

export const customCardFaqs: readonly FAQItem[] = [
    {
        question: 'Kolik fotek potřebuji na pexeso?',
        answer: 'Pro pexeso o 16 kartách potřebujete 8 fotek, pro 32 karet 16 fotek a pro 64 karet 32 fotek — každá fotka je ve hře dvakrát.',
    },
    {
        question: 'Jak dlouho trvá výroba a doručení?',
        answer: 'Výroba a doručení trvá do 5 pracovních dní na vámi zvolenou adresu nebo výdejní místo Zásilkovny či PPL.',
    },
    {
        question: 'Na jaký papír karty tisknete?',
        answer: 'Tiskneme na prémiový lesklý fotopapír 220 mikronů a karty oboustranně laminujeme fólií 200 mikronů. Jsou odolné proti ohybu, vodě i zašpinění.',
    },
    {
        question: 'Lze personalizované karty vrátit?',
        answer: 'Sady vyrobené z vašich fotografií jsou zboží na míru, proto u nich podle § 1837 občanského zákoníku nelze odstoupit od smlouvy do 14 dnů. Reklamace vad samozřejmě platí v plném rozsahu.',
    },
];
