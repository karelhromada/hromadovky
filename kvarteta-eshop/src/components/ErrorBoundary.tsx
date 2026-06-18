import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

/**
 * Globální záchytná síť pro chyby při renderu a při načítání lazy stránek.
 *
 * Bez ní jakákoli výjimka v komponentě (např. chybějící ENV v config/payment, nebo
 * zastaralý JS chunk po deployi, který už na serveru neexistuje) shodí celý React strom
 * a uživatel uvidí jen bílou stránku. Zde místo toho ukážeme srozumitelnou hlášku
 * a možnost stránku obnovit.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        // Detail zalogujeme pro diagnostiku (konzole prohlížeče / případný monitoring).
        console.error('Zachycena chyba v ErrorBoundary:', error, info.componentStack);
    }

    private handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (!this.state.hasError) return this.props.children;

        return (
            <div
                role="alert"
                style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            >
                <div className="glass-panel" style={{ maxWidth: 480, textAlign: 'center', padding: '2rem', borderRadius: 16 }}>
                    <h2 style={{ marginTop: 0 }}>Omlouváme se, něco se pokazilo</h2>
                    <p style={{ opacity: 0.8 }}>
                        Stránku se nepodařilo načíst. Zkuste ji prosím obnovit. Pokud potíže přetrvávají,
                        ozvěte se nám a objednávku rádi vyřídíme.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                        <button className="btn-primary" onClick={this.handleReload}>Obnovit stránku</button>
                        <a className="btn-secondary" href="/">Zpět do obchodu</a>
                    </div>
                </div>
            </div>
        );
    }
}
