import create from 'zustand';

export const browseSearchToggle = create((set) => ({
    browseSearch: 'browse',
    setSearch: () => set((state) => ({ browseSearch: 'search' })),
    setBrowse: () => set((state) => ({ browseSearch: 'browse' })),
}));
