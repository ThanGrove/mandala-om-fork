import create from 'zustand';
/*
    Current view values can be retrieved through Rail API, e.g.:
        http://places.kmaps.virginia.edu/admin/views.json
        http://subjects.kmaps.virginia.edu/admin/views.json
        http://terms.kmaps.virginia.edu/admin/views.json
 */

export const useView = create((set, get) => ({
    places: '69|roman.popular',
    subjects: '72|roman.popular',
    terms: '73|roman.scholar',
    setPlacesView: (val) => set((state) => ({ places: val })),
    setSubjectsView: (val) => set((state) => ({ subjects: val })),
    setTermsView: (val) => set((state) => ({ terms: val })),
}));
