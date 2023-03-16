import React, { useEffect, useState } from 'react';
import { getHeaderForView, getProject, queryID } from '../common/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { MandalaPopover } from '../common/MandalaPopover';
import { HtmlCustom } from '../common/MandalaMarkup';
import { useView } from '../../hooks/useView';
import { usePerspective } from '../../hooks/usePerspective';
import { LeafChildren } from './LeafChildren';
import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';

export default function TreeLeaf({
    node,
    withChild = null,
    isOpen = false,
    ...props
}) {
    const leafRef = React.createRef(); // Reference to the Leaf's HTML element
    const settings = node?.tree?.settings;

    const perspectiveSetting = usePerspective(
        (state) => state[settings.domain]
    );
    const [isOpenState, setIsOpen] = useState(isOpen);
    const viewSetting = useView((state) => state[settings.domain]);

    const perspective = settings?.perspective || perspectiveSetting;
    const doc = node?.doc;
    const [domain, kid] = doc?.uid?.split('-');
    if (withChild) {
        node.hasChildren = true;
    }
    const childrenLoaded =
        node?.domain === 'terms' ||
        (node?.hasChildren && node?.children?.length > 0); // node.children is originally set to null, not an array
    const rowsToDo = 3000;

    useEffect(() => {
        if (settings?.selPath?.includes(node.kid)) {
            setIsOpen(true);
        }
    }, [settings.selPath]);

    // Find Children
    let childquery = {
        index: 'terms',
        params: {
            q: `${settings.level_field}:${node.level * 1 + 1}`,
            fq: [`tree:${node.domain}`, `${node.ancestor_field}:${node.kid}`],
            rows: rowsToDo,
            fl: '*',
        },
    };

    let {
        isLoading: areChildrenLoading,
        data: children,
        isError: isChildError,
        error: childError,
    } = useSolr(
        [domain, perspective, doc.uid, 'children'],
        childquery,
        childrenLoaded
    ); // bypas if children already loaded

    if (areChildrenLoading) {
        return <MandalaSkeleton />;
    }

    if (!childrenLoaded) {
        if (children?.numFound > 0) {
            node.tree.parseData(children.docs);
        } else {
            node.hasChildren = false;
        }
    }

    if (node.isSelParent()) {
        const seln = node.tree.getSelectedNode();
        if (node.children.indexOf(seln) === -1) {
            node.add(seln);
        }
    }

    // Determine Icon for open or closed
    let icon = isOpenState ? (
        <FontAwesomeIcon icon={faMinusCircle} />
    ) : (
        <FontAwesomeIcon icon={faPlusCircle} />
    );
    let toggleclass = isOpenState ? 'leafopen' : 'leafclosed';

    // with No Children, replace icon with dash

    if (node.hasChildren === false) {
        icon = '';
        toggleclass = 'leafend';
    } else if (
        node.hasChildren === false &&
        domain === 'places' &&
        !settings.showRelatedPlaces
    ) {
        icon = '';
        toggleclass = 'leafend';
    }

    // class value for tree leaf div
    let divclass = `${settings.leafClass} lvl\-${node.level} ${toggleclass}`;
    if (node?.isSelNode()) {
        divclass += ' selected';
    }

    // Leaf click handler
    const handleClick = (e) => {
        setIsOpen(!isOpenState);
    };

    // Do not display if no header to display in tree
    if (!doc?.header) {
        return null;
    }

    // Define the child_content based on whether it is open or not (only loads children when open)
    let child_content = isOpenState ? (
        <LeafChildren node={node} />
    ) : (
        <div className={settings.childrenClass} data-status="closed-leaf"></div>
    );

    // Get Header based on View Settings (see hook useView)
    const kmhead = getHeaderForView(doc, viewSetting);

    const nolink = props?.nolink || (domain === 'terms' && node.hasChildren);

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
