import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import React, { useEffect, useState } from 'react';
import TreeLeaf from './TreeLeaf';
import LeafGroup from './LeafGroup';
import {
    getPerspectiveRoot,
    KmapPerpsectiveData,
    PerspectiveChooser,
} from './KmapPerspectives';

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

    // useState Calls for Perspectives
    //const [rootkid, setRoot] = useState(settings.root?.kid); // Needed to make tree reload on perspective change
    // Perspective Data is a tuple of perspective code and perspective root kid
    console.log(persp);
    const [perspective, setPerspective] = useState(persp); // Needed to pass to perspective chooser

    if (settings.kid === 0 && !settings.level) {
        settings.level = 1;
    }
    console.log('Filter tree reload: ', perspective);
    const rootquery = {
        index: 'terms',
        params: {
            q: `level_${perspective}_i:1`,
            fq: `tree:${settings.domain}`,
            rows: 1,
            fl: 'uid',
        },
    };
    const {
        isLoading: isRootLoading,
        data: rootData,
        isError: isRootError,
        error: rootError,
    } = useSolr(
        ['filter', 'tree', 'root', projid, settings.domain, persp],
        rootquery
    );

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
    } = useSolr(
        `filter-tree-${projid}-${settings.domain}-${persp}`,
        query,
        isRootLoading
    );

    // useEffect to Set level or root based on Perspective
    useEffect(() => {
        settings.perspective = perspective;
        settings.root.perspective = perspective;
        if (rootData?.numFound > 0) {
            settings.root.kid = rootData.docs[0].uid.split('-')[1];
        }
    }, [perspective, rootData]);

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
    if (settings.domain === 'places') {
        if (settings.kid === 0) {
            settings.kid = settings.root.kid = 13735;
        }
    }
    const treeclass = `${settings.treeClass} ${settings.root.domain}`;
    let tree = (
        <p>There are no relevant {settings.domain} in this perspective</p>
    );
    if (settings?.project_ids?.length > 0) {
        tree =
            settings.domain === 'places' ? (
                <TreeLeaf
                    domain={settings.root.domain}
                    kid={settings.root.kid}
                    leaf_level={0}
                    settings={settings}
                    isopen={settings.isOpen}
                    perspective={perspective}
                    showAncestors={settings.showAncestors}
                />
            ) : (
                <LeafGroup
                    domain={settings.domain}
                    level={level}
                    settings={settings}
                    isopen={settings.isOpen}
                    perspective={settings.perspective}
                    newperspective={perspective}
                />
            );
    }

    return (
        <div id={settings.elid} className={treeclass}>
            <PerspectiveChooser
                domain={settings.domain}
                current={perspective}
                setter={setPerspective}
            />
            {tree}
        </div>
    );
}
