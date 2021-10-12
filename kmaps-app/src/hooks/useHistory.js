import create from 'zustand';

export const useHistory = create((set, get) => ({
    pages: new Set(),
    addPage: (pageicon, pgtitle, pgpath) => {
        const maxpages = 20;
        if (!pgtitle || typeof pgtitle == 'undefined' || !pgpath) {
            // document.title = 'Mandala Collections';
            return;
        }
        document.title = pgtitle + ' (Mandala Collections)';
        const related = pgpath.match(/\d+\/related/);
        if (related) {
            pgpath = pgpath.split('/related')[0];
        }
        const newpage = `${pageicon}::${pgtitle}::${pgpath}`;
        const pgs = get().pages;
        if (newpage in pgs) {
            pgs.delete(newpage);
        }
        let pglist = Array.from(pgs);
        pglist.unshift(newpage);
        if (pglist.length > maxpages) {
            pglist = pglist.slice(0, maxpages);
        }
        const newPages = new Set(pglist);
        set((state) => ({ pages: newPages }));
    },
    removePage: (itempath) => {
        let pglist = Array.from(get().pages);
        pglist = pglist.filter((pgstr) => {
            return !pgstr.includes('::' + itempath);
        });

        const newPages = new Set(pglist);
        set((state) => ({ pages: newPages }));
        return pglist;
    },
}));
