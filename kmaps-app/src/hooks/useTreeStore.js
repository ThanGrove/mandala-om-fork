import create from 'zustand';

export const useTreeStore = create((set, get) => ({
    leaves: {}, // Hash of all leaves by uid
    children: {}, // Hash of children for each leave by uid

    // The leaf document is a solr doc for the kmap *plus* a parent property and uid must be set.
    addLeaf: (doc) => {
        if (!doc?.uid) {
            console.log('No uid for kmap solr doc', doc);
            return;
        }
        if (!doc?.parent) {
            console.log('No parent for kmap solr doc', doc);
            return;
        }
        const uid = doc.uid;
        const parent = doc.parent;
        const lvs = get().leaves;
        lvs[uid] = doc;
        const children = get().children;
        children[uid] = null;
        if (
            Object.keys(children).includes(parent) &&
            Array.isArray(children[uid])
        ) {
            children[parent].push(uid);
        } else {
            children[parent] = [uid];
        }
    },
    getLeaf: (uid, kid = false) => {
        const leaves = get().leaves;
        const children = get().children;
        if (kid) {
            uid = `${uid}-${kid}`;
        }
        if (Object.keys(leaves).includes(uid)) {
            let doc = leaves[uid];
            if (Object.keys(children).includes(uid)) {
                doc = { ...leaves[uid], ...{ children: children[uid] } };
            }
            return doc;
        }
        return false;
    },
    clearLeaves: () => set({ leaves: {} }),
}));
