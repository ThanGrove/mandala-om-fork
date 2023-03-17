import create from 'zustand';

/**
 *
 * Using this old hook to keep track of selected path (ndg8f, 2023-03-16)
 *
 * @type {UseStore<{places: string|*, terms: string|*, subjects: string|*, setPerspective: function(*, *=): void}>}
 */
export const useStatus = create((set, get) => ({
    item: '',
    setItem: (val) => {
        set((state) => ({ item: val }));
    },

    selPath: [],
    setSelpath: (pth) => {
        if (Array.isArray(pth)) {
            set((state) => ({ selPath: pth }));
        }
    },

    searchView: 'list',
    setSearchView: (view) => {
        if (['list', 'deck'].includes(view)) {
            set((state) => ({ searchView: view }));
        } else {
            console.error(
                'Trying to set search view to unrecognized value: ' + view
            );
        }
    },
}));
