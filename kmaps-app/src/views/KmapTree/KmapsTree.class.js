/**
 * KTree: JS Class for holding tree data
 */

/*  Need to add filtering somewhere
// Show only desired root nodes
const filteredDocs = docs.filter((d, di) => {
    const kid = d.id.split('-')[1];
    // If project is set and kid is not in project, then exclude
    if (settings?.project_ids && !settings.project_ids.includes(kid)) {
        return false;
    }
    // If show ancestors and kid is not in selecte path, then exclude
    if (
        settings?.showAncestors &&
        settings?.selPath &&
        !settings.selPath.includes(kid * 1)
    ) {
        return false;
    }
    return true;
});

 */

export class KTree {
    constructor(domain, perspective, data, settings, parse = true) {
        this.id = `${domain}:${perspective}`;
        this.domain = domain;
        this.perspective = perspective;
        this.data = data;
        this.settings = settings;
        this.level_field = settings.level_field;
        this.sort_field = settings.sort_field;
        this.ancestor_field = settings.ancestor_field;
        if (!(this?.lvlfld && this?.srtfld && this?.ancfld)) {
            console.log(
                'Warning: level, sort or ancestor fields not defined in tree',
                settings
            );
        }
        this.nodes = {}; // flat associative array by kmap id to quickly find nodes
        // Data needs to be a list of first level nodes in order with arrays of childnodes
        this.trunk = []; // List of first level leaf nodes
        if (parse) {
            this.parseData(this.data); // Parse data into trunk nodes with children lists
        } else {
            this.trunk = data;
        }
    }

    parseData(data) {
        // Get levels that exist in array
        let lvls = data.map((d, di) => {
            return d[this.level_field] * 1;
        });
        lvls = Array.from(new Set(lvls)); // Remove dupolicates
        lvls.sort(function (a, b) {
            return a - b;
        });
        // Iterate through levels
        for (let n in lvls) {
            let lvl = lvls[n]; // Level number as integer
            // lvldata is list of all nodes in this level
            let lvldata = data.filter((it, iti) => {
                return it[this.level_field] === lvl;
            });
            lvldata.sort(sortBy(this.sort_field)); // sort them by sort field
            // Iterate through nodes in this level
            for (let i in lvldata) {
                let doc = lvldata[i]; // get the doc with this index (i)
                if (!doc?.uid && doc?.id) {
                    doc.uid = doc.id;
                } // normalize id to uid
                // Make sure it hasn't already been processed before
                if (!this.findNode(doc.uid)) {
                    let nd = new TreeNode(doc, this); // Create a tree node for it (see below for class)
                    // console.log("new node", nd);
                    // If first level, push onto trunk list
                    if (lvl === 1) {
                        this.trunk.push(nd);
                    } else {
                        // Otherwise look for parent and add it as child
                        if (nd?.parent) {
                            nd.parent.add(nd);
                        } else {
                            console.log('no parent', this.ancestor_field, doc);
                        }
                    }
                    this.nodes[doc.uid] = nd; // In either case add to flat node list for accessing
                } else {
                    let res = this.findNode(doc.uid);
                    console.log('Trying to create existing node', doc.uid, res);
                }
            }
        }
    }

    isNode(id) {
        return !!this.findNode(id);
    }

    findNode(id) {
        let node = false;
        if (Object.keys(this.nodes).includes(id)) {
            node = this.nodes[id];
        }
        return node;
    }
}

class TreeNode {
    constructor(doc, tree) {
        this.uid = doc?.uid;
        this.domain = tree?.domain;
        this.kid = this.uid;
        if (typeof this.uid === 'string' && this.uid.includes('-')) {
            let uidpts = this.uid.split('-');
            this.domain = uidpts[0];
            this.kid = uidpts[1];
        }
        this.doc = doc;
        this.tree = tree; // The Tree class object above, not it's property "tree"
        this.ancestor_field = false; // set in getAncestorPath below
        this.ancestor_path = this.getAncestorPath();
        this.parent = this.getParent();
        this.level = this.getLevel();
        this.hasChildren = null; // null means it hasn't been tested whether it has children yet or not (boolean)
        this.children = [];
    }

    getParent() {
        let path = this?.ancestor_path;
        const pthpts = typeof path === 'string' ? path.split('/') : path;
        if (Array.isArray(pthpts) && pthpts.length > 1) {
            let pid = pthpts[pthpts.length - 2];
            if (typeof pid !== 'string' || !pid.includes(this.domain)) {
                pid = `${this.domain}-${pid}`;
            }
            let prnt = this.tree.findNode(pid);
            return prnt;
        }
        return false;
    }

    getAncestorPath() {
        let ap = false;
        for (let n in this.tree.ancestor_field) {
            let af = this.tree.ancestor_field[n];
            if (Object.keys(this.doc).includes(af)) {
                this.ancestor_field = af;
                ap = this.doc[af];
                break;
            }
        }
        return ap;
    }

    getLevel() {
        const lvlfld = this.tree.settings.level_field;
        let lvl = this.doc[lvlfld];
        return lvl || !!lvl; // return lvl or convert undefined to boolean
    }

    add(child) {
        this.children.push(child);
        this.children.sort(sortBy(this.tree.srtfld));
        this.hasChildren = true;
    }
}

function sortBy(srtfld) {
    return function sortfunc(a, b) {
        // TODO: check if position_i is right
        if (a[srtfld] > b[srtfld]) {
            return 1;
        }
        if (b[srtfld] > a[srtfld]) {
            return -1;
        }
        return 0;
    };
}
