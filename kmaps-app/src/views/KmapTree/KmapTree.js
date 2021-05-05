import React, { useEffect, useState } from 'react';
import './kmapTree.scss';
import { useKmap } from '../../hooks/useKmap';
import { getPerspective, getProject, queryID } from '../common/utils';
import MandalaSkeleton from '../common/MandalaSkeleton';
import {
    faHome,
    faPlusCircle,
    faMinusCircle,
    faAmbulance,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MandalaPopover } from '../common/MandalaPopover';
import { Container, Row, Col } from 'react-bootstrap';
import { useSolr } from '../../hooks/useSolr';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import { KmapPerpsectiveData } from './KmapPerspectives';

/**
 * This file contains several components used for creating a KMap Tree. Most of them are internal.
 * The default export is KmapTree which is the one used to create the various versions based on its settings.
 * The other components here are either versions of the tree or children used in the tree. They are:
 *     FilterTree: A tree filtered by project (projects_ss value in Solr doc)
 *     LeafGroup: The initial component for Subjects and Terms trees that have multiple top-level roots
 *     LeafChildren: A component containing the children of a leaf node, only added when the node is "opened" to implement lazy loading
 *     RelatedChildren: A variant of LeafChildren, that only shows related places from the list of child documents
 *     TreeLeaf: A basic leaf node in any tree. Keeps state on whether open or closed and added LeafChilden if open.
 * Also includes two functions "openToSel()" and "updateTreeScroll()" for scrolling to selected node
 */

/*
Test element to show all 3 types of trees on a page. Used currently in ContentMain for testing. remove when done.
 */
export function TreeTest(props) {
    return (
        <Container className="tree-test">
            <Row>
                <Col sm={4}>
                    <KmapTree
                        domain="places"
                        elid="places-tree-1"
                        isOpen={true}
                        project={getProject()}
                    />
                </Col>
                <Col sm={4}>
                    <KmapTree
                        domain="subjects"
                        level="1"
                        elid="subjects-tree-1"
                        project={getProject()}
                    />
                </Col>
                <Col sm={4}>
                    <KmapTree
                        domain="terms"
                        level="1"
                        elid="terms-tree-1"
                        perspective="tib.alpha"
                        noRootLinks={true}
                    />
                </Col>
            </Row>
            {/*
            <Row>
                <Col sm={4}>
                    <KmapTree
                        domain="places"
                        elid="places-tree-2"
                        isOpen={true}
                    />
                </Col>
                <Col sm={4}>
                    <KmapTree
                        domain="subjects"
                        level="1"
                        elid="subjects-tree-2"
                    />
                </Col>
                <Col sm={4}>
                     Adding another terms tree interferes with filtered one. TODO: figure out why!
                    <KmapTree
                        domain="terms"
                        level="1"
                        elid="terms-tree-2"
                        perspective="tib.alpha"
                        noRootLinks={true}
                    />
                </Col>
            </Row>
                    */}
        </Container>
    );
}

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

    // Fill in defaults for places
    if (settings.domain === 'places') {
        if (settings.kid === 0 && !settings?.level) {
            settings.kid = 13735; // Root node is earth
        }
    }

    // Fill in defaults for subjects
    if (settings.domain === 'subjects') {
        if (settings.kid === 0 && !settings?.level) {
            settings.level = 1; // Root level is 1
        }
    }

    // Fill in defaults for terms
    if (settings.domain === 'terms') {
        if (settings.kid === 0 && !settings?.level) {
            settings.level = 1; // Root level is 1
        }
    }

    // Set root domain for this tree
    settings['root'] = {
        domain: settings.domain,
        kid: settings.kid,
        level: settings.level,
    };

    // Load selected node (if no node selected selectedNode is 0 and it loads nothing)
    const kmapId = queryID(settings.domain, settings.selectedNode);
    const {
        isLoading: isSelNodeLoading,
        data: selNode,
        isError: isSelNodeError,
        error: selNodeErrror,
    } = useKmap(kmapId, 'info');

    // Load related places selected node (Monasteries, etc.) (if not a related child nothing loads)
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

    /** Use Effect: To open selected node in tree, if not already open (for parallel trees) **/
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
                current={settings.perspective}
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
                />
            )}
            {!settings.level && (
                <TreeLeaf
                    domain={settings.root.domain}
                    kid={settings.root.kid}
                    leaf_level={0}
                    settings={settings}
                    isopen={settings.isOpen}
                    showAncestors={settings.showAncestors}
                />
            )}
        </div>
    );
}

/**
 * Filter Tree: is a tree filtered by a project id (projects_ss) which is set in the .env files.
 * It initially does a search for all docs that have that id and facets on the ancestor_ids for that perspective.
 * This list of IDs is then added to the tree settings under project_ids attribute.
 * There is an automatic check in the LeafChildren component that will display all children if the project_ids list is empty
 * But if list has any length, then it will only show children if they occur in the list.
 * By faceting on ancestors, it gets necessary ancestor nodes that may not be tagged with that projects_ss ID.
 *
 * This takes the settings from the filter tree plus any other props given to the React Component (just in case)
 * The settings must have the project attribute set.
 *
 * @param settings
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function FilterTree({ settings, ...props }) {
    const projid = settings?.project;
    const persp = settings.perspective;
    // const persp_lvl = `level_${persp}_i`;
    const ancestor_facet = `ancestor_ids_${persp}`;
    const level = settings.level;

    const query = {
        index: 'terms',
        params: {
            q: `tree:${settings.domain} AND projects_ss:${projid}`,
            rows: 10000,
            fl: 'id, header, ancestor_id_gen',
            facet: true,
            'facet.limit': -1,
            'facet.mincount': 1,
            'facet.field': ancestor_facet,
        },
    };
    // console.log('query', query);
    const {
        isLoading: isAncestorsLoading,
        data: ancestorsData,
        isError: isAncestorsError,
        error: ancestorsError,
    } = useSolr(`filter-tree-${projid}-${settings.domain}-${persp}`, query);
    if (isAncestorsLoading) {
        return (
            <div className="filter-tree">
                <MandalaSkeleton />
            </div>
        );
    }
    if (!projid) {
        return (
            <div className="filter-tree">
                <p>Cannot load filter tree without project ID setting!</p>
            </div>
        );
    }

    // console.log('Filter anc data', ancestorsData);
    settings['project_ids'] =
        ancestorsData?.facets && ancestorsData.facets[ancestor_facet]
            ? Object.keys(ancestorsData.facets[ancestor_facet])
            : [];
    const treeclass = `${settings.treeClass} ${settings.root.domain}`;
    const tree =
        settings.domain === 'places' ? (
            <TreeLeaf
                domain={settings.root.domain}
                kid={settings.root.kid}
                leaf_level={0}
                settings={settings}
                isopen={settings.isOpen}
                showAncestors={settings.showAncestors}
            />
        ) : (
            <LeafGroup
                domain={settings.domain}
                level={level}
                settings={settings}
            />
        );
    return (
        <div id={settings.elid} className={treeclass}>
            {tree}
        </div>
    );
}

/**
 * A group of tree nodes/leaves at the same level, as in Subjects or Terms
 * This serves in the place of a single root node.
 * For groups of nodes that are children of another node, the LeafChildren component is used
 *
 * @param domain : the domain of the treee
 * @param level : the level of nodes to display in a group
 * @param settings : the rest of the KmapTree settings as defined above
 * @param isopen : whether the root nodes should be open (has not been tested)
 * @constructor
 */
function LeafGroup({ domain, level, settings, isopen }) {
    const qid = `leaf-group-${domain}-${level}`;
    const persp_lvl = `level_${settings.perspective}_i`;
    const noRootLinks = settings.noRootLinks;
    const query = {
        index: 'terms',
        params: {
            q: `tree:${domain} AND ${persp_lvl}:${level}`,
            rows: 4000,
            fl: '*',
        },
    };
    if (domain === 'terms') {
        // Terms can be sorted in Solr response with position_i
        query.params['sort'] = 'position_i asc';
    }
    //console.log('LeafGroup settings', settings);
    const {
        isLoading: isGroupLoading,
        data: groupData,
        isError: isGroupError,
        error: groupError,
    } = useSolr(qid, query);

    if (isGroupLoading) {
        return <MandalaSkeleton />;
    }
    // console.log('Group Data', groupData, groupError);
    let resdocs = !isGroupError && groupData?.docs ? groupData.docs : [];
    /*let facets = (groupData['facets'][facet_fld]) ? groupData['facets'][facet_fld] : [];
    resdocs = resdocs.filter((doc) => {
        return (doc[persp_lvl] == level);
    });*/

    if (domain !== 'terms') {
        resdocs.sort((a, b) => {
            if (a.header > b.header) {
                return 1;
            }
            if (a.header < b.header) {
                return -1;
            }
            return 0;
        });
    }
    // console.log("resdocs", resdocs);
    return (
        <>
            {resdocs.map((doc, i) => {
                const tlkey = `treeleaf-${doc.id}-${i}`;
                const kid = doc.id.split('-')[1];
                if (
                    !settings?.project_ids ||
                    settings.project_ids.includes(kid)
                ) {
                    return (
                        <TreeLeaf
                            key={tlkey}
                            domain={doc.tree}
                            kid={kid}
                            leaf_level={0}
                            nolink={noRootLinks}
                            settings={settings}
                        />
                    );
                } /*else {
                    console.log('not included', kid, settings.project_ids);
                }*/
            })}
        </>
    );
}

/**
 * A Single Leaf Node from which other may descend with a toggle icon if it has children or dash if not
 * Depending on the isopen setting in props it is open or closed (if it has children)
 * When closed it contains an empty child div. When opened, it displays a LeafChildren component.
 * It does a query for number of children to determine the icon to display, whether toggle-able
 * A useEffect() hook sets and scrolls to the selected node once the tree is loaded
 *
 * If it is a root node and the props.showAncestors is true, then it takes the ancestor_id_path and
 * displays the highest node from it. It removes that id from the path, displays the leaf of that highest node,
 * but it sets the treePath to the truncated ancestor_id_path. When treePath is set, this TreeLeaf component
 * will display only the highest TreeLeaf on that path using a further truncated ancestor_id_path.
 * This iterates through the ancestors until the designated root node is displayed at which point
 * the treePath will be empty and it will display as a regular node
 *
 * If prop.showRelatedPlaces is set to true, it will display a single level of children that are all the
 * related places to the root node.
 *
 * @param domain
 * @param kid
 * @param level
 * @param settings
 * @param isopen
 * @returns {JSX.Element|null}
 * @constructor
 */
function TreeLeaf({ domain, kid, leaf_level, settings, ...props }) {
    let io = props?.isopen ? props.isopen : false;
    if (settings?.selPath && settings.selPath.length > 0) {
        if (settings.selPath.includes(kid * 1)) {
            io = true;
        }
    }
    const leafRef = React.createRef();
    const [isOpen, setIsOpen] = useState(io);
    const {
        isLoading: isKmapLoading,
        data: kmapdata,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(domain, kid), 'info');

    // Query for number of children (numFound for 0 rows. This query is passed to LeafChildren to be reused).
    const qid = `leaf-children-${domain}-${kid}-count`; // Id for query for caching
    // variable to query for paths that contain this node's path
    const path_fld = `ancestor_id_${settings.perspective}_path`;
    const pathqry = isKmapLoading
        ? 'path:none'
        : `${path_fld}:${kmapdata[path_fld]}/*`;
    // variables to filter query for only children's level
    const lvl_fld = `level_${settings.perspective}_i`;
    const childlvl = isKmapLoading ? 1 : parseInt(kmapdata[lvl_fld]) + 1;
    // Query for number of children: build the query for numFound only (count: 0)
    const query = {
        index: 'terms',
        params: {
            q: `tree:${domain} AND ${pathqry}`,
            fq: `${lvl_fld}:${childlvl}`,
            rows: 0,
            fl: '*',
        },
    };

    // UseSolr Query (ReactQuery based hook)
    const {
        isLoading: isChildrenLoading,
        data: childrenData,
        isError: isChildrenError,
        error: hildrenError,
    } = useSolr(qid, query, isKmapLoading);

    useEffect(() => {
        if (
            !isChildrenLoading &&
            settings?.selPath &&
            settings.selPath.length > 0
        ) {
            const lastkid = settings.selPath[settings.selPath.length - 1];
            if (kid * 1 === lastkid * 1) {
                $(`#${settings.elid}`)
                    .eq(0)
                    .find('.selected')
                    .removeClass('selected');
                $(leafRef.current).addClass('selected');
                setTimeout(updateTreeScroll, 1000, settings);
            }
        }
    }, [kmapdata, childrenData, settings.selPath]);

    if (isKmapLoading) {
        return (
            <div data-id={queryID(domain, kid)}>
                <MandalaSkeleton height={5} width={50} />
            </div>
        );
    }

    // Determine Icon for open or closed
    let icon = isOpen ? (
        <FontAwesomeIcon icon={faMinusCircle} />
    ) : (
        <FontAwesomeIcon icon={faPlusCircle} />
    );
    let toggleclass = isOpen ? 'leafopen' : 'leafclosed';

    // if no children, replace icon with dash
    if (!childrenData || childrenData?.numFound === 0) {
        icon = '–';
        toggleclass = 'leafend';
    }

    // class value for tree leaf div
    const divclass = `${settings.leafClass} lvl\-${leaf_level} ${toggleclass}`;

    //console.log(kmapdata);
    const handleClick = (e) => {
        setIsOpen(!isOpen);
    };

    // Do not display if no header
    if (!kmapdata?.header) {
        return null;
    }

    // If it's a initial node with setting to show ancestors, find the most senior ancestor to show and send path to filter out aunts and uncles
    if (props.showAncestors) {
        let treepath = kmapdata?.ancestor_id_path
            ? kmapdata.ancestor_id_path?.split('/')
            : false;
        if (!treepath) {
            console.warning(
                'No treepath found for “showAncestors” in KmapTree'
            );
            return null;
        }
        const rootid = treepath.shift();
        treepath = treepath.join('/');
        return (
            <TreeLeaf
                domain={settings.root.domain}
                kid={rootid}
                leaf_level={0}
                settings={settings}
                isopen={true}
                treePath={treepath}
            />
        );
    } else if (props.treePath) {
        // treePath is set when showing ancestors, only show the direct line ancestor not aunts and uncles
        let treepath = props.treePath.split('/');
        const currentid = treepath.shift();
        treepath = treepath.length > 0 ? treepath.join('/') : false;
        const stayopen = treepath ? true : settings.isOpen;
        const newlevel = leaf_level + 1;
        return (
            <div className={divclass}>
                <span
                    className={settings.spanClass}
                    data-domain={kmapdata?.tree}
                    data-id={kmapdata?.id}
                >
                    <span className={settings.iconClass} onClick={handleClick}>
                        {icon}
                    </span>
                    <span className={settings.headerClass}>
                        <Link to={'/' + kmapdata?.id.replace('-', '/')}>
                            {kmapdata?.header}
                        </Link>
                    </span>
                    <MandalaPopover domain={domain} kid={kid} />
                </span>
                <div className={settings.childrenClass}>
                    <TreeLeaf
                        domain={settings.root.domain}
                        kid={currentid}
                        leaf_level={newlevel}
                        settings={settings}
                        isopen={stayopen}
                        treePath={treepath}
                    />
                </div>
            </div>
        );
    } else {
        // Define the child_content based on whether it is open or not (only loads children when open)
        let child_content = isOpen ? (
            <LeafChildren
                settings={settings}
                quid={qid.replace('-count', '')}
                query={query}
                leaf_level={leaf_level}
                isOpen={isOpen}
            />
        ) : (
            <div className={settings.childrenClass}> </div>
        );

        if (settings?.showRelatedPlaces) {
            child_content = (
                <RelatedChildren
                    settings={settings}
                    domain={domain}
                    kid={kid}
                />
            );
        }

        const leafhead = props?.nolink ? (
            kmapdata?.header
        ) : (
            <Link to={'/' + kmapdata?.id.replace('-', '/')}>
                {kmapdata?.header}
            </Link>
        );

        // return the div structure for a regular tree leaf
        return (
            <div className={divclass} ref={leafRef}>
                <span
                    className={settings.spanClass}
                    data-domain={kmapdata?.tree}
                    data-id={kmapdata?.id}
                >
                    <span className={settings.iconClass} onClick={handleClick}>
                        {icon}
                    </span>
                    <span className={settings.headerClass}>{leafhead}</span>
                    {!props?.nolink && (
                        <MandalaPopover domain={domain} kid={kid} />
                    )}
                </span>
                {child_content}
            </div>
        );
    }
}

/**
 * The Container under a leaf that contains the children for that node, when the node is opened
 * It inherits the child query from Tree Leaf but sets rows to the default page size (e.g. 200)
 *
 * @param settings
 * @param children
 * @param level
 * @param isOpen
 * @returns {JSX.Element}
 * @constructor
 */
function LeafChildren({ settings, quid, query, leaf_level, isOpen }) {
    query['params']['rows'] = settings.pgsize;
    const {
        isLoading: isChildrenLoading,
        data: childrenData,
        isError: isChildrenError,
        error: childrenError,
    } = useSolr(quid, query);
    const children =
        !isChildrenLoading && childrenData?.docs ? childrenData.docs : [];
    const headernm = `header`;
    if (settings.domain !== 'terms') {
        children.sort((a, b) => {
            if (a[headernm] > b[headernm]) {
                return 1;
            }
            if (a[headernm] < b[headernm]) {
                return -1;
            }
            return 0;
        });
    }
    return (
        <div className={settings.childrenClass}>
            {children.map((child, i) => {
                const lckey = `treeleaf-${child['id']}-children`;
                const kidpts = child['id'].split('-');
                let io = false;
                if (
                    !settings?.project_ids ||
                    settings.project_ids.includes(kidpts[1])
                ) {
                    return (
                        <TreeLeaf
                            key={lckey}
                            domain={kidpts[0]}
                            kid={kidpts[1]}
                            leaf_level={leaf_level + 1}
                            settings={settings}
                            isopen={io}
                        />
                    );
                }
            })}
        </div>
    );
}

function RelatedChildren({ settings, domain, kid }) {
    const quid = `related-children-${domain}-${kid}`;
    const query = {
        index: 'terms',
        params: {
            q: `block_type:child AND block_child_type:related_places AND related_places_path_s:*/${kid}/*`,
            fq: `origin_uid_s:places-${kid}`,
            rows: 1000,
            fl: '*',
        },
    };
    const {
        isLoading: isChildrenLoading,
        data: childrenData,
        isError: isChildrenError,
        error: childrenError,
    } = useSolr(quid, query);
    if (isChildrenLoading) {
        return <MandalaSkeleton />;
    }
    const children =
        !isChildrenLoading && childrenData?.docs ? childrenData.docs : [];

    const headernm = `related_places_header_s`;
    children.sort((a, b) => {
        if (a[headernm] > b[headernm]) {
            return 1;
        }
        if (a[headernm] < b[headernm]) {
            return -1;
        }
        return 0;
    });

    return (
        <div className={settings.childrenClass}>
            {children.map((child, i) => {
                const lckey = `treeleaf-${child['id'].replace(
                    '-',
                    '.'
                )}-children-related-places-${i}`;
                const [domain, kid] = child['related_places_id_s'].split('-');
                const leafhead = child[headernm];
                const divclass = 'leafend';
                let io = false;
                return (
                    <div className={divclass} key={lckey}>
                        <span
                            className={settings.spanClass}
                            data-domain={domain}
                            data-id={kid}
                        >
                            <span className={settings.iconClass}>-</span>
                            <span className={settings.headerClass}>
                                <Link to={`/${domain}/${kid}`}>{leafhead}</Link>
                                &nbsp;
                                <span className="addinfo text-capitalize">
                                    ({child['related_places_feature_type_s']})
                                </span>
                            </span>
                            <MandalaPopover
                                key={lckey + 'pop'}
                                domain={domain}
                                kid={kid}
                            />
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function PerspectiveChooser(props) {
    const domain = props.domain;
    const choices =
        domain in KmapPerpsectiveData ? KmapPerpsectiveData[domain] : false;
    if (!domain || !choices) {
        console.log('one is false! ', domain, choices);
        return null;
    }
    const current = props?.current;
    let pclass =
        props?.classes && props.classes?.length && props.classes.length > 0
            ? props.classes
            : '';
    pclass = ['c-perspective-select', ...pclass];

    return (
        <div className={pclass}>
            <label>Persepective: </label>
            <select>
                {choices.map((persp) => {
                    const sel = persp.id === current ? 'selected' : '';
                    return (
                        <option value={persp.id} selected={sel}>
                            {persp.name}
                        </option>
                    );
                })}
            </select>
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

/**
 * Function called when selected div is loaded to scroll that selected div into view
 * @param settings : object : the tree settings for the selected node
 */
function updateTreeScroll(settings) {
    const tree = $('#' + settings.elid);

    if (tree.hasClass('clicked')) {
        tree.removeClass('clicked');
        return;
    }
    const selel = tree.find('.c-kmapleaf.selected');
    if (tree?.offset() && selel?.offset()) {
        const treetop = tree.offset().top;
        const seleltop = selel.offset().top;
        const centerAdj = Math.floor(tree.height() / 2.5);
        let scrtop;
        if (seleltop < 0) {
            // Tree is scrolled past selected element
            scrtop = treetop - Math.abs(seleltop) - centerAdj;
        } else if (seleltop > tree.height()) {
            // Selected element is below the bottom of the tree div
            scrtop = seleltop - treetop - centerAdj;
        } else {
            // Select element is in view
            scrtop = treetop + seleltop - centerAdj;
        }
        tree.scrollTop(scrtop);
    }
}
