import React from 'react';
import LegalPage from '../components/LegalPage';

const TermsPage: React.FC = () => {
    return (
        <LegalPage
            title="Obchodní podmínky"
            subtitle="Podmínky nákupu prémiových karetních her Hromadovky"
            effectiveDate="1. 1. 2026"
        >
            <div className="legal-meta">
                <strong>Provozovatel:</strong>{' '}
                Karel Hromada, IČO: 76137767, neplátce DPH,
                bytem Zeyerova alej 20, Praha 6,
                e-mail: <a href="mailto:info@hromadovky.cz">info@hromadovky.cz</a>,
                zapsaný v živnostenském rejstříku
                {' '}(dále jen „<strong>Prodávající</strong>").
            </div>

            <h2>1. Úvodní ustanovení</h2>
            <p>
                Tyto obchodní podmínky (dále jen „<strong>Podmínky</strong>") upravují v souladu se
                zákonem č. 89/2012 Sb., občanský zákoník, vzájemná práva a povinnosti smluvních stran
                vzniklé v souvislosti nebo na základě kupní smlouvy uzavírané mezi Prodávajícím
                a kupujícím prostřednictvím internetového obchodu <strong>hromadovky.cz</strong>{' '}
                (dále jen „<strong>E-shop</strong>").
            </p>
            <p>
                Je-li smluvní stranou spotřebitel (osoba, která nejedná v rámci své podnikatelské činnosti),
                řídí se vztahy neupravené Podmínkami zákonem č. 89/2012 Sb. a zákonem č. 634/1992 Sb.,
                o ochraně spotřebitele.
            </p>

            <h2>2. Uživatelský účet a uzavření kupní smlouvy</h2>
            <p>
                Veškerá prezentace zboží na E-shopu je informativního charakteru a Prodávající není
                povinen uzavřít kupní smlouvu ohledně tohoto zboží. Ustanovení § 1732 odst. 2 občanského
                zákoníku se nepoužije.
            </p>
            <p>
                Pro objednání zboží vyplní kupující objednávkový formulář v E-shopu. Před odesláním
                objednávky je kupujícímu umožněno zkontrolovat a měnit údaje, které do objednávky vložil.
                Odesláním objednávky kupující potvrzuje, že se seznámil s těmito Podmínkami a souhlasí s nimi.
            </p>
            <p>
                Smluvní vztah mezi Prodávajícím a kupujícím vzniká doručením přijetí objednávky (akceptací),
                jež je Prodávajícím zasláno kupujícímu elektronickou poštou na adresu uvedenou
                v uživatelském účtu nebo v objednávce.
            </p>

            <h2>3. Cena zboží a platební podmínky</h2>
            <p>
                Ceny zboží jsou uvedeny jako konečné včetně všech souvisejících poplatků, vyjma nákladů
                na dodání zboží. Prodávající není plátcem DPH. Cena zboží zůstává v platnosti po dobu,
                po kterou je zobrazována v E-shopu.
            </p>
            <p>Cenu zboží a případné náklady na dodání může kupující uhradit Prodávajícímu těmito způsoby:</p>
            <ul>
                <li>bezhotovostně převodem na bankovní účet Prodávajícího č. <strong>670100-2202858274/6210</strong>;</li>
                <li>bezhotovostně platební kartou prostřednictvím platební brány provozované poskytovatelem platebních služeb;</li>
                <li>dobírkou v místě určeném kupujícím v objednávce (pokud je tato volba nabízena).</li>
            </ul>
            <p>
                V případě bezhotovostní platby je kupní cena splatná do <strong>7 dnů</strong> od uzavření
                kupní smlouvy. Závazek kupujícího uhradit kupní cenu je splněn okamžikem připsání částky
                na účet Prodávajícího.
            </p>

            <h2>4. Dodací podmínky</h2>
            <p>
                Způsob doručení zboží volí kupující v objednávkovém formuláři. Náklady na dopravu se řídí
                aktuálním ceníkem v E-shopu a jsou kupujícímu zobrazeny před dokončením objednávky.
            </p>
            <p>
                Obvyklá doba dodání zboží skladem je <strong>do 5 pracovních dnů</strong> od přijetí platby.
                U zboží na zakázku (personalizované sady) může být doba dodání delší a Prodávající o ní
                kupujícího informuje.
            </p>
            <p>
                Při převzetí zboží od přepravce je kupující povinen zkontrolovat neporušenost obalu zboží
                a v případě jakýchkoli závad neprodleně oznámit přepravci.
            </p>

            <h2>5. Odstoupení od smlouvy</h2>
            <p>
                Kupující, který je spotřebitelem, má v souladu s § 1829 odst. 1 občanského zákoníku právo
                odstoupit od kupní smlouvy bez udání důvodu, a to do <strong>14 dnů</strong> od převzetí zboží.
            </p>
            <p>
                Pro odstoupení od smlouvy lze využít vzorový formulář, který je ke stažení na stránkách
                E-shopu, nebo zaslat oznámení e-mailem na{' '}
                <a href="mailto:info@hromadovky.cz">info@hromadovky.cz</a>. Odstoupení je vůči Prodávajícímu
                účinné okamžikem doručení.
            </p>
            <p>
                V případě odstoupení od smlouvy vrátí Prodávající kupujícímu všechny peněžní prostředky
                přijaté od kupujícího (včetně nákladů na nejlevnější Prodávajícím nabízený způsob dodání)
                do <strong>14 dnů</strong> od odstoupení, a to stejným způsobem, jakým je od kupujícího přijal,
                pokud se strany nedohodnou jinak.
            </p>
            <p>
                Prodávající není povinen vrátit přijaté peněžní prostředky dříve, než mu kupující zboží
                předá nebo prokáže, že zboží Prodávajícímu odeslal. Náklady spojené s vrácením zboží nese
                kupující.
            </p>
            <p>
                <strong>Odstoupení od smlouvy nelze uplatnit</strong> u zboží upraveného podle přání kupujícího
                nebo pro jeho osobu (např. <strong>personalizované sady karet</strong>) v souladu
                s § 1837 písm. d) občanského zákoníku.
            </p>

            <h2>6. Práva z vadného plnění (reklamace)</h2>
            <p>
                Práva a povinnosti smluvních stran ohledně práv z vadného plnění se řídí příslušnými obecně
                závaznými předpisy (zejména § 1914 až 1925, § 2099 až 2117 a § 2161 až 2174 občanského
                zákoníku). Postup při reklamaci a uplatnění práv z vadného plnění je upraven samostatným{' '}
                <a href="/reklamacni-rad">Reklamačním řádem</a>, který tvoří nedílnou součást těchto Podmínek.
            </p>

            <h2>7. Ochrana osobních údajů</h2>
            <p>
                Ochrana osobních údajů kupujícího je poskytována zákonem č. 110/2019 Sb., o zpracování
                osobních údajů, a Nařízením Evropského parlamentu a Rady (EU) 2016/679 (GDPR). Podrobnosti
                o zpracování osobních údajů jsou uvedeny v samostatném dokumentu{' '}
                <a href="/gdpr">Zásady zpracování osobních údajů</a>.
            </p>

            <h2>8. Mimosoudní řešení spotřebitelských sporů</h2>
            <p>
                K mimosoudnímu řešení spotřebitelských sporů z kupní smlouvy je příslušná{' '}
                <strong>Česká obchodní inspekce</strong> (ČOI), se sídlem Štěpánská 567/15, 120 00 Praha 2,
                IČO: 000 20 869, internetová adresa{' '}
                <a href="https://adr.coi.cz" target="_blank" rel="noopener noreferrer">
                    adr.coi.cz
                </a>.
            </p>
            <p>
                Platformu pro řešení sporů on-line zřízenou Evropskou komisí naleznete na adrese{' '}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                    ec.europa.eu/consumers/odr
                </a>.
            </p>

            <h2>9. Závěrečná ustanovení</h2>
            <p>
                Pokud vztah založený kupní smlouvou obsahuje mezinárodní (zahraniční) prvek, strany sjednávají,
                že vztah se řídí českým právem.
            </p>
            <p>
                Je-li některé ustanovení Podmínek neplatné nebo neúčinné, namísto neplatných ustanovení nastoupí
                ustanovení, jehož smysl se neplatnému ustanovení co nejvíce přibližuje. Neplatností jednoho ustanovení
                není dotknuta platnost ostatních ustanovení.
            </p>
            <p>
                Tyto obchodní podmínky nabývají účinnosti dne <strong>1. 1. 2026</strong>. Prodávající si vyhrazuje
                právo Podmínky kdykoli změnit; tím nejsou dotčena práva a povinnosti vzniklé po dobu účinnosti
                předchozího znění.
            </p>
        </LegalPage>
    );
};

export default TermsPage;
