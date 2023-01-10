import React, { useEffect, useState } from 'react';
import { useKmap } from '../../hooks/useKmap';
import { getHeaderForView, getProject, queryID } from '../common/utils';
import { useSolr } from '../../hooks/useSolr';
import $ from 'jquery';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { MandalaPopover } from '../common/MandalaPopover';
import { HtmlCustom } from '../common/MandalaMarkup';
import { useView } from '../../hooks/useView';
import { usePerspective } from '../../hooks/usePerspective';

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
export default function TreeLeaf({
    domain,
    kid,
    leaf_level,
    settings,
    perspective,
    ...props
}) {
    const kmapid = queryID(domain, kid); // Build Leaf ID
    const ischos = kid * 1 === 55178;

    let io = props?.isopen ? props.isopen : false;

    if (ischos) {
        console.log('original io: ', io);
    }
    // Set to open if this leaf is in the selected path
    if (settings?.selPath && settings.selPath.length > 0) {
        if (settings.selPath.includes(kid * 1)) {
            io = true;
        }
    }
    if (ischos) {
        console.log('after checking selpath io: ', io);
    }

    const leafRef = React.createRef(); // Reference to the Leaf's HTML element
    // Open State
    const [isOpen, setIsOpen] = useState(io);

    // Persepective
    const perspectiveSetting = usePerspective(
        (state) => state[settings.domain]
    );

    // View
    const viewSetting = useView((state) => state[settings.domain]);

    // API Call for Leaf Data
    const {
        isLoading: isKmapLoading,
        data: kmapdata,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(domain, kid), 'info');

    if (!perspective) {
        perspective = perspectiveSetting;
    }

    // Query for number of children (numFound for 0 rows. This query is passed to LeafChildren to be reused).
    const qid = `leaf-children-${kmapid}-${perspective}-count`; // Id for query for caching
    // variable to query for paths that contain this node's path
    const path_fld = `ancestor_id_${perspective}_path`;
    const pathqry = isKmapLoading
        ? 'path:none'
        : `${path_fld}:${kmapdata[path_fld]}/*`;
    // variables to filter query for only children's level
    const lvl_fld = `level_${perspective}_i`; // base level field
    const closest_lvl_fld = `level_closest_${perspective}_i`; // closest level field
    let childlvl = 1; // while loading (Does it need to be 1?)
    if (!isKmapLoading) {
        if (lvl_fld in kmapdata && kmapdata[lvl_fld] !== 0) {
            childlvl = parseInt(kmapdata[lvl_fld]) + 1; // First check if base level exists
        } else if (
            closest_lvl_fld in kmapdata &&
            kmapdata[closest_lvl_fld] !== 0
        ) {
            childlvl = parseInt(kmapdata[closest_lvl_fld]) + 1; // If not, use closest level
        } else {
            // TODO: Test what if neither match?
            console.log('neither match');
        }
    }

    // Get Number of Children
    // Build the query to get number of children, by querying for children but rows = 0 and use numFound
    const query = {
        index: 'terms',
        params: {
            q: `tree:${domain} AND ${pathqry}`,
            fq: `${lvl_fld}:${childlvl}`,
            rows: 0,
            fl: '*',
        },
    };
    const {
        isLoading: isChildrenLoading,
        data: childrenData,
        isError: isChildrenError,
        error: hildrenError,
    } = useSolr(qid, query, isKmapLoading);

    // Adjust which element has selected class when there is a change in tree data, children, or selected path
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
                if (ischos) {
                    console.log('added selected class to chos');
                }
            }
        }
    }, [kmapdata, childrenData, settings.selPath]);

    // Exclude any kmaps in comma-separated list env variable: process.env.REACT_APP_KMAP_EXCLUDES
    const kmap_excludes =
        process.env?.REACT_APP_KMAP_EXCLUDES?.split(',') || [];
    if (kmap_excludes.includes(kmapid)) {
        return null;
    }

    // Show skeleton if loading self or children
    if (isKmapLoading || isChildrenLoading) {
        return (
            <div data-id={kmapid}>
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

    // with No Children, replace icon with dash
    const hasChildren = childrenData?.numFound > 0;
    if (!hasChildren) {
        icon = '';
        toggleclass = 'leafend';
    }

    // class value for tree leaf div
    const divclass = `${settings.leafClass} lvl\-${leaf_level} ${toggleclass}`;

    // Leaf click handler
    const handleClick = (e) => {
        if (ischos) {
            console.log('chos was clicked. isOpen = ', isOpen);
        }
        setIsOpen(!isOpen);
    };

    // Do not display if no header to display in tree
    if (!kmapdata?.header) {
        return null;
    }

    // Define the child_content based on whether it is open or not (only loads children when open)
    let child_content = isOpen ? (
        <LeafChildren
            settings={settings}
            quid={qid.replace('-count', '')}
            query={query}
            leaf_level={leaf_level}
            isOpen={isOpen}
            perspective={perspective}
        />
    ) : (
        <div className={settings.childrenClass} data-status="closed-leaf"></div>
    );

    if (ischos) {
        console.log('child content: ', child_content);
    }

    if (settings?.showRelatedPlaces && settings.selectedNode === kid) {
        child_content = (
            <RelatedChildren settings={settings} domain={domain} kid={kid} />
        );
    }

    // Get Header based on View Settings (see hook useView)
    const kmhead = getHeaderForView(kmapdata, viewSetting);

    const nolink = props?.nolink || (domain === 'terms' && hasChildren);

    const leafhead = nolink ? (
        <HtmlCustom markup={kmhead} />
    ) : (
        <Link to={'/' + kmapdata?.id.replace('-', '/')}>
            <HtmlCustom markup={kmhead} />
        </Link>
    );

    // Show popup only for terms that are expressions (9315), words (9668), or phrases (9669) or any other kmap type unless nolink is false
    // words (9668) and phrases (9669) were added to make English trees work
    let showpop =
        (kmapdata?.associated_subject_ids?.includes(9315) ||
            kmapdata?.associated_subject_ids?.includes(9668) ||
            kmapdata?.associated_subject_ids?.includes(9669) ||
            domain !== 'terms') &&
        !props?.nolink;

    // return the div structure for a regular tree leaf
    return (
        <div id={`leaf-${domain}-${kid}`} className={divclass} ref={leafRef}>
            <span
                className={settings.spanClass}
                data-domain={kmapdata?.tree}
                data-id={kmapdata?.id}
            >
                <span className={settings.iconClass} onClick={handleClick}>
                    {icon}
                </span>
                <span className={settings.headerClass}>
                    {leafhead}
                    {showpop && <MandalaPopover domain={domain} kid={kid} />}
                </span>
            </span>
            {child_content}
        </div>
    );
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
export function LeafChildren({
    settings,
    quid,
    query,
    leaf_level,
    isOpen,
    perspective,
}) {
    query['params']['rows'] = settings.pgsize;
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

    const sortfield = settings.domain === 'terms' ? 'position_i' : 'header';
    children.sort((a, b) => {
        if (a[sortfield] > b[sortfield]) {
            return 1;
        }
        if (a[sortfield] < b[sortfield]) {
            return -1;
        }
        return 0;
    });
    return (
        <div className={settings.childrenClass}>
            {children.map((child, i) => {
                const lckey = `treeleaf-${child['id']}-children`;
                const kidpts = child['id'].split('-');
                let io = false;
                // Filter out kids not in project ids
                if (
                    settings?.project_ids &&
                    !settings.project_ids.includes(kidpts[1])
                ) {
                    return null;
                }
                // Filter out related places not in path
                if (
                    settings?.showRelatedPlaces &&
                    !settings?.selPath.includes(kidpts[1] * 1)
                ) {
                    return null;
                }
                // Filter out uncles/aunts not in showAncestor of selnode path
                if (
                    !settings?.startNode &&
                    settings?.showAncestors &&
                    settings?.selPath &&
                    !settings.selPath.includes(child['id'].split('-')[1] * 1)
                ) {
                    return null;
                }
                // Open automatically if in environment variable
                if (
                    process.env?.REACT_APP_KMAP_OPEN?.split(',')?.includes(
                        child?.id
                    )
                ) {
                    io = true;
                }
                return (
                    <TreeLeaf
                        key={lckey}
                        domain={kidpts[0]}
                        kid={kidpts[1]}
                        leaf_level={leaf_level + 1}
                        settings={settings}
                        isopen={io}
                        perspective={perspective}
                    />
                );
            })}
        </div>
    );
}

export function RelatedChildren({ settings, domain, kid }) {
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

/**
 * Function called when selected div is loaded to scroll that selected div into view
 * @param settings : object : the tree settings for the selected node
 *
 * DEPRECATED but SAVE: May need to add this logic to the scroll leaf functions in the 3 kmap info components.
 */
function updateTreeScroll(settings) {
    const tree = $('#' + settings.elid);
    if (tree.hasClass('clicked')) {
        tree.removeClass('clicked');
        return;
    }
    const selel = tree.find('.c-kmapleaf.selected');
    if (!selel.hasClass('scrolled') && tree?.offset() && selel?.offset()) {
        const treetop = tree.offset().top;
        const seleltop = selel.offset().top;
        let scrtop = seleltop - treetop - 20;
        tree.scrollTop(scrtop);
        selel.addClass('scrolled');
    }
}
