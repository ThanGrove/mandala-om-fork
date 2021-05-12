import React, { useEffect, useState } from 'react';
import './KmapTree.scss';
import { useKmap } from '../../hooks/useKmap';
import { getPerspective, getProject, queryID } from '../common/utils';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { Container, Row, Col } from 'react-bootstrap';
import { useSolr } from '../../hooks/useSolr';
import $ from 'jquery';
import {
    getPerspectiveRoot,
    KmapPerpsectiveData,
    PerspectiveChooser,
} from './KmapPerspectives';
import FilterTree from './FilterTree';
import LeafGroup from './LeafGroup';
import TreeLeaf from './TreeLeaf';

/**
 * Kmap Tree: React Version of Kmaps Fancy Tree. Tree initializing function. Can pass any of the props listed in settings, but two basic modes;
 *      - Load a single kmaps as a tree root. Takes `domain` and `kid`.
 *      - Load a group of kmap nodes at the same level_i (e.g. subjects and possibly terms). Takes `domain` and `level`.
 *      - Leaves/Nodes with children are expandable with a plus/minus icon. Terminal nodes have a dash.
 *      - Each leaf header is linked to the page that displays it
 *      - Each leaf header is decorated to the right with a Mandala Popover for the Kmap
 *
 *  When loading a single tree root, it displays a TreeLeaf component (opened or closed depending on the value of isOpen).
 *  When loading a group of nodes at the same level, like subjects, it displays a LeafGroup component.
 *
 *  The major KmapTree settings are:
 *      domain: required either places, subjects, or terms (default: places)
 *      kid: optional, if given then used with domain to set the root of the tree (default: 0)
 *      perspective: optional, the perspective id for that domain's tree (default: uses the util.js function getPerspective(domain) to get the default perspective for that domain)
 *      level: optional, if given, shows all nodes at that level of the tree (default: false)
 *      isOpen: whether the root node should be open or not (default: false)
 *      showAncestors: whether to show the ancestors of the root node (default: false)
 *      showRelatedPlaces: whether to show the related places of the root node (default: false)
 *      elid: the element ID for the tree div (default: kmap-tree-{random hash})
 *      selectedNode: the kmap numeric ID (without domain) of the selected node (default: 0)
 *      noRootLinks: if true, will not link or show mandala popover for the root nodes (used in Terms)
 *
 *      There are also various class settings for tree, leaf, span, icon, header, and children
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function KmapTree(props) {
    // random id code from: https://stackoverflow.com/questions/3231459/create-unique-id-with-javascript/3231532
    const randomid =
        Date.now().toString(36) + Math.random().toString(36).substr(2);
    let settings = {
        domain: 'places', // Default domain is places
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
        elid: 'kmap-tree-' + randomid,
        pgsize: 200,
        project_ids: false,
        noRootLinks: false,
        selectedNode: 0, // Kmap ID number of selected node (without domain)
        selPath: [],
    };
    settings = { ...settings, ...props }; // Merge default settings with instance settings giving preference to latter

    // Remove domain and dash from selectedNode value
    if (
        typeof settings?.selectedNode === 'string' &&
        settings?.selectedNode?.includes('-')
    ) {
        settings.selectedNode = settings.selectedNode.split('-')[1];
    }

    // Default perspective from function in utils.js
    if (!settings?.perspective) {
        settings.perspective = getPerspective(settings.domain);
    }

    if (settings.kid === 0 && !settings.level) {
        settings.level = 1;
    }
    // Set root information for this tree so they can be passed to each leaf
    settings['root'] = {
        domain: settings?.domain,
        kid: settings?.kid,
        level: settings?.level,
        perspective: settings?.perspective,
    };

    // useState Calls for Perspectives
    const [rootkid, setRoot] = useState(settings.root?.kid); // Needed to make tree reload on perspective change
    const [perspective, setPerspective] = useState(settings.perspective); // Needed to pass to perspective chooser

    // useQuery to Load selected node (if no node selected selectedNode is 0 and it loads nothing)
    const kmapId = queryID(settings.domain, settings.selectedNode);
    const {
        isLoading: isSelNodeLoading,
        data: selNode,
        isError: isSelNodeError,
        error: selNodeErrror,
    } = useKmap(kmapId, 'info');

    // useQuery to load related places selected node (Monasteries, etc.) (if not a related child nothing loads)
    const selNodeQuery = {
        index: 'terms',
        params: {
            q: '{!parent which=block_type:parent}related_uid_s:' + kmapId,
            fl: `uid,header,[child parentFilter=block_type:parent childFilter=related_uid_s:${kmapId}]`,
            start: 0,
            rows: 1,
            wt: 'json',
        },
    };
    const {
        isLoading: isRelSelNodeLoading,
        data: relSelNode,
        isError: isRelSelNodeError,
        error: relSelNodeErrror,
    } = useSolr(`${kmapId}-relsel`, selNodeQuery);

    // Use Effect: To open selected node in tree, if not already open (for parallel trees)
    useEffect(() => {
        if (
            !isSelNodeLoading &&
            !isRelSelNodeLoading &&
            (selNode || relSelNode) &&
            settings?.selPath &&
            settings?.selPath?.length > 0
        ) {
            openToSel(settings);
        }
    }, [selNode, relSelNode]);

    // useEffect to Set level or root based on Perspective
    useEffect(() => {
        settings.perspective = perspective;
        settings.root.perspective = perspective;
        const newroot = getPerspectiveRoot(
            settings.perspective,
            settings.domain
        );
        if (newroot) {
            settings.kid = settings.root.kid = newroot * 1;
        } else {
            settings.root.kid = perspective; // To trigger redraw of tree
        }
        setRoot(settings.root.kid);
    }, [perspective]);

    // Don't load the tree until we have selected node path info to drill down with
    if (isSelNodeLoading && isRelSelNodeLoading) {
        return <MandalaSkeleton />;
        // If Selected Node ID is a parent Solr doc, and has list of ancestor IDs for the perpsective, use that
    } else if (selNode && [`ancestor_ids_${settings.perspective}`] in selNode) {
        settings.selPath = selNode[`ancestor_ids_${settings.perspective}`];
        // Otherwise if it has list of ancestor ids closest to that perspective, use that
    } else if (
        selNode &&
        [`ancestor_ids_closest_${settings.perspective}`] in selNode
    ) {
        // When sel node is in closest ancestor ID path
        settings.selPath =
            selNode[`ancestor_ids_closest_${settings.perspective}`];
        const snind = settings.selPath.indexOf(settings.selectedNode * 1);
        if (snind > -1) {
            settings.selPath.splice(snind, 1);
        }
        // Otherwise, check if it's a related place child and if so, use its relapte_places_path_s, dropping the last item (itself)
    } else if (relSelNode?.docs?.length > 0) {
        // When there is no selNode but there is a relSel
        const relpath =
            relSelNode.docs[0]['_childDocuments_'][0]['related_places_path_s'];
        if (relpath && typeof relpath === 'string') {
            const splitpath = relpath.split('/').map((item) => {
                return item * 1;
            });
            splitpath.pop();
            if (splitpath.length > 0) {
                settings.selPath = splitpath;
            }
        }
    }

    // Assign an element (div) id for tree if not given in settings
    if (!settings?.elid) {
        const rndid = Math.floor(Math.random() * 999) + 1;
        settings['elid'] = `${settings.domain}-tree-${rndid}`;
    }

    // If the project attribute is set, call create a filtered tree
    if (settings?.project?.length > 0) {
        return <FilterTree settings={settings} />;
    }

    // Otherwise, create the tree dive with a LeafGroup (when there are many root nodes, e.g. subjects and terms) or a single root leaf (places)
    let treeclass = `${settings.treeClass} ${settings.root.domain}`;
    if (props?.className) {
        treeclass += ` ${props.className}`;
    }
    let perspChooser = null;
    if (
        settings.domain in KmapPerpsectiveData &&
        KmapPerpsectiveData[settings.domain]?.length > 1
    ) {
        perspChooser = (
            <PerspectiveChooser
                domain={settings.domain}
                current={perspective}
                setter={setPerspective}
            />
        );
    }

    return (
        <div id={settings.elid} className={treeclass}>
            {perspChooser}
            {settings.level && (
                <LeafGroup
                    domain={settings.root.domain}
                    level={settings.level}
                    settings={settings}
                    isopen={settings.isOpen}
                    perspective={perspective}
                    newperspective={rootkid}
                />
            )}
            {!settings.level && (
                <TreeLeaf
                    domain={settings.root.domain}
                    kid={rootkid}
                    leaf_level={0}
                    settings={settings}
                    isopen={settings.isOpen}
                    showAncestors={settings.showAncestors}
                    perspective={perspective}
                />
            )}
        </div>
    );
}

/**
 * Opens to the selected node using the settings.selPath attribute
 * Selected Node is loaded at the beginning of KmapTree and its path is used to set the selPath
 * It performs a loop taking the last ID from the selpath and searching for it
 * It creates a jQuery selector (using selectorBase plus the node ID) and
 * If that element exists it clicks on it. It does this until the last element in the selPath is found.
 *
 * @param settings
 */
function openToSel(settings) {
    let ct = 1;
    let lastId = settings.selPath[settings.selPath.length - ct];
    // Selector base includes Tree el id and match to a c-kmapnode data-id attribute with the kmap id
    const selectorBase =
        '#' +
        settings.elid +
        ' .c-kmapnode[data-id=' +
        settings.domain +
        '-__ID__]';
    let lastElSelector = selectorBase.replace('__ID__', lastId);
    let lastEl = $(lastElSelector);
    while (lastEl.length === 0 && ct <= settings.selPath.length) {
        ct++;
        lastId = settings.selPath[settings.selPath.length - ct];
        lastElSelector = selectorBase.replace('__ID__', lastId);
        lastEl = $(lastElSelector);
        if (lastEl.length > 0) {
            $('#' + settings.elid).addClass('clicked');
            lastEl.find('.toggle-icon').click();
            break;
        }
    }
}
