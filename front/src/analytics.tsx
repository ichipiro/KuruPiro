const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
    interface Window {
        dataLayer?: any[];
        gtag?: (...args: any[]) => void;
    }
}

const SCRIPT_ID = 'ga-gtag-script';

export const initGA = (measurementId = GA_MEASUREMENT_ID) => {
    if (typeof window === 'undefined') return;
    if (!measurementId) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.id = SCRIPT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){
        window.dataLayer!.push(arguments);
    } as any;
    window.gtag?.('js', new Date());
    // disable automatic page view so we can control page views on route changes
    window.gtag?.('config', measurementId, { send_page_view: false });
};

export const logPageView = (path = window.location.pathname + window.location.search) => {
    if (typeof window === 'undefined') return;
    if (!window.gtag) return;
    window.gtag('event', 'page_view', { page_path: path });
};
