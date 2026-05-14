import React from 'react';
import LegalPage from '../components/LegalPage';
import CookieResetButton from '../components/CookieResetButton';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';

const PrivacyPage: React.FC = () => {
    return (
        <>
        <PageHead {...SEO.privacy} />
        <LegalPage
            title="Zásady zpracování osobních údajů"
            subtitle="Informace o zpracování osobních údajů podle GDPR"
            effectiveDate="1. 1. 2026"
        >
            <div className="legal-meta">
                <strong>Správce osobních údajů:</strong>{' '}
                Karel Hromada, IČO: 76137767, bytem Zeyerova alej 20, Praha 6,
                e-mail: <a href="mailto:info@hromadovky.cz">info@hromadovky.cz</a>
                {' '}(dále jen „<strong>Správce</strong>").
            </div>

            <h2>1. Úvodní informace</h2>
            <p>
                Tyto zásady popisují, jaké osobní údaje shromažďujeme prostřednictvím e-shopu{' '}
                <strong>hromadovky.cz</strong>, k jakým účelům je používáme, na jakých právních základech
                a jaká máte v souvislosti se zpracováním práva.
            </p>
            <p>
                Zpracování probíhá v souladu s Nařízením Evropského parlamentu a Rady (EU) 2016/679 ze dne
                27. dubna 2016 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů
                (dále jen „<strong>GDPR</strong>") a se zákonem č. 110/2019 Sb., o zpracování osobních údajů.
            </p>

            <h2>2. Jaké údaje zpracováváme</h2>
            <p>V závislosti na tom, jakým způsobem s námi vstoupíte do kontaktu, zpracováváme:</p>
            <ul>
                <li><strong>Identifikační a kontaktní údaje:</strong> jméno, příjmení, doručovací adresa, fakturační adresa, e-mail, telefon;</li>
                <li><strong>Údaje o objednávce:</strong> obsah objednávky, číslo objednávky, datum a čas, zvolený způsob dopravy a platby, historii nákupů;</li>
                <li><strong>Platební údaje:</strong> informace nezbytné pro zpracování platby (platby probíhají vždy přes platební bránu — Správce nikdy neukládá údaje o platebních kartách);</li>
                <li><strong>Údaje účtu:</strong> přihlašovací jméno, heslo (uloženo v zašifrované podobě), preference;</li>
                <li><strong>Personalizační podklady:</strong> fotografie a texty, které kupující dobrovolně nahraje pro výrobu personalizovaných sad;</li>
                <li><strong>Komunikační data:</strong> obsah e-mailové či jiné komunikace s Vámi;</li>
                <li><strong>Technické údaje:</strong> IP adresa, typ prohlížeče, čas návštěvy, soubory cookies (viz bod 8).</li>
            </ul>

            <h2>3. Účely a právní základy zpracování</h2>
            <p>Vaše osobní údaje zpracováváme na následujících právních základech:</p>
            <ul>
                <li>
                    <strong>Plnění smlouvy</strong> (čl. 6 odst. 1 písm. b) GDPR) — pro vyřízení a doručení
                    objednávky, výrobu personalizovaných sad, zpracování plateb a komunikaci o stavu objednávky.
                </li>
                <li>
                    <strong>Plnění právních povinností</strong> (čl. 6 odst. 1 písm. c) GDPR) — vystavování
                    daňových dokladů, archivace účetních záznamů (zákon č. 563/1991 Sb. o účetnictví,
                    zákon č. 235/2004 Sb. o DPH).
                </li>
                <li>
                    <strong>Oprávněný zájem</strong> (čl. 6 odst. 1 písm. f) GDPR) — ochrana proti zneužití
                    e-shopu, vymáhání pohledávek, přímý marketing vlastních produktů u stávajících zákazníků.
                </li>
                <li>
                    <strong>Souhlas</strong> (čl. 6 odst. 1 písm. a) GDPR) — zasílání newsletteru a marketingových
                    sdělení osobám, které dosud nejsou zákazníky, a používání marketingových cookies.
                </li>
            </ul>

            <h2>4. Doba uchovávání údajů</h2>
            <p>Osobní údaje uchováváme pouze po dobu nezbytně nutnou:</p>
            <ul>
                <li><strong>Údaje z objednávek a fakturace</strong> — po dobu 10 let od ukončení smluvního vztahu (zákonná archivační lhůta);</li>
                <li><strong>Údaje uživatelského účtu</strong> — po dobu trvání účtu, nejdéle však 3 roky od poslední aktivity;</li>
                <li><strong>Personalizační podklady</strong> — po dobu nezbytnou pro výrobu a vyřízení reklamace, nejdéle 24 měsíců;</li>
                <li><strong>Komunikační data</strong> — 3 roky od poslední komunikace;</li>
                <li><strong>Marketingová data na základě souhlasu</strong> — do odvolání souhlasu, nejdéle 5 let.</li>
            </ul>

            <h2>5. Komu údaje předáváme</h2>
            <p>
                Vaše osobní údaje předáváme pouze v nezbytném rozsahu těmto kategoriím příjemců (zpracovatelům):
            </p>
            <ul>
                <li><strong>Přepravním společnostem</strong> — pro doručení zboží (např. Česká pošta, Zásilkovna, PPL);</li>
                <li><strong>Provozovatelům platebních bran</strong> — pro zpracování plateb;</li>
                <li><strong>Poskytovatelům IT služeb</strong> — provozovatelé hostingu, e-mailových a cloudových služeb;</li>
                <li><strong>Daňovým a účetním poradcům</strong> — v rozsahu nezbytném pro vedení účetnictví;</li>
                <li><strong>Orgánům veřejné moci</strong> — pokud to vyžaduje právní povinnost (Finanční úřad, ČOI, Policie ČR).</li>
            </ul>
            <p>
                S všemi zpracovateli máme uzavřené smlouvy o zpracování osobních údajů, které zaručují
                stejnou úroveň ochrany, jakou poskytujeme my. Údaje nikdy neprodáváme třetím stranám.
            </p>

            <h2>6. Předávání mimo EU</h2>
            <p>
                Vaše osobní údaje primárně zpracováváme v rámci Evropské unie. Pokud některý z našich
                zpracovatelů (např. provozovatel cloudových služeb) zpracovává údaje mimo EU, děje se tak
                vždy na základě standardních smluvních doložek schválených Evropskou komisí, případně
                v zemích s rozhodnutím o odpovídající úrovni ochrany.
            </p>

            <h2>7. Vaše práva</h2>
            <p>V souvislosti se zpracováním osobních údajů máte následující práva:</p>
            <ul>
                <li><strong>Právo na přístup</strong> — můžete požadovat informaci, jaké údaje o Vás zpracováváme;</li>
                <li><strong>Právo na opravu</strong> — pokud jsou údaje nesprávné nebo neúplné;</li>
                <li><strong>Právo na výmaz („právo být zapomenut")</strong> — za podmínek stanovených v čl. 17 GDPR;</li>
                <li><strong>Právo na omezení zpracování</strong> — za podmínek čl. 18 GDPR;</li>
                <li><strong>Právo na přenositelnost</strong> — obdržet své údaje ve strukturovaném, strojově čitelném formátu;</li>
                <li><strong>Právo vznést námitku</strong> — proti zpracování na základě oprávněného zájmu nebo pro účely přímého marketingu;</li>
                <li><strong>Právo odvolat souhlas</strong> — kdykoli, bez vlivu na zpracování provedené před odvoláním;</li>
                <li><strong>Právo podat stížnost</strong> u dozorového úřadu — Úřad pro ochranu osobních údajů
                    (<a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer">www.uoou.cz</a>),
                    Pplk. Sochora 27, 170 00 Praha 7.
                </li>
            </ul>
            <p>
                Svá práva můžete uplatnit písemně na adrese sídla Správce nebo e-mailem na{' '}
                <a href="mailto:info@hromadovky.cz">info@hromadovky.cz</a>. Žádost vyřídíme bez zbytečného
                odkladu, nejpozději do 30 dnů od jejího obdržení.
            </p>

            <h2>8. Cookies a analytické nástroje</h2>
            <p>
                Náš e-shop používá soubory cookies, které jsou malé textové soubory ukládané do Vašeho
                zařízení. Rozlišujeme tyto kategorie:
            </p>
            <ul>
                <li><strong>Nezbytné cookies</strong> — nutné pro fungování e-shopu (přihlášení, košík). Tyto cookies nelze odmítnout;</li>
                <li><strong>Analytické cookies</strong> — pomáhají nám pochopit, jak návštěvníci e-shop používají (např. Google Analytics);</li>
                <li><strong>Marketingové cookies</strong> — pro cílení reklamy a měření její účinnosti.</li>
            </ul>
            <p>
                Analytické a marketingové cookies používáme pouze s Vaším souhlasem, který jste nám udělili
                v cookie banneru při první návštěvě. Svůj souhlas můžete kdykoli změnit nebo odvolat
                pomocí tlačítka níže — po kliknutí se znovu zobrazí cookie banner s aktuální volbou.
            </p>

            <CookieResetButton />

            <h2>9. Zabezpečení údajů</h2>
            <p>
                Vaše osobní údaje chráníme přiměřenými technickými a organizačními opatřeními — komunikace
                je šifrována pomocí HTTPS/TLS, hesla ukládáme pouze ve formě bezpečného hashe, přístup
                k údajům mají pouze pověřené osoby.
            </p>

            <h2>10. Změny zásad</h2>
            <p>
                Tyto zásady mohou být průběžně aktualizovány. Aktuální znění je vždy dostupné na této stránce.
                O zásadních změnách informujeme registrované uživatele e-mailem.
            </p>

            <h2>11. Kontakt</h2>
            <p>
                S jakýmikoli dotazy ohledně zpracování osobních údajů se neváhejte obrátit na Správce:
                {' '}<a href="mailto:info@hromadovky.cz">info@hromadovky.cz</a>.
            </p>
        </LegalPage>
        </>
    );
};

export default PrivacyPage;
