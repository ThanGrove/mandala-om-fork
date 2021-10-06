import create from 'zustand';
/*
    Current view values can be retrieved through Rail API, e.g.:
        http://places.kmaps.virginia.edu/admin/views.json
        http://subjects.kmaps.virginia.edu/admin/views.json
        http://terms.kmaps.virginia.edu/admin/views.json
 */

export const useView = create((set, get) => ({
    places: getStoredSetting('places'),
    subjects: getStoredSetting('subjects'),
    terms: getStoredSetting('terms'),
    setPlacesView: (val) => set((state) => ({ places: val })),
    setSubjectsView: (val) => set((state) => ({ subjects: val })),
    setTermsView: (val) => set((state) => ({ terms: val })),
}));

export function getStoredSetting(domain) {
    const envViewVar = `REACT_APP_${domain.toUpperCase()}_VIEW`;
    if (envViewVar in process.env && process.env[envViewVar] !== '') {
        return process.env[envViewVar];
    }
    if (localStorage.getItem('savedViewSettings') === 'true') {
        const mysettings = JSON.parse(localStorage.getItem('userViewSettings'));
        return mysettings[domain];
    }
    switch (domain) {
        case 'places':
            return '69|roman.popular';
        case 'subjects':
            return '72|roman.popular';
        case 'terms':
            return '73|roman.scholar';
    }
}

export function getViewLanguageClass(viewcode) {
    if (viewcode.includes('.chi')) {
        return 'zh';
    } else if (viewcode.includes('.tib')) {
        return 'bo';
    } else if (viewcode.includes('deva')) {
        return 'ne';
    }
}
