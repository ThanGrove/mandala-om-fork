import create from 'zustand';

/**
 * Hook for keeping track of perspectives
 *
 * @type {UseStore<{places: string|*, terms: string|*, subjects: string|*, setPerspective: function(*, *=): void}>}
 */
export const usePerspective = create((set, get) => ({
    places: getPerspective('places'),
    subjects: getPerspective('subjects'),
    terms: getPerspective('terms'),
    setPerspective: (domain, val) => {
        switch (domain) {
            case 'places':
                set((state) => ({ places: val }));
                break;
            case 'subjects':
                set((state) => ({ subjects: val }));
                break;
            case 'terms':
                set((state) => ({ terms: val }));
                break;
            default:
                console.warn(`Unknown domain, ${domain}, in setPerspective.`);
        }
    },
}));

/**
 * Function to initialize the default perspective setting for each domain. If this is a stand alone project, then
 * it may have perspective settings set as, e.g.:
 *      REACT_APP_TERMS_PERSPECTIVE=eng.alpha
 * That then becomes the default.
 *
 * @param domain
 * @returns {string|*}
 */
export function getPerspective(domain) {
    // If there are saved perspectives use those
    if (localStorage.getItem('savedPerspectives') === 'true') {
        let storedPerspectives = localStorage.getItem('userPerspectives');
        storedPerspectives = JSON.parse(storedPerspectives);
        return storedPerspectives[domain];
    }
    // Otherwise, check for environment perspectives (project filters)
    const envPerspVar = `REACT_APP_${domain.toUpperCase()}_PERSPECTIVE`;
    if (envPerspVar in process.env && process.env[envPerspVar] !== '') {
        return process.env[envPerspVar];
    } else {
        // else use defaults
        const defaultPerspectives = {
            places: 'pol.admin.hier',
            subjects: 'gen',
            terms: 'tib.alpha',
        };
        return defaultPerspectives[domain];
    }
}
