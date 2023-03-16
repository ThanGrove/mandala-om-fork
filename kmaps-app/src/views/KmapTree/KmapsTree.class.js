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

import jsonpAdapter from '../../logic/axios-jsonp';
import axios from 'axios';
import { getSolrUrls } from '../../hooks/utils';
import { useRouteMatch } from 'react-router-dom';

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
        this.selectedNode = settings.selectedNode;
        this.selPath = [];
        getSelNode(this).then((sp) => (this.selPath = sp));
        if (!(this?.level_field && this?.sort_field && this?.ancestor_field)) {
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
                        let parent = nd?.getParent();
                        if (parent) {
                            parent.add(nd);
                        }
                    }
                    this.nodes[doc.uid] = nd; // In either case add to flat node list for accessing
                }
            }
        }
    }

    isNode(id) {
        return !!this.findNode(id);
    }

    getSelectedNode() {
        const sid = `${this.domain}-${this.selectedNode}`;
        const snd = this.findNode(sid);
        if (snd) {
            return snd;
        }
        return false;
    }

    getUid(id) {
        return `${this.domain}-${id}`;
    }

    /**
     * Can take either a real uid (domain-id) or just a numeric id and it will add the tree's domain
     * @param uid
     * @returns {boolean}
     */
    findNode(uid) {
        if (!isNaN(uid)) {
            uid = this.getUid(uid);
        }
        let node = false;
        if (Object.keys(this.nodes).includes(uid)) {
            node = this.nodes[uid];
        }
        return node;
    }

    setChildren(childdata) {
        const ids = Object.keys(childdata);
        ids.forEach((id, idi) => {
            let cuid = `${this.domain}-${id}`;
            let parent = this.findNode(cuid);
            if (parent) {
                parent.hasChildren = true;
            }
        });
    }
}

export class TreeNode {
    constructor(doc, tree) {
        this.uid = doc?.uid;
        this.domain = tree?.domain;
        this.kid = this.uid;
        if (typeof this.uid === 'string' && this.uid.includes('-')) {
            let uidpts = this.uid.split('-');
            this.domain = uidpts[0];
            this.kid = uidpts[1];
        }
        if (!isNaN(this.kid * 1)) {
            this.kid = this.kid * 1;
        }
        this.doc = doc;
        this.tree = tree; // The Tree class object above, not it's property "tree"
        this.ancestor_field = false; // set in getAncestorPath below
        this.ancestor_path = this.getAncestorPath();
        this.level = this.getLevel();
        this.hasChildren = null; // null means it hasn't been tested whether it has children yet or not (boolean)
        this.children = [];
        this.sorted = false;
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

    getChildren() {
        if (!this.sorted) {
            this.children.sort(sortBy(this.tree.settings.sort_field));
            this.sorted = true;
        }
        return this.children;
    }

    getLevel() {
        const lvlfld = this.tree.settings.level_field;
        let lvl = this.doc[lvlfld];
        return lvl || !!lvl; // return lvl or convert undefined to boolean
    }

    isSelNode() {
        return this.kid * 1 === this.tree.settings.selectedNode * 1;
    }

    isSelParent() {
        return (
            this.tree.selPath.indexOf(this.kid) === this.tree.selPath.length - 2
        );
    }

    add(child) {
        if (!this.children?.includes(child)) {
            this.children.push(child);
            this.children.sort(sortBy(this.tree.sort_field));
            this.hasChildren = true;
        }
    }

    sortChildren() {
        this.children.sort(sortBy(this.tree.sort_field));
    }
}

function sortBy(srtfld) {
    return function sortfunc(a, b) {
        let sa = a?.doc ? a.doc : a;
        let sb = b?.doc ? b.doc : b;
        if (sa[srtfld] > sb[srtfld]) {
            return 1;
        }
        if (sb[srtfld] > sa[srtfld]) {
            return -1;
        }
        return 0;
    };
}

async function getSelNode(tree) {
    const solrurls = getSolrUrls();
    const ancfield = tree.ancestor_field[0];
    const qry = `uid:${tree.domain}-${tree?.selectedNode}`;
    // Make request
    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: solrurls['terms'],
        params: { q: qry, fl: ['uid', ancfield], wt: 'json' },
    };
    const { data } = await axios.request(request);
    let retdata = data && data.response?.docs ? data.response.docs : data;
    if (retdata && retdata?.length > 0 && Array.isArray(retdata[0][ancfield])) {
        return retdata[0][ancfield];
    }
}
