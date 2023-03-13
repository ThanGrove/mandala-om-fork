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

export default function TreeLeaf({
    doc,
    settings,
    perspective,
    seldata,
    ...props
}) {
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

    // Get Number of Children
    // Build the query to get number of children, by querying for children but rows = 0 and use numFound
    let hasSelData = false;
    if (
        seldata &&
        !Array.isArray(seldata) &&
        Object.keys(seldata).includes(kid)
    ) {
        hasSelData = true;
        seldata = seldata[kid];
    } else {
        seldata = {};
    }
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
    let {
        isLoading: isChildrenLoading,
        data: childrenData,
        isError: isChildrenError,
        error: childrenError,
    } = useSolr(quid, query, hasSelData); // bypass if sel data

    // Set open state once loaded
    useEffect(() => {
        setIsOpen(io);
    }, [io]);

    // Exclude any kmaps in comma-separated list env variable: process.env.REACT_APP_KMAP_EXCLUDES
    const kmap_excludes =
        process.env?.REACT_APP_KMAP_EXCLUDES?.split(',') || [];
    if (kmap_excludes.includes(kmapid)) {
        return null;
    }

    // Show skeleton if loading self or children
    if (isChildrenLoading) {
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
    const hasChildren = childrenData?.numFound > 0 || hasSelData;

    if (!hasChildren) {
        icon = '';
        toggleclass = 'leafend';
    } else if (
        !hasChildren &&
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
            seldata={seldata}
            leaf_level={leaf_level}
            isOpen={isOpen}
            perspective={perspective}
            settings={settings}
        />
    ) : (
        <div className={settings.childrenClass} data-status="closed-leaf"></div>
    );

    // Get Header based on View Settings (see hook useView)
    const kmhead = getHeaderForView(doc, viewSetting);

    const nolink = props?.nolink || (domain === 'terms' && hasChildren);

    const leafhead = nolink ? (
        <HtmlCustom markup={kmhead} />
    ) : (
        <Link to={'/' + doc?.id.replace('-', '/')}>
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
