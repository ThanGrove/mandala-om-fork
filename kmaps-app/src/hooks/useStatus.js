import create from 'zustand';

/**
 * Hook for keeping track of user choices called useStatus
 *
 * @type {UseStore<{places: string|*, terms: string|*, subjects: string|*, setPerspective: function(*, *=): void}>}
 */
export const useStatus = create((set, get) => ({
    item: '',
    setItem: (val) => {
        set((state) => ({ item: val }));
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
