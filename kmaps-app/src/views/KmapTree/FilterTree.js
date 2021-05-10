import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import React from 'react';
import TreeLeaf from './TreeLeaf';
import LeafGroup from './LeafGroup';

/**
 * Filter Tree: is a tree filtered by a project id (projects_ss) which is set in the .env files.
 * It initially does a search for all docs that have that id and facets on the ancestor_ids for that perspective.
 * This list of IDs is then added to the tree settings under project_ids attribute.
 * There is an automatic check in the LeafChildren component that will display all children if the project_ids list is empty
 * But if list has any length, then it will only show children if they occur in the list.
 * By faceting on ancestors, it gets necessary ancestor nodes that may not be tagged with that projects_ss ID.
 *
 * This takes the settings from the filter tree plus any other props given to the React Component (just in case)
 * The settings must have the project attribute set.
 *
 * @param settings
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */

export default function FilterTree({ settings, ...props }) {
    const projid = settings?.project;
    const persp = settings.perspective;
    // const persp_lvl = `level_${persp}_i`;
    const ancestor_facet = `ancestor_ids_${persp}`;
    const level = settings.level;

    const query = {
        index: 'terms',
        params: {
            q: `tree:${settings.domain} AND projects_ss:${projid}`,
            rows: 10000,
            fl: 'id, header, ancestor_id_gen',
            facet: true,
            'facet.limit': -1,
            'facet.mincount': 1,
            'facet.field': ancestor_facet,
        },
    };
    // console.log('query', query);
    const {
        isLoading: isAncestorsLoading,
        data: ancestorsData,
        isError: isAncestorsError,
        error: ancestorsError,
    } = useSolr(`filter-tree-${projid}-${settings.domain}-${persp}`, query);
    if (isAncestorsLoading) {
        return (
            <div className="filter-tree">
                <MandalaSkeleton />
            </div>
        );
    }
    if (!projid) {
        return (
            <div className="filter-tree">
                <p>Cannot load filter tree without project ID setting!</p>
            </div>
        );
    }

    // console.log('Filter anc data', ancestorsData);
    settings['project_ids'] =
        ancestorsData?.facets && ancestorsData.facets[ancestor_facet]
            ? Object.keys(ancestorsData.facets[ancestor_facet])
            : [];
    const treeclass = `${settings.treeClass} ${settings.root.domain}`;
    const tree =
        settings.domain === 'places' ? (
            <TreeLeaf
                domain={settings.root.domain}
                kid={settings.root.kid}
                leaf_level={0}
                settings={settings}
                isopen={settings.isOpen}
                showAncestors={settings.showAncestors}
            />
        ) : (
            <LeafGroup
                domain={settings.domain}
                level={level}
                settings={settings}
            />
        );
    return (
        <div id={settings.elid} className={treeclass}>
            {tree}
        </div>
    );
}
