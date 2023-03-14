import React, { useEffect, useState } from 'react';
import { usePerspective } from '../../hooks/usePerspective';
import { PerspectiveChooser } from './KmapPerspectives';
import './KmapTree.scss';
import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { KTree } from './KmapsTree.class';
import TreeLeaf from './TreeLeaf';

export default function KmapTree(props) {
    let settings = {
        domain: false, // Default domain is places
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
    settings.ancestor_field = [
        `ancestor_ids_${settings.perspective}`,
        'ancestor_ids_generic',
    ]; // this works for Places, TODO: check for subjects and terms

    settings.level_field = `level_${settings.perspective}_i`;
    settings.sort_field = `position_i`; // TODO: need to implement this for all domains

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

    const bypass = false; // !pnquery || pnquery?.length === 0 || isSelNodeLoading;
    const treebasequery = {
        index: 'terms',
        params: {
            q: `${settings.level_field}:[1 TO 2]`,
            fq: `tree:${settings.domain}`,
            rows: 5000,
            fl: '*',
        },
    };

    let {
        isLoading: isTreeLoading,
        data: treeData,
        isError: isTreeError,
        error: treeError,
    } = useSolr(
        ['tree', settings?.domain, settings?.perspective],
        treebasequery,
        bypass
    );

    if (isTreeLoading) {
        return <MandalaSkeleton />;
    }

    let ktree = new KTree(
        settings.domain,
        settings.perspective,
        treeData.docs,
        settings
    );
    console.log('tree data docs', ktree, treeData);

    // return <p>Successfull query: [{treeData?.numFound}]</p>;

    return (
        <div id={settings.elid} className={settings.treeClass}>
            <PerspectiveChooser
                domain={settings.domain}
                current={perspective}
            />
            {ktree?.trunk?.map((nd, ni) => {
                const tlkey = `treeleaf-${nd.uid}-${ni}`;
                return <TreeLeaf key={tlkey} node={nd} />;
            })}
        </div>
    );
}
