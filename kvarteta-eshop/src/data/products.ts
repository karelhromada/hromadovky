import { Star, Sparkles, Trophy, Shield } from 'lucide-react';

export const kartyProducts = [
    {
        id: 'karty-tema-draku',
        name: 'Epická dračí edice',
        description: 'Luxusní dračí edice. Mariášové barvy reprezentující živly. Hodnoty 10, J, Q, K, A v klasickém čistém herním designu s plnou originální malbou draků.',
        price: 449,
        themeColor: '#ff0033',
        images: ['/cards/dragon_scales_realistic_1.webp', '/cards/prsi/prsi_listy_A.webp', '/cards/prsi/prsi_srdce_K.webp'],
        boxImage: '/cards/dragon_scales_realistic_1.webp',
        isThematic: true,
        sampleValue: 'A',
        sampleSuit: '♥',
        allCards: [
            '/cards/prsi/prsi_srdce_7.webp', '/cards/prsi/prsi_srdce_8.webp', '/cards/prsi/prsi_srdce_9.webp', '/cards/prsi/prsi_srdce_10.webp', '/cards/prsi/prsi_srdce_J.webp', '/cards/prsi/prsi_srdce_Q.webp', '/cards/prsi/prsi_srdce_K.webp', '/cards/prsi/prsi_srdce_A.webp',
            '/cards/prsi/prsi_listy_7.webp', '/cards/prsi/prsi_listy_8.webp', '/cards/prsi/prsi_listy_9.webp', '/cards/prsi/prsi_listy_10.webp', '/cards/prsi/prsi_listy_J.webp', '/cards/prsi/prsi_listy_Q.webp', '/cards/prsi/prsi_listy_K.webp', '/cards/prsi/prsi_listy_A.webp',
            '/cards/prsi/prsi_zaludy_7.webp', '/cards/prsi/prsi_zaludy_8.webp', '/cards/prsi/prsi_zaludy_9.webp', '/cards/prsi/prsi_zaludy_10.webp', '/cards/prsi/prsi_zaludy_J.webp', '/cards/prsi/prsi_zaludy_Q.webp', '/cards/prsi/prsi_zaludy_K.webp', '/cards/prsi/prsi_zaludy_A.webp',
            '/cards/prsi/prsi_kule_7.webp', '/cards/prsi/prsi_kule_8.webp', '/cards/prsi/prsi_kule_9.webp', '/cards/prsi/prsi_kule_10.webp', '/cards/prsi/prsi_kule_J.webp', '/cards/prsi/prsi_kule_Q.webp', '/cards/prsi/prsi_kule_K.webp', '/cards/prsi/prsi_kule_A.webp'
        ]
    },
    {
        id: 'karty-tema-carodejnice',
        name: 'Magické čarodějnice',
        description: 'Mysteriózní sady čarodějnic. Každá hodnota (spodek, svršek, král, eso) nabízí jedinečnou detailní ilustraci od učednic ohně až po královny lesa.',
        price: 449,
        themeColor: '#ff4b4b',
        images: ['/cards/carodejnice/eso_srdce_oznaceno.png', '/cards/carodejnice/kral_listy_oznaceno.png', '/cards/carodejnice/svrsek_zaludy_oznaceno.png'],
        boxImage: '/cards/carodejnice/kral_srdce_oznaceno.png',
        isThematic: true,
        sampleValue: 'K',
        sampleSuit: '♥',
        allCards: [
            '/cards/carodejnice/eso_srdce_oznaceno.png', '/cards/carodejnice/kral_srdce_oznaceno.png', '/cards/carodejnice/svrsek_srdce_oznaceno.png', '/cards/carodejnice/spodek_srdce_oznaceno.png', '/cards/carodejnice/desitka_srdce_oznaceno.png', '/cards/carodejnice/devitka_srdce_oznaceno.png', '/cards/carodejnice/osmicka_srdce_oznaceno.png', '/cards/carodejnice/sedmicka_srdce_oznaceno.png',
            '/cards/carodejnice/eso_listy_oznaceno.png', '/cards/carodejnice/kral_listy_oznaceno.png', '/cards/carodejnice/svrsek_listy_oznaceno.png', '/cards/carodejnice/spodek_listy_oznaceno.png', '/cards/carodejnice/desitka_listy_oznaceno.png', '/cards/carodejnice/devitka_listy_oznaceno.png', '/cards/carodejnice/osmicka_listy_oznaceno.png', '/cards/carodejnice/sedmicka_listy_oznaceno.png',
            '/cards/carodejnice/eso_zaludy_oznaceno.png', '/cards/carodejnice/kral_zaludy_oznaceno.png', '/cards/carodejnice/svrsek_zaludy_oznaceno.png', '/cards/carodejnice/spodek_zaludy_oznaceno.png', '/cards/carodejnice/desitka_zaludy_oznaceno.png', '/cards/carodejnice/devitka_zaludy_oznaceno.png', '/cards/carodejnice/osmicka_zaludy_oznaceno.png', '/cards/carodejnice/sedmicka_zaludy_oznaceno.png',
            '/cards/carodejnice/eso_kule_oznaceno.png', '/cards/carodejnice/kral_kule_oznaceno.png', '/cards/carodejnice/svrsek_kule_oznaceno.png', '/cards/carodejnice/spodek_kule_oznaceno.png', '/cards/carodejnice/desitka_kule_oznaceno.png', '/cards/carodejnice/devitka_kule_oznaceno.png', '/cards/carodejnice/osmicka_kule_oznaceno.png', '/cards/carodejnice/sedmicka_kule_oznaceno.png'
        ]
    },
    {
        id: 'karty-tema-princezny',
        name: 'Princezny bez pozadí',
        description: 'Pohádková edice s princeznami, princi a roztomilými zvířátky. Jemné pastelové barvy a minimalistický design na čistě bílém pozadí.',
        price: 449,
        themeColor: '#ff66b2', // Růžová
        images: ['/cards/princezny bez pozadi/eso_srdce.png', '/cards/princezny bez pozadi/kralovna_zelene.png', '/cards/princezny bez pozadi/sedmicka_srdce.png'],
        boxImage: '/cards/princezny bez pozadi/eso_srdce.png',
        isThematic: true,
        sampleValue: 'Q',
        sampleSuit: '♥',
        allCards: [
            '/cards/princezny bez pozadi/eso_srdce.png', '/cards/princezny bez pozadi/kralovna_srdce.png', '/cards/princezny bez pozadi/svrsek_srdce.png', '/cards/princezny bez pozadi/spodek_srdce.png', '/cards/princezny bez pozadi/desitka_srdce.png', '/cards/princezny bez pozadi/devitka_srdce.png', '/cards/princezny bez pozadi/osmicka_srdce.png', '/cards/princezny bez pozadi/sedmicka_srdce.png',
            '/cards/princezny bez pozadi/eso_zelene.png', '/cards/princezny bez pozadi/kralovna_zelene.png', '/cards/princezny bez pozadi/svrsek_zelene.png', '/cards/princezny bez pozadi/spodek_zelene.png', '/cards/princezny bez pozadi/desitka_zelene.png', '/cards/princezny bez pozadi/devitka_zelene.png', '/cards/princezny bez pozadi/osmicka_zelene.png', '/cards/princezny bez pozadi/sedmicka_zelene.png',
            '/cards/princezny bez pozadi/eso_zaludy.png', '/cards/princezny bez pozadi/kral_zaludy.png', '/cards/princezny bez pozadi/svrsek_zaludy.png', '/cards/princezny bez pozadi/spodek_zaludy.png', '/cards/princezny bez pozadi/desitka_zaludy.png', '/cards/princezny bez pozadi/devitka_zaludy.png', '/cards/princezny bez pozadi/osmicka_zaludy.png', '/cards/princezny bez pozadi/sedmicka_zaludy.png',
            '/cards/princezny bez pozadi/eso_kule.png', '/cards/princezny bez pozadi/kral_kule.png', '/cards/princezny bez pozadi/svrsek_kule.png', '/cards/princezny bez pozadi/spodek_kule.png', '/cards/princezny bez pozadi/desitka_kule.png', '/cards/princezny bez pozadi/devitka_kule.png', '/cards/princezny bez pozadi/osmicka_kule.png', '/cards/princezny bez pozadi/sedmicka_kule.png'
        ]
    }
];

export const kvartetaProducts = [
    {
        id: 'kvarteto-dinosauri',
        name: 'Kvarteto: Dinosauři',
        description: 'Poznejte prehistorické obry v luxusní sběratelské edici. 32 nádherně ilustrovaných karet s unikátními statistikami.',
        price: 349,
        themeColor: '#ff8a00',
        badges: [
            { id: 1, text: 'Bestseller', icon: Trophy, color: '#ffb703' }
        ],
        image: [
            '/cards/dino_full_1.webp', '/cards/dino_full_2.webp', '/cards/dino_full_3.webp', '/cards/dino_full_4.webp',
            '/cards/dino_full_5.webp', '/cards/dino_full_6.webp', '/cards/dino_full_7.webp', '/cards/dino_full_8.webp',
            '/cards/dino_full_9.webp', '/cards/dino_full_10.webp'
        ]
    },
    {
        id: 'kvarteto-dracci',
        name: 'Kvarteto: Baby dráčci',
        description: 'Roztomilí a silní Baby dráčci v prémiové úpravě. Perfektní pro dětské hráče i sběratele.',
        price: 349,
        themeColor: '#a100ff',
        badges: [
            { id: 1, text: 'Roztomilé', icon: Star, color: '#d946ef' }
        ],
        image: [
            '/cards/baby_full_1.webp', '/cards/baby_full_2.webp', '/cards/baby_full_3.webp', '/cards/baby_full_4.webp',
            '/cards/baby_full_5.webp', '/cards/baby_full_6.webp', '/cards/baby_full_7.webp', '/cards/baby_full_8.webp',
            '/cards/baby_full_9.webp', '/cards/baby_full_10.webp', '/cards/baby_full_11.webp'
        ]
    },
    {
        id: 'kvarteto-draci',
        name: 'Kvarteto: Draci',
        description: 'Mocní a legendární Draci přinášejí do hry epické souboje. Nejmocnější bytosti v prémiovém provedení.',
        price: 349,
        themeColor: '#ff0033',
        badges: [
            { id: 1, text: 'Premium', icon: Shield, color: '#ef4444' }
        ],
        image: [
            '/cards/drag_full_1.webp', '/cards/drag_full_2.webp', '/cards/drag_full_3.webp', '/cards/drag_full_4.webp',
            '/cards/drag_full_5.webp', '/cards/drag_full_6.webp', '/cards/drag_full_7.webp', '/cards/drag_full_8.webp',
            '/cards/drag_full_9.webp', '/cards/drag_full_10.webp', '/cards/drag_full_11.webp'
        ]
    },
    {
        id: 'kvarteto-rytiri',
        name: 'Kvarteto: Roztomilí rytíři',
        description: 'Šlechetní a neuvěřitelně sladcí rytíři v brnění z marshmallow, karamelu i hvězdného prachu. Unikátní herní zážitek.',
        price: 389,
        themeColor: '#ffccdd',
        badges: [
            { id: 1, text: 'Horká novinka', icon: Sparkles, color: '#ffb703' }
        ],
        image: [
            '/cards/knight_full_1.webp', '/cards/knight_full_2.webp', '/cards/knight_full_3.webp', '/cards/knight_full_4.webp',
            '/cards/knight_full_5.webp', '/cards/knight_full_6.webp', '/cards/knight_full_7.webp', '/cards/knight_full_8.webp',
            '/cards/knight_full_9.webp', '/cards/knight_full_10.webp'
        ]
    },
    {
        id: 'kvarteto-kocky',
        name: 'Kvarteto: Kočky bojovnice',
        description: 'Odvážné, mrštné a nebezpečně roztomilé kočičí válečnice. Získejte celou kočičí armádu.',
        price: 349,
        themeColor: '#00d2ff',
        badges: [
            { id: 1, text: 'Populární', icon: Star, color: '#0ea5e9' }
        ],
        image: [
            '/cards/cat_full_1.webp', '/cards/cat_full_2.webp', '/cards/cat_full_3.webp', '/cards/cat_full_4.webp',
            '/cards/cat_full_5.webp', '/cards/cat_full_6.webp', '/cards/cat_full_7.webp', '/cards/cat_full_8.webp',
            '/cards/cat_full_9.webp', '/cards/cat_full_10.webp'
        ]
    }
];
