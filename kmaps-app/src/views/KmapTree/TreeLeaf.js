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
import { useStatus } from '../../hooks/useStatus';

export default function TreeLeaf({
    node,
    withChild = null,
    isOpen = false,
    ...props
}) {
    const leafRef = React.createRef(); // Reference to the Leaf's HTML element
    //const selPath = useStatus((state) => state.selPath);
    const settings = node?.tree?.settings;

    const perspectiveSetting = usePerspective(
        (state) => state[settings?.domain]
    );
    const [isOpenState, setIsOpen] = useState(isOpen);
    const [selected, setSelected] = useState(false);
    const viewSetting = useView((state) => state[settings?.domain]);

    const perspective = settings?.perspective || perspectiveSetting;
    const doc = node?.doc;
    const tree = node?.tree;
    const [domain, kid] = doc?.uid?.split('-');
    if (withChild) {
        node.hasChildren = true;
    }
    const childrenLoaded =
        node?.domain === 'terms' ||
        (node?.hasChildren && node?.children?.length > 0); // node.children is originally set to null, not an array
    const rowsToDo = 3000;

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

    const scrollToMe = () => {
        const tree_el = document.getElementById(tree?.settings?.elid);
        const myid = `leaf-${domain}-${kid}`;
        const me = document.getElementById(myid);
        if (tree_el && me) {
            window.scroll(0, 0);
            tree_el.scroll(0, me.offsetTop - window.screen.height * 0.4);
        }
    };

    useEffect(() => {
        if (tree?.selectedNode * 1 === node.kid * 1) {
            setTimeout(scrollToMe, 1000);
        }
    }, []);

    useEffect(() => {
        if (node?.domain === node?.tree?.selectedDomain) {
            if (tree?.selPath && tree?.selectedNode) {
                if (tree.selPath?.includes(node.kid)) {
                    setIsOpen(true);
                }
                if (tree.selectedNode * 1 === node.kid * 1) {
                    setSelected(true);
                } else {
                    setSelected(false);
                }
            }
        }
    }, [tree.selectedNode, tree.selPath]);

    if (areChildrenLoading) {
        return <MandalaSkeleton />;
    }

    if (!childrenLoaded) {
        if (children?.numFound > 0) {
            tree.parseData(children.docs);
        } else {
            node.hasChildren = false;
        }
    }

    if (tree.settings.showNode) {
        // hmm  does this work?
        if (
            !tree?.selPath?.includes(kid * 1) &&
            node.pid * 1 !== tree.selectedNode * 1
        ) {
            return null;
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
    let selclass = selected ? ' selected' : '';
    let divclass = `${settings.leafClass} lvl\-${node.level} ${toggleclass}${selclass}`;

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
    const myid = `leaf-${domain}-${kid}`;

    const leafclick = () => {
        tree.selectedNode = node.kid;
        tree.selPath = node.ancestor_path;
        document.getElementById(myid).classList.add('selected');
    };
    const leafhead = nolink ? (
        <HtmlCustom markup={kmhead} />
    ) : (
        <Link to={'/' + doc?.id.replace('-', '/')} onClick={leafclick}>
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
        <div id={myid} className={divclass} ref={leafRef}>
            <span
                className={settings.spanClass}
                data-domain={domain}
                data-id={kid}
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
