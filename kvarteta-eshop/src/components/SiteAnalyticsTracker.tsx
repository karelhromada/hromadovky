import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackSiteEvent } from '../lib/siteAnalytics';

/** Zobrazení stránky při každé změně cesty v SPA (vlastní analytika, viz lib/siteAnalytics). */
export function SiteAnalyticsTracker(): null {
    const { pathname } = useLocation();

    useEffect(() => {
        trackSiteEvent('pageview');
    }, [pathname]);

    return null;
}
