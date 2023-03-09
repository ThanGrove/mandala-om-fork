import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import React from 'react';
import TreeLeaf from './TreeLeaf';

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
