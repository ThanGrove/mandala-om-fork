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
    quid,
    query,
    seldata = [],
    leaf_level,
    isOpen,
    perspective,
    settings,
}) {
    const hasSelData = Array.isArray(seldata) && seldata.length > 0;
    query['params']['rows'] = settings.pgsize;
    let {
        isLoading: isChildrenLoading,
        data: childrenData,
        isError: isChildrenError,
        error: childrenError,
    } = useSolr(quid, query, hasSelData); // bypas if has selected data
    if (isChildrenLoading) {
        return <MandalaSkeleton />;
    }
    if (isChildrenError) {
        console.log("can't load children", childrenError);
    }

    let children =
        !isChildrenLoading && childrenData?.docs ? childrenData.docs : [];
    if (hasSelData) {
        children = seldata;
    }

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

    let filtered_children = children.filter((c, ci) => {
        const kidpts = c['id'].split('-');
        // Filter out kids not in project ids
        if (
            settings?.project_ids &&
            !settings.project_ids.includes(kidpts[1])
        ) {
            return false;
        }
        // Filter out related places not in path
        if (
            settings?.showRelatedPlaces &&
            !settings?.selPath.includes(kidpts[1] * 1)
        ) {
            return false;
        }
        // Filter out uncles/aunts not in showAncestor of selnode path
        if (
            !settings?.startNode &&
            settings?.showAncestors &&
            settings?.selPath &&
            !settings.selPath.includes(c['id'].split('-')[1] * 1)
        ) {
            return false;
        }
        return true;
    });
    return (
        <div className={settings.childrenClass}>
            {filtered_children.map((child, i) => {
                let io = false;
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
                        key={`tree-leaf-${child.id}`}
                        doc={child}
                        isopen={io}
                        nolink={settings?.noRootLinks}
                        settings={settings}
                    />
                );
            })}
        </div>
    );
}
