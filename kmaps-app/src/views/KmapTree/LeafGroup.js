import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import React from 'react';
import TreeLeaf from './TreeLeaf';

/**
 * A group of tree nodes/leaves at the same level, as in Subjects or Terms
 * This serves in the place of a single root node.
 * For groups of nodes that are children of another node, the LeafChildren component is used
 *
 * @param domain : str - the domain of the treee
 * @param level : int - the level of nodes to display in a group
 * @param settings : object - the rest of the KmapTree settings as defined above
 * @param isopen : boolean - whether the root nodes should be open (has not been tested)
 * @param newperspective : str - the ID of the new perspective necessary to cause the group to be redrawn on change
 * @constructor
 */
export default function LeafGroup({
    domain,
    level,
    settings,
    isopen,
    newperspective,
}) {
    const qid = `leaf-group-${domain}-${settings.perspective}-${level}-${newperspective}`;
    const persp_lvl = `level_${settings.perspective}_i`;
    // Need
    if (settings.perspective !== newperspective) {
        settings.perspective = newperspective;
    }
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

    const {
        isLoading: isGroupLoading,
        data: groupData,
        isError: isGroupError,
        error: groupError,
    } = useSolr(qid, query);

    if (isGroupLoading) {
        return <MandalaSkeleton />;
    }

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
