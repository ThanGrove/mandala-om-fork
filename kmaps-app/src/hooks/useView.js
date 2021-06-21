import create from 'zustand';

export const useView = create((set, get) => ({
    places: '69|roman.popular',
    subjects: '72|roman.popular',
    terms: '73|roman.scholar',
    setPlacesView: (val) => set((state) => ({ places: val })),
    setSubjectsView: (val) => set((state) => ({ subjects: val })),
    setTermsView: (val) => set((state) => ({ terms: val })),
}));
