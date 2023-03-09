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
import { RelatedPlacesFeature } from '../Kmaps/PlacesRelPlacesViewer';
import { Row } from 'react-bootstrap';
import { RelatedChildren } from './RelatedChildren';
import { LeafChildren } from './LeafChildren';

export default function TreeLeaf({ doc, settings, perspective, ...props }) {
    const kmapid = doc?.id; // Build Leaf ID
    let [domain, kid] = kmapid?.split('-');
    const leaf_level = doc[settings.level_field] * 1 || -1;

    let io = props?.isopen ? props.isopen : false;

    // Set to open if this leaf is in the selected path
    if (settings?.selPath && settings.selPath.length > 0) {
        if (settings.selPath.includes(kid * 1)) {
            io = true;
        }
    }

    // console.log(doc);
    const leafRef = React.createRef(); // Reference to the Leaf's HTML element

    // Open State
    const [isOpen, setIsOpen] = useState(false);

    // Persepective
    const perspectiveSetting = usePerspective(
        (state) => state[settings.domain]
    );

    // View
    const viewSetting = useView((state) => state[settings.domain]);

    /* Old code
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
        }
    }
    */

    // Get Number of Children
    // Build the query to get number of children, by querying for children but rows = 0 and use numFound
    const childlvl = leaf_level + 1;
    const qval = childlvl === 2 ? kid : `*/${kid}/*`;
    const query = {
        index: 'terms',
        params: {
            q: `${settings.ancestor_field}:${qval}`,
            fq: [`tree:${domain}`, `${settings.level_field}:${childlvl}`],
            rows: 0,
            fl: '*',
        },
    };
    const quid = [domain, settings.perspective, kmapid, 'children', 'count'];
    const {
        isLoading: isChildrenLoading,
        data: childrenData,
        isError: isChildrenError,
        error: childrenError,
    } = useSolr(quid, query);

    // Get number of rel children
    const relcquid = [
        domain,
        settings.perspective,
        kmapid,
        'related_children',
        'count',
    ];
    let q = `block_type:child AND block_child_type:related_${domain} AND related_${domain}_path_s:*/${kid}/*`;
    // Have to find none if not the selected node. numFound is used below.
    const relchildqry = {
        index: 'terms',
        params: {
            q: q,
            fq: `origin_uid_s:${kmapid}`,
            rows: 0,
            fl: 'uid',
        },
    };

    const {
        isLoading: isRelChildrenLoading,
        data: relChildrenData,
        isError: isRelChildrenError,
        error: relChildrenError,
    } = useSolr(relcquid, relchildqry);

    // Set open state once loaded
    useEffect(() => {
        setIsOpen(io);
    }, [io]);

    // Adjust which element has selected class when there is a change in tree data, children, or selected path
    /*  Replaced by code in kmaptree  TODO: need to check since I updated kmaptree March 9, 2023
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
            }
        }
    }, [kmapdata, childrenData, settings.selPath]);

     */

    // Exclude any kmaps in comma-separated list env variable: process.env.REACT_APP_KMAP_EXCLUDES
    const kmap_excludes =
        process.env?.REACT_APP_KMAP_EXCLUDES?.split(',') || [];
    if (kmap_excludes.includes(kmapid)) {
        return null;
    }

    // Show skeleton if loading self or children
    if (isChildrenLoading || isRelChildrenLoading) {
        return (
            <div data-id={kmapid}>
                <MandalaSkeleton height={5} width={50} />
            </div>
        );
    }

    /*
    if (relchildqry.params.fq.includes('15345')) {
        console.log("rel child qry", relchildqry);
    }
     */

    // Determine Icon for open or closed
    let icon = isOpen ? (
        <FontAwesomeIcon icon={faMinusCircle} />
    ) : (
        <FontAwesomeIcon icon={faPlusCircle} />
    );
    let toggleclass = isOpen ? 'leafopen' : 'leafclosed';

    // with No Children, replace icon with dash
    const hasChildren = childrenData?.numFound > 0;
    const hasRelChild = relChildrenData?.numFound > 0;
    /*if (domain === 'terms' && kid === '109') {
        console.log('109s rel childs', relChildrenData);
    }*/
    if (!hasChildren && !hasRelChild) {
        icon = '';
        toggleclass = 'leafend';
    } else if (
        !hasChildren &&
        hasRelChild &&
        domain === 'places' &&
        !settings.showRelatedPlaces
    ) {
        icon = '';
        toggleclass = 'leafend';
    }

    // class value for tree leaf div
    const divclass = `${settings.leafClass} lvl\-${leaf_level} ${toggleclass}`;

    // Leaf click handler
    const handleClick = (e) => {
        setIsOpen(!isOpen);
    };

    // Do not display if no header to display in tree
    if (!doc?.header) {
        return null;
    }
    // Define the child_content based on whether it is open or not (only loads children when open)
    let child_content = isOpen ? (
        <LeafChildren
            quid={quid.slice(0, quid.length - 1)}
            query={query}
            leaf_level={leaf_level}
            isOpen={isOpen}
            perspective={perspective}
            settings={settings}
        />
    ) : (
        <div className={settings.childrenClass} data-status="closed-leaf"></div>
    );

    if (settings?.showRelatedPlaces && settings?.selectedNode === kid) {
        child_content = (
            <RelatedChildren settings={settings} domain={domain} kid={kid} />
        );
    }

    // Get Header based on View Settings (see hook useView)
    const kmhead = getHeaderForView(doc, viewSetting);

    const nolink = props?.nolink || (domain === 'terms' && hasChildren);

    const stopScroll = (e) => {
        window.mandala.scrolledToSel = true;
        $('.selected').removeClass('selected');
        $(e.target).parents('.c-kmapleaf').eq(0).addClass('selected');
    };
    const leafhead = nolink ? (
        <HtmlCustom markup={kmhead} />
    ) : (
        <Link to={'/' + doc?.id.replace('-', '/')} onMouseDown={stopScroll}>
            <HtmlCustom markup={kmhead} />
        </Link>
    );

    // Show popup only for terms that are expressions (9315), words (9668), or phrases (9669) or any other kmap type unless nolink is false
    // words (9668) and phrases (9669) were added to make English trees work
    let showpop =
        (doc?.associated_subject_ids?.includes(9315) ||
            doc?.associated_subject_ids?.includes(9668) ||
            doc?.associated_subject_ids?.includes(9669) ||
            domain !== 'terms') &&
        !props?.nolink;

    // return the div structure for a regular tree leaf
    // console.log("leafhead", leafhead);
    return (
        <div id={`leaf-${domain}-${kid}`} className={divclass} ref={leafRef}>
            <span
                className={settings.spanClass}
                data-domain={doc?.tree}
                data-id={doc?.id}
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
