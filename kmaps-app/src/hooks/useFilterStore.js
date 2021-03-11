import create from 'zustand';

export const useFilterStore = create((set) => ({
    filters: [],
    addFilter: (filter) =>
        set((state) => ({ filters: [...state.filters, filter] })),
    removeFilter: (filterToRemove) =>
        set((state) => ({
            filters: state.filters.filter(
                (filter) => !(filter.id === filterToRemove.id)
            ),
        })),
    clearAllFilters: () => set({ filters: [] }),
}));
