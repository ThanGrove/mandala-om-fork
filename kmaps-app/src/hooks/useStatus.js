import create from 'zustand';

/**
 * Deprecated: Hook for keeping track of user choices called useStatus. Ndg8f took over component name from Ys2n,
 * which was a completely different version, but this doesn't work to save state for the embedded versions of the
 * "standalone". Jan. 2023.
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
