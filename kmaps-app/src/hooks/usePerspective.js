import create from 'zustand';
import { getPerspective } from '../views/common/utils';

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
