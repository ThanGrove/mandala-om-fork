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
import { MandalaPopover } from '../MandalaPopover';
import { Container, Row, Col } from 'react-bootstrap';
import { useSolr } from '../../../hooks/useSolr';

/*
Test element to show all 3 types of trees on a page. Used currently in ContentMain for testing. remove when done.
 */
export function TreeTest(props) {
    return (
        <Container className="tree-test">
            <Row>
                <Col sm={4}>
                    <KmapTree
                        domain="places"
                        kid="13735"
                        elid="places-tree-1"
                    />
                </Col>
                <Col sm={4}>
                    <KmapTree
                        domain="subjects"
                        level="1"
                        elid="subjects-tree-1"
                    />
                </Col>
                <Col sm={4}>
                    <KmapTree domain="terms" level="1" elid="terms-tree-1" />
                </Col>
            </Row>
        </Container>
    );
}

/**
 * Tree initializing function. Can pass any of the props listed in settings, but two basic modes;
 *      - Load a single kmaps as a tree root. Takes `domain` and `kid`. (TODO: Ability to disply ancestors of that node ).
 *      - Load a group of kmap nodes at the same level_i (e.g. subjects and possibly terms). Takes `domain` and `level`.
 *  The former loads a TreeLeaf component, the latter a
 *  TODO: implement terms too.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function KmapTree(props) {
    let settings = {
        domain: 'places',
        kid: 13753,
        level: false,
        treeClass: 'c-kmaptree',
        leafClass: 'c-kmapleaf',
        spanClass: 'c-kmapnode',
        iconClass: 'toggle-icon',
        headerClass: 'label',
        childrenClass: 'children',
        perspective: 'pol.admin.hier',
        isOpen: false,
    };
    settings = { ...settings, ...props };
    settings['root'] = {
        domain: settings.domain,
        kid: settings.kid,
    };
    if (!settings?.elid) {
        const rndid = Math.floor(Math.random() * 999) + 1;
        settings['elid'] = `${settings.domain}-tree-${rndid}`;
    }

    const treeclass = `${settings.treeClass} ${settings.root.domain}`;
    return (
        <div id={settings.elid} className={treeclass}>
            {settings.level && (
                <LeafGroup
                    domain={settings.root.domain}
                    level={settings.level}
                    settings={settings}
                    isopen={settings.isOpen}
                />
            )}
            {!settings.level && (
                <TreeLeaf
                    domain={settings.root.domain}
                    kid={settings.root.kid}
                    level={0}
                    settings={settings}
                    isopen={settings.isOpen}
                />
            )}
        </div>
    );
}

/**
 * A group of tree nodes at the same level, as in Subjects
 *
 * @param domain
 * @param level
 * @param settings
 * @param isopen
 * @constructor
 */
function LeafGroup({ domain, level, settings, isopen }) {
    const qid = `leaf-group-${domain}-${level}`;
    const filter = domain === 'terms' ? 'level_tib.alpha_i' : 'level_i';
    const query = {
        index: 'terms',
        params: {
            q: `tree:${domain} AND ${filter}:${level}`,
            rows: 100,
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
    //console.log("Group Data", groupData, groupError);
    const resdocs = !isGroupError && groupData?.docs ? groupData.docs : [];
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
    return (
        <>
            {resdocs.map((doc) => {
                const kid = doc.id.split('-')[1];
                return (
                    <TreeLeaf
                        domain={doc.tree}
                        kid={kid}
                        level={0}
                        settings={settings}
                    />
                );
            })}
        </>
    );
}

/**
 * A Single Leaf Node from which other may descend it loads a LeafChildren component that shows and empty div
 * if this leaf is "closed" but loads the children if "open"
 *
 * @param domain
 * @param kid
 * @param level
 * @param settings
 * @param isopen
 * @returns {JSX.Element|null}
 * @constructor
 */
function TreeLeaf({ domain, kid, level, settings, isopen }) {
    //console.log(domain, kid);
    const io = isopen ? isopen : false;
    const [isOpen, setIsOpen] = useState(io);
    const {
        isLoading: isKmapLoading,
        data: kmapdata,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(domain, kid), 'info');

    if (isKmapLoading) {
        return (
            <div data-id={queryID(domain, kid)}>
                <MandalaSkeleton height={5} width={50} />
            </div>
        );
    }
    let children = kmapdata?._childDocuments_?.filter((child) => {
        return child['related_kmaps_node_type'] == 'child';
    });
    let childheaders = [];
    children = children?.filter((child) => {
        const headfield = `related_${domain}_header_s`;
        const childhead = child[headfield];
        if (childheaders.includes(childhead)) {
            return false;
        }
        childheaders.push(childhead);
        return true;
    });

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
                <MandalaPopover domain={domain} kid={kid} />
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

/**
 * The Container under a leaf that loads the children for that node, when the node is opened
 *
 * @param settings
 * @param children
 * @param level
 * @param isOpen
 * @returns {JSX.Element}
 * @constructor
 */
function LeafChildren({ settings, children, level, isOpen }) {
    if (!isOpen) {
        return <div className={settings.childrenClass}> </div>;
    }
    const fieldnm = `related_${settings.domain}_id_s`;
    const headernm = `related_${settings.domain}_header_s`;
    if (settings.domain !== 'terms') {
        children.sort((a, b) => {
            if (a[headernm] > b[headernm]) {
                return 1;
            }
            if (a[headernm] < b[headernm]) {
                return -1;
            }
            return 0;
        });
    }
    return (
        <div className={settings.childrenClass}>
            {children.map((child) => {
                if (child[fieldnm] && child[fieldnm].includes('-')) {
                    const kidpts = child[fieldnm].split('-');
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
