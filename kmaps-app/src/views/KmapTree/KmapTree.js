import React, { useEffect, useState } from 'react';
import { usePerspective } from '../../hooks/usePerspective';
import { PerspectiveChooser } from './KmapPerspectives';
import './KmapTree.scss';
import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { KTree, TreeNode } from './KmapsTree.class';
import TreeLeaf from './TreeLeaf';
import { useRouteMatch } from 'react-router-dom';
import { useStatus } from '../../hooks/useStatus';

export default function KmapTree(props) {
    let settings = {
        domain: false, // Default domain is places
        kid: 0, // Only used if "level" is false
        level: false, // When level is set to a number, it shows all nodes on that level (subjects and terms)
        treeClass: 'c-kmaptree',
        leafClass: 'c-kmapleaf',
        spanClass: 'c-kmapnode',
        iconClass: 'toggle-icon',
        headerClass: 'label',
        childrenClass: 'children',
        perspective: '',
        isOpen: false,
        showAncestors: false,
        showRelatedPlaces: false,
        elid: 'kmap-tree-',
        pgsize: 200,
        project_ids: false,
        noRootLinks: false,
        selectedNode: 0, // Kmap ID number of selected node (without domain)
        selPath: [],
    };
    settings = { ...settings, ...props }; // Merge default settings with instance settings giving preference to latter
    const match = useRouteMatch([
        '/:baseType/:id/related-:type/:definitionID/view/:relID',
        '/:baseType/:id/related-:type/:definitionID/:viewMode',
        '/:baseType/:id/related-:type',
        '/:baseType/:id',
    ]);
    settings.selectedNode = match.params.id;
    const uniqueTreeID = `${settings.domain}:${settings.perspective}`;
    settings.elid += uniqueTreeID;
    const perspective = usePerspective((state) => state[settings.domain]);
    settings.perspective = perspective;
    settings.ancestor_field = [
        `ancestor_ids_${settings.perspective}`,
        'ancestor_ids_generic',
    ]; // this works for Places, TODO: check for subjects and terms

    settings.level_field = `level_${settings.perspective}_i`;
    settings.sort_field = `header`; // places and subjects
    if (settings.domain === 'terms') {
        settings.sort_field = 'position_i';
    }
    settings.treeClass += ` ${settings.domain} ${settings.perspective}`;

    // Remove domain and dash from selectedNode value (get just the number from e.g. "places-1234")
    /*
    if (
        typeof settings?.selectedNode === 'string' &&
        settings?.selectedNode?.includes('-')
    ) {
        settings.selectedNode = settings.selectedNode.split('-')[1];
    }*/

    // Set root information for this tree so they can be passed to each leaf
    settings['root'] = {
        domain: settings?.domain,
        kid: settings?.kid,
        level: settings?.level,
        perspective: perspective,
    };
    // const isSelNode = settings?.selectedNode;

    const [ktree, setKtree] = useState(null);

    //let ktree = null;
    let qval = `${settings.level_field}:[1 TO 2]`;
    let selkid = null;
    /*if (isSelNode) {
        selkid = `${settings.domain}-${settings.selectedNode}`;
        qval += ` OR uid:${selkid} OR ${settings.ancestor_field}:${settings.selectedNode}`;
    }*/
    const treebasequery = {
        index: 'terms',
        params: {
            q: qval,
            fq: `tree:${settings.domain}`,
            rows: 5000,
            fl: '*',
        },
    };

    const {
        isLoading: isTreeLoading,
        data: treeData,
        isError: isTreeError,
        error: treeError,
    } = useSolr(
        ['tree', settings?.domain, settings?.perspective, selkid],
        treebasequery
    );

    useEffect(() => {
        if (treeData?.docs) {
            let nkt = new KTree(
                settings.domain,
                settings.perspective,
                treeData.docs,
                settings
            );
            setKtree(nkt);
        }
    }, [treeData]);

    //  console.log("sel node", selNode);
    if (isTreeLoading) {
        return <MandalaSkeleton />;
    }

    /*
    if (ktree) {
        let snd = ktree.findNode(selkid);
        if (snd) {
            settings.selPath = snd.ancestor_path;
        }
        setTimeout(function () {
            scrollToSel(ktree);
        }, 2000);
    }

     */

    // return <p>Successfull query: [{treeData?.numFound}]</p>;

    return (
        <div id={settings.elid} className={settings.treeClass}>
            <PerspectiveChooser
                domain={settings.domain}
                current={perspective}
            />
            {ktree?.trunk?.map((nd, ni) => {
                const tlkey = `treeleaf-${nd.uid}-${ni}`;
                return (
                    <TreeLeaf key={tlkey} node={nd} isOpen={settings.isOpen} />
                );
            })}
        </div>
    );
}

function LoadSelected({ tree }) {
    const setSelpath = useStatus((state) => state.setSelpath);
    const match = useRouteMatch([
        '/:baseType/:id/related-:type/:definitionID/view/:relID',
        '/:baseType/:id/related-:type/:definitionID/:viewMode',
        '/:baseType/:id/related-:type',
        '/:baseType/:id',
    ]);
    const uid = `${match.params.baseType}-${match.params.id}`;
    const selquery = {
        index: 'terms',
        params: {
            q: `uid:${uid}`,
            fq: `tree:${tree?.domain}`,
            rows: 5000,
            fl: '*',
        },
    };

    const bypass = !tree || !match;

    const {
        isLoading: isSelLoading,
        data: selData,
        isError: isSelError,
        error: treeError,
    } = useSolr(['tree', tree?.id, uid], selquery, bypass);

    if (!bypass && !isSelLoading && !isSelError) {
        if (selData?.numFound > 0) {
            let leaf = new TreeNode(selData.docs[0], tree);
            if (leaf?.ancestor_path) {
                setSelpath(leaf.ancestor_path);
            }
        }
    }

    return null;
}

function scrollToSel(tree) {
    console.log('Scroll to sel');
    const selnode = tree.getSelectedNode();
    if (selnode) {
        const tree_el = document.getElementById(tree.settings.elid);
        const sel_el = document.getElementById(`leaf-${selnode.uid}`);
        if (tree_el && sel_el) {
            window.scroll(0, 0);
            tree_el.scroll(0, sel_el.offsetTop - 200);
        }
    }
}
