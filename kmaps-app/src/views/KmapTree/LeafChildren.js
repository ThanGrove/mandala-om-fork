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
export function LeafChildren({ node, ...props }) {
    const tree = node.tree;
    const settings = tree.settings;
    const domain = tree.domain;
    const perspective = tree.perspective;
    const doc = node?.doc;
    const level = node?.level;
    const rowsToDo = 2000;

    // Find Grandchildren
    let gcquery = {
        index: 'terms',
        params: {
            q: `${settings.level_field}:${level * 1 + 2}`,
            fq: [`tree:${node.domain}`, `${node.ancestor_field}:${node.kid}`],
            rows: rowsToDo,
            fl: '*',
            facet: true,
            'facet.field': node?.ancestor_field,
            'facet.mincount': 2,
        },
    };

    let {
        isLoading: areGcLoading,
        data: grandkids,
        isError: isGcError,
        error: gcError,
    } = useSolr([domain, perspective, doc.uid, 'grandchildren'], gcquery); // bypas if has selected data
    if (areGcLoading) {
        return null;
    }
    if (isGcError) {
        console.log("can't load children", gcError);
    }

    let withChild = [];
    if (grandkids?.numFound > 0) {
        tree.parseData(grandkids.docs);
        withChild = Object.keys(grandkids.facets[node?.ancestor_field]);

        if (grandkids.numFound > rowsToDo) {
            console.log(
                'More grandkids found than returned',
                gcquery,
                grandkids
            );
        }
    }

    let nodechildren = 'none';
    if (node.children.length > 0) {
        nodechildren = (
            <>
                {node.children.map((child, i) => {
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
                            key={`tree-leaf-${child.uid}`}
                            node={child}
                            withChild={withChild.includes(child.id)}
                            isOpen={io}
                        />
                    );
                })}
            </>
        );
    }

    return <div className={settings.childrenClass}>{nodechildren}</div>;
}
