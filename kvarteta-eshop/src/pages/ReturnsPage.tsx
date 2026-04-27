import React from 'react';
import LegalPage from '../components/LegalPage';

const ReturnsPage: React.FC = () => {
    return (
        <LegalPage
            title="Reklamační řád"
            subtitle="Postup při uplatnění práv z vadného plnění a vyřízení reklamace"
            effectiveDate="1. 1. 2026"
        >
            <div className="legal-meta">
                <strong>Provozovatel (Prodávající):</strong>{' '}
                Karel Hromada, IČO: 76137767, bytem Zeyerova alej 20, Praha 6,
                e-mail: <a href="mailto:info@hromadovky.cz">info@hromadovky.cz</a>.
            </div>

            <h2>1. Obecná ustanovení</h2>
            <p>
                Tento reklamační řád upravuje postup při uplatnění práv kupujícího z vadného plnění
                u zboží zakoupeného od Prodávajícího prostřednictvím e-shopu{' '}
                <strong>hromadovky.cz</strong> a tvoří nedílnou součást{' '}
                <a href="/obchodni-podminky">Obchodních podmínek</a>.
            </p>
            <p>
                Reklamační řád byl vypracován v souladu se zákonem č. 89/2012 Sb., občanský zákoník
                (zejména § 2161 až 2174a), a zákonem č. 634/1992 Sb., o ochraně spotřebitele.
            </p>

            <h2>2. Práva z vadného plnění</h2>
            <p>
                Prodávající odpovídá kupujícímu, že zboží při převzetí nemá vady. Zejména Prodávající
                odpovídá kupujícímu, že v době, kdy kupující zboží převzal:
            </p>
            <ul>
                <li>má zboží vlastnosti, které si strany ujednaly, nebo které Prodávající popsal;</li>
                <li>se zboží hodí k účelu, který pro jeho použití Prodávající uvádí;</li>
                <li>zboží odpovídá jakostí nebo provedením smluvenému vzorku nebo předloze;</li>
                <li>je zboží v odpovídajícím množství, míře nebo hmotnosti;</li>
                <li>zboží vyhovuje požadavkům právních předpisů.</li>
            </ul>
            <p>
                Projeví-li se vada v průběhu <strong>jednoho roku</strong> od převzetí zboží, má se za to,
                že zboží bylo vadné již při převzetí, ledaže to povaha zboží nebo vady vylučuje.
            </p>

            <h2>3. Lhůta pro uplatnění práv z vadného plnění</h2>
            <p>
                Kupující je oprávněn uplatnit právo z vady, která se vyskytne u spotřebního zboží,
                v době <strong>24 měsíců</strong> od převzetí. Toto ustanovení se nepoužije:
            </p>
            <ul>
                <li>u zboží prodávaného za nižší cenu na vadu, pro kterou byla nižší cena ujednána;</li>
                <li>na opotřebení zboží způsobené jeho obvyklým užíváním;</li>
                <li>u použitého zboží na vadu odpovídající míře používání nebo opotřebení, kterou zboží mělo při převzetí.</li>
            </ul>

            <h2>4. Co lze a nelze reklamovat</h2>
            <p>Kupující může reklamovat zejména tyto vady karet a tištěných materiálů:</p>
            <ul>
                <li>výrazné tiskové vady (nečitelnost, posun obrazu, chybějící obrazové prvky);</li>
                <li>mechanické poškození vzniklé před převzetím zboží (potrhané karty, deformace obalu);</li>
                <li>nekompletnost dodávky (chybějící karty v sadě);</li>
                <li>záměnu produktu (dodání jiné sady, než jaká byla objednána).</li>
            </ul>
            <p>Reklamace se naopak <strong>nevztahuje</strong> na:</p>
            <ul>
                <li>běžné opotřebení vzniklé hraním (otěr rohů, ztráta lesku);</li>
                <li>poškození způsobené nesprávným zacházením (polití tekutinou, ohýbání, řezání);</li>
                <li>drobné odchylky barev způsobené odlišným zobrazením na monitoru oproti tisku;</li>
                <li>vady u personalizovaných sad způsobené chybnými podklady dodanými kupujícím.</li>
            </ul>

            <h2>5. Postup při reklamaci</h2>
            <p>
                Reklamaci lze uplatnit zasláním e-mailu na{' '}
                <a href="mailto:info@hromadovky.cz">info@hromadovky.cz</a> nebo poštou na adresu sídla
                Prodávajícího uvedenou výše. Pro urychlení doporučujeme uvést:
            </p>
            <ol>
                <li>číslo objednávky nebo daňového dokladu;</li>
                <li>jméno a kontaktní údaje kupujícího;</li>
                <li>popis vady (ideálně i fotografie);</li>
                <li>preferovaný způsob vyřízení (oprava / výměna / sleva / odstoupení).</li>
            </ol>
            <p>
                Reklamované zboží zašle kupující zpět Prodávajícímu spolu s reklamačním protokolem nebo
                jiným popisem vady. Zboží by mělo být zabaleno tak, aby nedošlo k jeho dalšímu poškození
                během přepravy.
            </p>
            <p>
                <strong>Náklady na zaslání reklamovaného zboží</strong> hradí kupující. V případě uznané
                reklamace má kupující nárok na náhradu účelně vynaložených nákladů spojených s reklamací.
            </p>

            <h2>6. Vyřízení reklamace</h2>
            <p>
                Prodávající rozhodne o reklamaci spotřebitele <strong>ihned</strong>, ve složitých případech
                do tří pracovních dnů. Reklamace včetně odstranění vady musí být vyřízena bez zbytečného
                odkladu, nejpozději do <strong>30 dnů</strong> ode dne uplatnění reklamace, pokud se strany
                nedohodnou na delší lhůtě.
            </p>
            <p>
                Marným uplynutím této lhůty má kupující práva, jako by se jednalo o podstatné porušení smlouvy
                — zejména právo odstoupit od smlouvy a požadovat vrácení kupní ceny.
            </p>
            <p>
                Prodávající kupujícímu vydá písemné potvrzení o tom, kdy reklamaci uplatnil, co je jejím obsahem,
                jaký způsob vyřízení požaduje. Po vyřízení reklamace pak vydá potvrzení o datu a způsobu
                vyřízení reklamace, případně o odůvodnění zamítnutí.
            </p>

            <h2>7. Práva kupujícího při vadném plnění</h2>
            <p>Je-li vada odstranitelná, může kupující požadovat:</p>
            <ul>
                <li>bezplatné odstranění vady (opravu);</li>
                <li>nebo dodání nové věci bez vad, není-li to nepřiměřené.</li>
            </ul>
            <p>Je-li vada neodstranitelná nebo se vyskytuje opakovaně, může kupující požadovat:</p>
            <ul>
                <li>výměnu zboží;</li>
                <li>přiměřenou slevu z kupní ceny;</li>
                <li>nebo odstoupit od smlouvy a požadovat vrácení peněz.</li>
            </ul>

            <h2>8. Mimosoudní řešení sporů</h2>
            <p>
                V případě, že kupující — spotřebitel není spokojen se způsobem vyřízení reklamace, může se obrátit
                na <strong>Českou obchodní inspekci</strong> (<a href="https://adr.coi.cz" target="_blank" rel="noopener noreferrer">adr.coi.cz</a>),
                která je příslušným orgánem pro mimosoudní řešení spotřebitelských sporů.
            </p>

            <h2>9. Závěrečná ustanovení</h2>
            <p>
                Tento reklamační řád nabývá účinnosti dne <strong>1. 1. 2026</strong>. Změny reklamačního
                řádu vyhrazeny. Aktuální znění je vždy zveřejněno na stránkách E-shopu.
            </p>
        </LegalPage>
    );
};

export default ReturnsPage;
