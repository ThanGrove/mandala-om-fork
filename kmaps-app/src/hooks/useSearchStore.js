import create from 'zustand';

export const useSearchStore = create((set) => ({
    search: '',
    setSearch: (searchString) => set({ search: searchString }),
    clearSearch: () => set({ search: '' }),
}));
