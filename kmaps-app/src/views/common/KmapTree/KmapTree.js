import React, { useState } from 'react';
import './kmapTree.scss';
import { useKmap } from '../../../hooks/useKmap';
import { queryID } from '../utils';
import MandalaSkeleton from '../MandalaSkeleton';
import {
    faHome,
    faPlusCircle,
    faMinusCircle,
    faAmbulance,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MandalaPopover } from '../MandalaPopover';
import { Container, Row, Col } from 'react-bootstrap';
import { useSolr } from '../../../hooks/useSolr';
import { Link } from 'react-router-dom';

const PlacesTree = React.lazy(() => import('../../../main/PlacesTree'));

/*
Temp page to show a single places tree for console command information
 */
export function PTreeTest(props) {
    return (
        <Container className="tree-test">
            <Row>
                <Col sm={4}>
                    <PlacesTree />
                </Col>
            </Row>
        </Container>
    );
}

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
                        showAncestors={true}
                        isOpen={true}
                        selectedNode={16408}
                        /*project="uf"*/
                    />
                </Col>
                <Col sm={4}>
                    <KmapTree
                        domain="subjects"
                        level="1"
                        elid="subjects-tree-1"
                        project="uf"
                    />
                </Col>
                <Col sm={4}>
                    <KmapTree
                        domain="terms"
                        level="1"
                        elid="terms-tree-1"
                        perspective="eng.alpha"
                        noRootLinks={true}
                    />
                </Col>
            </Row>
        </Container>
    );
}

/**
 * Kmap Tree: React Version of Kmaps Fancy Tree. Tree initializing function. Can pass any of the props listed in settings, but two basic modes;
 *      - Load a single kmaps as a tree root. Takes `domain` and `kid`.
 *      - Load a group of kmap nodes at the same level_i (e.g. subjects and possibly terms). Takes `domain` and `level`.
 *  The former loads a TreeLeaf component, the latter ...
 *  TODO: Finish this doc with desc of options/settings
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function KmapTree(props) {
    let settings = {
        domain: 'places',
        kid: 13735,
        level: false,
        treeClass: 'c-kmaptree',
        leafClass: 'c-kmapleaf',
        spanClass: 'c-kmapnode',
        iconClass: 'toggle-icon',
        headerClass: 'label',
        childrenClass: 'children',
        perspective: 'pol.admin.hier',
        isOpen: false,
        showAncestors: false,
        elid: 'kmap-tree-' + Math.floor(Math.random() * 10000),
        pgsize: 200,
        project_ids: false,
        noRootLinks: false,
        selectedNode: false,
    };
    settings = { ...settings, ...props };
    settings['root'] = {
        domain: settings.domain,
        kid: settings.kid,
    };
    if (
        !settings?.perspective ||
        settings.perspective == 'pol.admin.hier' ||
        settings.perspective == ''
    ) {
        if (settings.domain === 'subjects') {
            settings.perspective = 'gen';
        } else if (settings.domain === 'terms') {
            settings.perspective = 'tib.alpha';
        }
    }
    if (!settings?.elid) {
        const rndid = Math.floor(Math.random() * 999) + 1;
        settings['elid'] = `${settings.domain}-tree-${rndid}`;
    }

    if (settings?.project?.length > 0) {
        return <FilterTree settings={settings} />;
    }

    const treeclass = `${settings.treeClass} ${settings.root.domain}`;
    return (
        <div id={settings.elid} className={treeclass}>
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

function FilterTree({ settings, ...props }) {
    const projid = settings.project;
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
 * A group of tree nodes at the same level, as in Subjects
 *
 * @param domain
 * @param level
 * @param settings
 * @param isopen
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
 * A Single Leaf Node from which other may descend it loads a LeafChildren component that shows and empty div
 * if this leaf is "closed" but loads the children if "open"
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
    const io = props?.isopen ? props.isopen : false;
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
    // build the query for numFound only (count: 0)
    const query = {
        index: 'terms',
        params: {
            q: `tree:${domain} AND ${pathqry}`,
            fq: `${lvl_fld}:${childlvl}`,
            rows: 0,
            fl: '*',
        },
    };

    // Query Solr
    const {
        isLoading: isChildrenLoading,
        data: childrenData,
        isError: isChildrenError,
        error: hildrenError,
    } = useSolr(qid, query, isKmapLoading);

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
                        <Link to={kmapdata?.id.replace('-', '/')}>
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
        const child_content = isOpen ? (
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

        const leafhead = props?.nolink ? (
            kmapdata?.header
        ) : (
            <Link to={kmapdata?.id.replace('-', '/')}>{kmapdata?.header}</Link>
        );

        // return the div structure for a regular tree leaf
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
                            isopen={false}
                        />
                    );
                }
            })}
        </div>
    );
}
