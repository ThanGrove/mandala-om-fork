import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useHistory = create(
    persist(
        (set, get) => ({
            pages: [],
            addPage: (pageicon, pgtitle, pgpath) => {
                const maxpages = 20;
                if (
                    !pgtitle ||
                    typeof pgtitle == 'undefined' ||
                    !pgpath ||
                    pgpath.trim('/') === 'home'
                ) {
                    // document.title = 'Mandala Collections';
                    return;
                }

                // Check if pgtitle is an array and if so take the first element.
                if (Array.isArray(pgtitle)) {
                    pgtitle = pgtitle[0];
                }

                document.title =
                    pgtitle?.replace(/(<([^>]+)>)/gi, '') +
                    ' (Mandala Collections)';
                const related = pgpath.match(/\d+\/related/);
                if (related) {
                    pgpath = pgpath.split('/related')[0];
                }
                const newpage = `${pageicon}::${pgtitle}::${pgpath}`;
                const pgs = get().pages;

                // Remove newpage if it already exists
                let pglist = pgs.filter((item) => item !== newpage);

                // Add newpage to the pglist array.
                pglist.unshift(newpage);
                if (pglist.length > maxpages) {
                    pglist = pglist.slice(0, maxpages);
                }

                //Remove duplicates
                pglist = [...new Set(pglist)];

                set((state) => ({ pages: pglist }));
            },
            removePage: (itempath) => {
                let pglist = get().pages;
                pglist = pglist.filter((pgstr) => {
                    return !pgstr.includes('::' + itempath);
                });
                set((state) => ({ pages: [...pglist] }));
            },
            resetPages: () => set({ pages: [] }),
        }),
        {
            name: 'mandala-recently-viewed',
        }
    )
);
