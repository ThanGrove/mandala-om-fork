import React, { useState } from 'react';
import './kmapTree.scss';
import { useKmap } from '../../../hooks/useKmap';
import { queryID } from '../utils';
import MandalaSkeleton from '../MandalaSkeleton';
import {
    faHome,
    faPlusCircle,
    faMinusCircle,
    faAmbulance,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function TreeTest(props) {
    return (
        <div id="tree-test">
            <KmapTree domain="places" kid="13740" />
        </div>
    );
}

function KmapTree(props) {
    let settings = {
        domain: 'places',
        kid: 13753,
        treeClass: 'c-kmaptree',
        leafClass: 'c-kmapleaf',
        spanClass: 'c-kmapnode',
        iconClass: 'toggle-icon',
        headerClass: 'label',
        childrenClass: 'children',
        perspective: '',
        isOpen: false,
    };
    settings = { ...settings, ...props };
    settings['root'] = {
        domain: settings.domain,
        kid: settings.kid,
    };

    const treeclass = `${settings.treeClass} ${settings.root.domain}`;
    return (
        <div className={treeclass}>
            <TreeLeaf
                domain={settings.root.domain}
                kid={settings.root.kid}
                level={0}
                settings={settings}
                isopen={settings.isOpen}
            />
        </div>
    );
}

function TreeLeaf({ domain, kid, level, isopen, settings }) {
    //console.log(domain, kid);
    const [isOpen, setIsOpen] = useState(isopen);
    const {
        isLoading: isKmapLoading,
        data: kmapdata,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(domain, kid), 'info');

    if (isKmapLoading) {
        return <MandalaSkeleton height={10} width={50} />;
    }
    console.log(kmapdata);
    const children = kmapdata?._childDocuments_?.filter((child) => {
        return child['related_kmaps_node_type'] == 'child';
    });
    if (children?.length > 0) {
        children.sort((a, b) => {
            if (a.related_places_header_s > b.related_places_header_s) {
                return 1;
            }
            if (a.related_places_header_s < b.related_places_header_s) {
                return -1;
            }
            return 0;
        });
    }

    let icon = isOpen ? (
        <FontAwesomeIcon icon={faMinusCircle} />
    ) : (
        <FontAwesomeIcon icon={faPlusCircle} />
    );
    let toggleclass = isOpen ? 'leafopen' : 'leafclosed';
    if (!children || children?.length === 0) {
        icon = '–';
        toggleclass = 'leafend';
    }
    const divclass = `${settings.leafClass} lvl\-${level} ${toggleclass}`;

    //console.log(kmapdata);
    const handleClick = (e) => {
        setIsOpen(!isOpen);
    };
    if (!kmapdata?.header) {
        return null;
    }
    return (
        <div className={divclass}>
            <span
                className={settings.spanClass}
                data-domain={kmapdata?.tree}
                data-id={kmapdata?.id}
                onClick={handleClick}
            >
                <span className={settings.iconClass}>{icon}</span>
                <span className={settings.headerClass}>{kmapdata?.header}</span>
            </span>
            <LeafChildren
                settings={settings}
                children={children}
                level={level}
                isOpen={isOpen}
            />
        </div>
    );
}

function LeafChildren({ settings, children, level, isOpen }) {
    if (!isOpen) {
        return <div className={settings.childrenClass}> </div>;
    }

    return (
        <div className={settings.childrenClass}>
            {children.map((child) => {
                if (child?.related_places_id_s?.includes('-')) {
                    const kidpts = child.related_places_id_s.split('-');
                    return (
                        <TreeLeaf
                            domain={kidpts[0]}
                            kid={kidpts[1]}
                            level={level + 1}
                            settings={settings}
                            isopen={false}
                        />
                    );
                }
            })}
        </div>
    );
}
