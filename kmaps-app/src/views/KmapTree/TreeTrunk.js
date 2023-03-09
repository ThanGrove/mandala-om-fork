import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import React from 'react';
import TreeLeaf from './TreeLeaf';

/**
 * A group of tree nodes/leaves at the same level, as in Subjects or Terms
 * This serves in the place of a single root node.
 * For groups of nodes that are children of another node, the LeafChildren component is used
 *
 * @param domain : string - the domain of the treee
 * @param level : int - the level of nodes to display in a group
 * @param settings : object - the rest of the KmapTree settings as defined above
 * @param isopen : boolean - whether the root nodes should be open (has not been tested)
 * @param newperspective : str - the ID of the new perspective necessary to cause the group to be redrawn on change
 * @constructor
 */
export default function TreeTrunk({
    domain,
    level = 0,
    settings,
    isopen = false,
    newperspective,
}) {
    const persp_lvl = `level_${settings.perspective}_i`;

    if (settings.perspective !== newperspective) {
        settings.perspective = newperspective;
    }
    const noRootLinks = settings.noRootLinks;
    // Get all nodes of the level
    let query = {
        index: 'terms',
        params: {
            q: `tree:${domain} AND ${persp_lvl}:${level}`,
            rows: 2000,
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
    } = useSolr(['tree-level', domain, settings.perspective, level], query);

    const lvlids = groupData?.docs?.map((d, di) => {
        return d.uid;
    });

    if (isGroupLoading) {
        return <MandalaSkeleton />;
    }

    let docs = !isGroupError && groupData?.docs ? groupData.docs : [];
    /*let facets = (groupData['facets'][facet_fld]) ? groupData['facets'][facet_fld] : [];
    resdocs = resdocs.filter((doc) => {
        return (doc[persp_lvl] == level);
    });*/

    if (domain !== 'terms') {
        docs.sort((a, b) => {
            if (a.header > b.header) {
                return 1;
            }
            if (a.header < b.header) {
                return -1;
            }
            return 0;
        });
    }

    // Show only desired root nodes
    const filteredDocs = docs.filter((d, di) => {
        const kid = d.id.split('-')[1];
        // If project is set and kid is not in project, then exclude
        if (settings?.project_ids && !settings.project_ids.includes(kid)) {
            return false;
        }
        // If show ancestors and kid is not in selecte path, then exclude
        if (
            settings?.showAncestors &&
            settings?.selPath &&
            !settings.selPath.includes(kid * 1)
        ) {
            return false;
        }
        return true;
    });

    return (
        <>
            {filteredDocs.map((d, di) => {
                const tlkey = `treeleaf-${d.uid}-${di}`;
                return (
                    <TreeLeaf
                        key={tlkey}
                        doc={d}
                        nolink={noRootLinks}
                        settings={settings}
                    />
                );
            })}
        </>
    );
}
