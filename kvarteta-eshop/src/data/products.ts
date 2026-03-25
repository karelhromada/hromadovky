import { Star, Sparkles, Trophy, Shield } from 'lucide-react';

export const kartyProducts = [
    {
        id: 'karty-tema-draku',
        name: 'Hrací karty: Epická dračí edice',
        description: 'Luxusní dračí edice. Mariášové barvy reprezentující živly. Hodnoty 10, J, Q, K, A v klasickém čistém herním designu s plnou originální malbou draků.',
        price: 349,
        themeColor: '#ff0033',
        images: ['/cards/dragon_scales_realistic_1.webp', '/cards/prsi/prsi_listy_A.webp', '/cards/prsi/prsi_srdce_K.webp'],
        boxImage: '/cards/prsi/prsi_srdce_A.webp',
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
        name: 'Hrací karty: Magické čarodějnice',
        description: 'Mysteriózní sady čarodějnic. Každá hodnota (spodek, svršek, král, eso) nabízí jedinečnou detailní ilustraci od učednic ohně až po královny lesa.',
        price: 349,
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
        name: 'Hrací karty: Život na zámku',
        description: 'Pohádková edice s princeznami, princi a roztomilými zvířátky. Jemné pastelové barvy a minimalistický design na čistě bílém pozadí.',
        price: 249,
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
        id: 'kvarteto-mytologie',
        name: 'Kvarteto: Mytologie a mýty',
        description: 'Epická sada bohů, hrdinů a temných bytostí. Sbírej rodiny božstev od starověkého Řecka po mrazivý sever. Obsahuje 32 karet s luxusním průhledným systémem vlastností.',
        price: 349,
        themeColor: '#fde047', // Zlatá božská jako výchozí
        badges: [
            { id: 1, text: 'Horká novinka', icon: Sparkles, color: '#fde047' }
        ],
        image: [
            '/cards/mytologie_v4/zeus_v4_1773232441103.png', '/cards/mytologie_v4/poseidon_v4_1773232459144.png', '/cards/mytologie_v4/hades_v4_1773232474069.png', '/cards/mytologie_v4/athena_v4_1773232489883.png',
            '/cards/mytologie_v4/herakles_v4_1773232618325.png', '/cards/mytologie_v4/meduza_v4_1773232636144.png', '/cards/mytologie_v4/kerberos_v4_1773232651828.png', '/cards/mytologie_v4/pegas_v4_1773232669889.png',
            '/cards/mytologie_v4/jupiter_v4_1773232768056.png', '/cards/mytologie_v4/mars_v4_1773232782289.png', '/cards/mytologie_v4/neptun_v4_1773232797411.png', '/cards/mytologie_v4/venuse_v4_1773232812348.png',
            '/cards/mytologie_v4/odin_v4_1773232963748.png', '/cards/mytologie_v4/thor_v4_1773232978954.png', '/cards/mytologie_v4/loki_v4_1773232994824.png', '/cards/mytologie_v4/freya_v4_1773233012935.png',
            '/cards/mytologie_v4/fenrir_v4_1773233163130.png', '/cards/mytologie_v4/jormungandr_v4_1773331719629.png', '/cards/mytologie_v4/valkyra_v4_1773331735922.png', '/cards/mytologie_v4/ymir_v4_1773331768521.png',
            '/cards/mytologie_v4/ra_v4_1773332186294.png', '/cards/mytologie_v4/anubis_v4_1773332202104.png', '/cards/mytologie_v4/horus_v4_1773332218750.png', '/cards/mytologie_v4/bastet_v4_1773332236278.png',
            '/cards/mytologie_v4/beowulf_v4_1773332496331.png', '/cards/mytologie_v4/grendel_v4_1773332517229.png', '/cards/mytologie_v4/grendel_mother_v4_1773332529832.png', '/cards/mytologie_v4/fire_dragon_v4_1773332546606.png',
            '/cards/mytologie_v4/minotaurus_v4_1773332802337.png', '/cards/mytologie_v4/bazilisek_v2_v4_1773333084369.png', '/cards/mytologie_v4/kraken_v4_1773332833372.png', '/cards/mytologie_v4/mantikora_v4_1773332852801.png'
        ]
    },
    {
        id: 'kvarteto-dinosauri',
        name: 'Kvarteto: Dinosauři',
        description: 'Poznejte prehistorické obry v luxusní sběratelské edici. 32 nádherně ilustrovaných karet.',
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
        price: 349,
        themeColor: '#ffccdd',
        badges: [
            { id: 1, text: 'Horká novinka', icon: Sparkles, color: '#ffb703' }
        ],
        image: [
            '/cards/rytiri_v3/sir-pufik_karta_v3.png', '/cards/rytiri_v3/lord-karamel_karta_v3.png', '/cards/rytiri_v3/baron-vlnka_karta_v3.png', '/cards/rytiri_v3/princ-pralinka_karta_v3.png',
            '/cards/rytiri_v3/kapitan-tlapka_karta_v3.png', '/cards/rytiri_v3/squirelous-kratky_karta_v3.png', '/cards/rytiri_v3/sir-jezurka_karta_v3.png', '/cards/rytiri_v3/don-krecek_karta_v3.png',
            '/cards/rytiri_v3/vanek-usaty_karta_v3.png', '/cards/rytiri_v3/rytir-rosa_karta_v3.png', '/cards/rytiri_v3/slecna-pirko_karta_v3.png', '/cards/rytiri_v3/broucek-zbrojnos_karta_v3.png',
            '/cards/rytiri_v3/sir-knoflik_karta_v3.png', '/cards/rytiri_v3/lego-las_karta_v3.png', '/cards/rytiri_v3/vojacek-oloveny_karta_v3.png', '/cards/rytiri_v3/jojo-rytir_karta_v3.png',
            '/cards/rytiri_v3/hvezdicka-jasna_karta_v3.png', '/cards/rytiri_v3/lord-polstar_karta_v3.png', '/cards/rytiri_v3/snilek-modry_karta_v3.png', '/cards/rytiri_v3/zvonilka-zbrojna_karta_v3.png',
            '/cards/rytiri_v3/sir-kapka_karta_v3.png', '/cards/rytiri_v3/admiral-kachnicka_karta_v3.png', '/cards/rytiri_v3/rytir-koral_karta_v3.png', '/cards/rytiri_v3/ploutvicka-chrabra_karta_v3.png',
            '/cards/rytiri_v3/sir-jahudka_karta_v3.png', '/cards/rytiri_v3/lord-citron_karta_v3.png', '/cards/rytiri_v3/baron-boruvka_karta_v3.png', '/cards/rytiri_v3/princ-ananas_karta_v3.png',
            '/cards/rytiri_v3/rytir-smudla_karta_v3.png', '/cards/rytiri_v3/squire-cara_karta_v3.png', '/cards/rytiri_v3/baron-v-naprstku_karta_v3.png', '/cards/rytiri_v3/sir-hajaja_karta_v3.png'
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
