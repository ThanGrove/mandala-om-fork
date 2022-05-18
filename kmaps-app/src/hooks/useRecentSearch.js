import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useRecentSearch = create(
    persist(
        (set, get) => ({
            searches: [],
            addSearchPage: (query) => {
                const maxpages = 20;
                const searchItems = get().searches;
                // Remove searchItem if it already exists
                let filteredSearchItems = searchItems.filter(
                    (item) => item.searchText !== query.searchText
                );
                // Add query to the searchItems list
                filteredSearchItems.unshift(query);
                if (filteredSearchItems.length > maxpages) {
                    filteredSearchItems = filteredSearchItems.slice(
                        0,
                        maxpages
                    );
                }
                set((state) => ({ searches: filteredSearchItems }));
            },
            removeSearchPage: (queryText) => {
                let searchItems = get().searches;
                let filteredSearchItems = searchItems.filter(
                    (item) => item.searchText !== queryText
                );
                set((state) => ({ searches: filteredSearchItems }));
            },
            resetSearchPages: () => set({ searches: [] }),
        }),
        {
            name: 'mandala-recently-searched',
        }
    )
);
