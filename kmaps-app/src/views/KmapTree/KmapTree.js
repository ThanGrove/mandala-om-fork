import React, { useEffect, useState } from 'react';
import { usePerspective } from '../../hooks/usePerspective';
import { PerspectiveChooser } from './KmapPerspectives';
import './KmapTree.scss';
import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { KTree, TreeNode } from './KmapsTree.class';
import TreeLeaf from './TreeLeaf';
import { useRouteMatch } from 'react-router-dom';
import { useStatus } from '../../hooks/useStatus';

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
        showNode: false,
        showRelatedPlaces: false,
        elid: 'kmap-tree-',
        pgsize: 200,
        project_ids: false,
        noRootLinks: false,
        selectedNode: 0, // Kmap ID number of selected node (without domain)
        selectedDomain: '',
        selPath: [],
    };
    settings = { ...settings, ...props }; // Merge default settings with instance settings giving preference to latter
    const match = useRouteMatch([
        '/:baseType/:id/related-:type/:definitionID/view/:relID',
        '/:baseType/:id/related-:type/:definitionID/:viewMode',
        '/:baseType/:id/related-:type',
        '/:baseType/:id',
    ]);
    settings.selectedNode = match ? match.params.id : 0;
    settings.selectedDomain = match ? match.params.baseType : '';
    if (!!this?.showNode) {
        settings.selectedNode = this.showNode;
        settings.selectedDomain = this.domain;
    }
    const uniqueTreeID = `${settings.domain}:${settings.perspective}`;
    settings.elid += uniqueTreeID;
    const perspective = usePerspective((state) => state[settings.domain]);
    settings.perspective = perspective;
    settings.ancestor_field = [
        `ancestor_ids_${settings.perspective}`,
        'ancestor_ids_generic',
    ]; // this works for Places, TODO: check for subjects and terms

    settings.level_field = `level_${settings.perspective}_i`;
    settings.sort_field = `header`; // places and subjects
    if (settings.domain === 'terms') {
        settings.sort_field = 'position_i';
    }
    settings.treeClass += ` ${settings.domain} ${settings.perspective?.replace(
        /\./g,
        '-'
    )}`;

    // Set root information for this tree so they can be passed to each leaf
    settings['root'] = {
        domain: settings?.domain,
        kid: settings?.kid,
        level: settings?.level,
        perspective: perspective,
    };
    settings.debug = settings?.elid?.includes('related-places-tree');

    const [ktree, setKtree] = useState(null);

    let qval = `${settings.level_field}:[1 TO 2]`;
    let selkid = null;

    const treebasequery = {
        index: 'terms',
        params: {
            q: qval,
            fq: `tree:${settings.domain}`,
            rows: 5000,
            fl: '*',
        },
    };

    const {
        isLoading: isTreeLoading,
        data: treeData,
        isError: isTreeError,
        error: treeError,
    } = useSolr(
        ['tree', settings?.domain, settings?.perspective, selkid],
        treebasequery
    );

    useEffect(() => {
        if (treeData?.docs) {
            let nkt = new KTree(
                settings.domain,
                settings.perspective,
                treeData.docs,
                settings
            );

            setTimeout(() => {
                if (nkt?.selLoaded) {
                    setKtree(nkt);
                }
            }, 1000);
        }
    }, [treeData]);

    if (isTreeLoading) {
        return <MandalaSkeleton />;
    }
    // Hmmm
    return (
        <div id={settings.elid} className={settings.treeClass}>
            <PerspectiveChooser
                domain={settings.domain}
                current={perspective}
            />
            {!ktree?.trunk && <MandalaSkeleton />}
            {ktree?.trunk?.map((nd, ni) => {
                const tlkey = `treeleaf-${nd.uid}-${ni}`;
                const isInPath =
                    nd?.domain === ktree.selectedDomain &&
                    ktree?.selPath?.includes(nd.kid);
                return (
                    <TreeLeaf
                        key={tlkey}
                        node={nd}
                        isOpen={settings.isOpen || isInPath}
                    />
                );
            })}
        </div>
    );
}
