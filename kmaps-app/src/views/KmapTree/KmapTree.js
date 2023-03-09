import React, { useEffect, useState } from 'react';
import { usePerspective } from '../../hooks/usePerspective';
import { PerspectiveChooser } from './KmapPerspectives';
import './KmapTree.scss';
import TreeTrunk from './TreeTrunk';
import { useSolr } from '../../hooks/useSolr';
import { useKmap } from '../../hooks/useKmap';
import MandalaSkeleton from '../common/MandalaSkeleton';

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
    settings.ancestor_field = `ancestor_id_${settings.perspective}_path`;
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

    // Query for selected node and its path
    // Get all nodes of the level
    let sel_uid = `${settings.domain}-${settings.selectedNode}`;
    const {
        isLoading: isSelNodeLoading,
        data: selNode,
        isError: isSelNodeError,
        error: selNodeError,
    } = useKmap(sel_uid, 'info');

    settings.selPath =
        selNode && Object.keys(selNode).includes(settings.ancestor_field)
            ? selNode[settings.ancestor_field]
            : [];

    let ancestors = settings?.selPath;
    if (typeof ancestors === 'string' && ancestors.includes('/')) {
        ancestors = ancestors.split('/');
        settings.selPath = ancestors.map((anc, ai) => {
            return anc * 1;
        }); // use full path including self but as array
        if (ancestors?.length > 0) {
            // remove self from array for ancestors
            ancestors = ancestors.slice(0, settings?.selPath?.length - 1);
        }
    }

    const lvlfld = settings?.level_field;
    const ancfld = settings?.ancestor_field;
    let pnquery = ''; // initialize query variable
    if (Array.isArray(ancestors)) {
        pnquery = ancestors.map((anc, ai) => {
            let plvl = ai + 2;
            anc = anc.includes('-') ? anc.split('-')[1] : anc;
            let anc_condition =
                ai > 0 ? `${ancfld}:*/${anc}/*` : `${ancfld}:${anc}`;
            return `(${lvlfld}:${plvl} AND ${anc_condition})`;
        });
    }
    const bypass = !pnquery || pnquery?.length === 0 || isSelNodeLoading;
    const pathnodesquery = {
        index: 'terms',
        params: {
            q: pnquery?.join(' OR '),
            fq: `tree:${settings.domain}`,
            rows: 2000,
            fl: '*',
        },
    };

    let {
        isLoading: isSelPathLoading,
        data: selPathData,
        isError: isSelPathError,
        error: selPathError,
    } = useSolr(
        ['tree-path', sel_uid, settings.perspective],
        pathnodesquery,
        bypass
    );

    if (!settings.domain) {
        return null;
    }
    if (isSelPathLoading || isSelNodeLoading) {
        return <MandalaSkeleton />;
    }

    // console.log(pnquery.join(' OR '), selPathData);
    if (selPathData?.numFound > 0) {
        const newSPD = {};
        ancestors.forEach((anc, ai) => {
            newSPD[anc] = selPathData.docs.filter((doc, di) => {
                if (ai === 0) {
                    return doc[settings.level_field] === 2;
                }
                return doc[settings.ancestor_field].includes(`/${anc}/`);
            });
        });
        selPathData = newSPD;
    }
    return (
        <div id={settings.elid} className={settings.treeClass}>
            <PerspectiveChooser
                domain={settings.domain}
                current={perspective}
            />
            <TreeTrunk
                domain={settings.root.domain}
                settings={settings}
                isopen={settings.isOpen}
                perspective={perspective}
                newperspective={perspective}
                seldata={selPathData}
            />
        </div>
    );
}
