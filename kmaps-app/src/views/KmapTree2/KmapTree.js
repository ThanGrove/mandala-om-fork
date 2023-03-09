import React, { useEffect, useState } from 'react';
import { useKmap } from '../../hooks/useKmap';
import { useSolr } from '../../hooks/useSolr';
import { usePerspective } from '../../hooks/usePerspective';
import { PerspectiveChooser } from './KmapPerspectives';
// import FilterTree from './FilterTree';
import LeafLevel from './TreeTrunk';
import TreeLeaf from './TreeLeaf';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { queryID, stringToHash } from '../common/utils';
import $ from 'jquery';
// import '../KmapTree.scss';
import { useView } from '../../hooks/useView';
import TreeTrunk from './TreeTrunk';

export default function KmapTree(props) {
    let settings = {
        domain: 'places', // Default domain is places
        kid: 0, // Only used if "level" is false
        level: false, // When level is set to a number, it shows all nodes on that level (subjects and terms)
        treeClass: 'c-kmaptree',
        leafClass: 'c-kmapleaf',
        spanClass: 'c-kmapnode',
        iconClass: 'toggle-icon',
        headerClass: 'label',
        childrenClass: 'children',
        perspective: '',
        isOpen: false,
        showAncestors: false,
        showRelatedPlaces: false,
        elid: 'kmap-tree-',
        pgsize: 200,
        project_ids: false,
        noRootLinks: false,
        selectedNode: 0, // Kmap ID number of selected node (without domain)
        selPath: [],
    };
    settings = { ...settings, ...props }; // Merge default settings with instance settings giving preference to latter
    const perspective = usePerspective((state) => state[settings.domain]);
    settings.perspective = perspective;
    settings.ancestor_field = `ancestor_uids_${settings.perspective}`;
    settings.level_field = `level_${settings.perspective}_i`;

    const uniqueTreeID = `${settings.domain}:${settings.perspective}`;
    settings.elid += uniqueTreeID;

    settings.treeClass += ` ${settings.domain} ${settings.perspective}`;

    // Remove domain and dash from selectedNode value (get just the number from e.g. "places-1234")
    if (
        typeof settings?.selectedNode === 'string' &&
        settings?.selectedNode?.includes('-')
    ) {
        settings.selectedNode = settings.selectedNode.split('-')[1];
    }
    // Set root information for this tree so they can be passed to each leaf
    settings['root'] = {
        domain: settings?.domain,
        kid: settings?.kid,
        level: settings?.level,
        perspective: perspective,
    };

    return (
        <div id={settings.elid} className={settings.treeClass}>
            <PerspectiveChooser
                domain={settings.domain}
                current={perspective}
            />
            <TreeTrunk
                domain={settings.root.domain}
                level={settings.level}
                settings={settings}
                isopen={settings.isOpen}
                perspective={perspective}
                newperspective={perspective}
            />
        </div>
    );
}
