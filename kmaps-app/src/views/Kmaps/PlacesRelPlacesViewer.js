import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import FancyTree from '../FancyTree';
import { MandalaPopover } from '../common/MandalaPopover';
import { Route, useParams, useRouteMatch } from 'react-router-dom';
import { useHistory } from '../../hooks/useHistory';
import { useKmap } from '../../hooks/useKmap';
import { queryID } from '../common/utils';
import { PlacesSummary } from './PlacesInfo';

export default function PlacesRelPlacesViewer() {
    let { id } = useParams();
    const baseType = 'places';

    const {
        isLoading: isKmapLoading,
        data: kmap,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(baseType, id), 'info');

    const uid = kmap?.uid;
    const kmapkids = kmap?._childDocuments_; // Child documents of this kmaps

    // Get Ancestors for count
    const ancestors = kmap?.ancestor_id_path.split('/');
    if (ancestors?.length > 0) {
        ancestors.pop(); // remove self.
    }

    // Process Children into Different List for Counts
    const adminkids = kmapkids?.filter((cd, ci) => {
        return cd.related_places_relation_code_s === 'administers';
    });
    const locatedkids = kmapkids?.filter((cd, ci) => {
        return (
            cd.related_places_relation_code_s ===
            'has.entirely.located.within.it'
        );
    });

    // Get Unique Feature Types of Children
    let child_ftypes = kmapkids?.map((cd, ci) => {
        if (cd.block_child_type === 'related_places') {
            return cd.related_places_feature_type_s;
        }
    });
    child_ftypes = [...new Set(child_ftypes)];
    child_ftypes.sort(); // Sort feature types

    // Group Children by Feature Type
    const children_by_ftype = child_ftypes?.map((cft, cfti) => {
        return {
            label: cft,
            children: kmapkids.filter((kmk, kmki) => {
                return kmk.related_places_feature_type_s === cft;
            }),
        };
    });

    useEffect(() => {
        $('main.l-column__main').addClass('places');
    }, [kmap]);

    if (!kmap) {
        return <div>Loading</div>;
    }
    return (
        <>
            <PlacesSummary kmapData={kmap} />
            <Tabs
                defaultActiveKey="context"
                id="place-kmap-tabs"
                className={'row'}
            >
                <Tab eventKey="context" title="Place Context">
                    <Container fluid className={'c-relplaces-list places'}>
                        <h2 className={'row head-related'}>
                            Hierarchy of Places Related to {kmap.header}
                        </h2>
                        <Row>
                            <p>
                                {kmap.header} has {ancestors.length}{' '}
                                superordinate places and{' '}
                                {adminkids.length + locatedkids.length}{' '}
                                subordinate places. It administers{' '}
                                {adminkids.length}, while {locatedkids.length}{' '}
                                of the places are simply located in{' '}
                                {kmap.header}.
                            </p>
                            <p>
                                One can browse these subordinate places as well
                                as its superordinate categories with the tree
                                below.
                            </p>
                        </Row>
                        <Row>
                            <FancyTree
                                domain="places"
                                tree="places"
                                descendants={true}
                                directAncestors={true}
                                displayPopup={true}
                                perspective="pol.admin.hier"
                                view="roman.scholar"
                                sortBy="header_ssort+ASC"
                                currentFeatureId={uid}
                            />
                        </Row>
                    </Container>
                </Tab>
                <Tab eventKey="related" title="Related Places">
                    <Container fluid className={'c-relplaces-list places'}>
                        <h2 className={'row head-related'}>
                            Places Related to {kmap.header} by Feature Type
                        </h2>
                        <Row>
                            <Col>
                                <p>
                                    These are the list of related places by
                                    feature type.
                                </p>
                                <p>
                                    One can browse these subordinate places as
                                    well as its superordinate categories with
                                    the tree below.
                                </p>
                            </Col>
                        </Row>
                        <Row>
                            <PlaceRelPlaceFtColumns
                                children={children_by_ftype}
                            />
                        </Row>
                    </Container>
                </Tab>
            </Tabs>
        </>
    );
}

function PlaceRelPlaceFtColumns(props) {
    const childs = props?.children;
    const numcols = 4;
    const collen = Math.ceil(childs.length / numcols);
    let tempchilds = childs;
    const chchunks = ChunkList(tempchilds);
    //console.log("Chunks", chchunks);
    return (
        <>
            {chchunks?.map((chchunk, chki) => {
                return (
                    <Col key={`col-${chki}`} className="md3">
                        {chchunk.map((feattype, cdi) => {
                            if (!feattype?.label || feattype.label === '') {
                                return null;
                            }
                            if (feattype.children.length === 0) {
                                return null;
                            }
                            return (
                                <div key={`col-${chki}-cat-${cdi}`}>
                                    <h3 className={'text-capitalize'}>
                                        {feattype.label}
                                    </h3>
                                    <ul>
                                        {feattype.children.map(
                                            (clitem, cli) => {
                                                if (
                                                    clitem?.related_uid_s?.includes(
                                                        '-'
                                                    )
                                                ) {
                                                    if (
                                                        !clitem.related_places_id_s
                                                    ) {
                                                        return null;
                                                    }
                                                    return (
                                                        <li
                                                            key={`clitem-${cli}`}
                                                        >
                                                            {' '}
                                                            {
                                                                clitem.related_places_header_s
                                                            }
                                                            <MandalaPopover
                                                                domain={
                                                                    'places'
                                                                }
                                                                kid={clitem.related_places_id_s.replace(
                                                                    'places-',
                                                                    ''
                                                                )}
                                                            />
                                                        </li>
                                                    );
                                                }
                                            }
                                        )}
                                    </ul>
                                </div>
                            );
                        })}
                    </Col>
                );
            })}
        </>
    );
}

function ChunkList(childs, numcols = 4) {
    let chunks = [];
    let ct = 0;
    let alldesc = [];
    childs.map((cld) => {
        alldesc = alldesc.concat(cld.children);
    });
    const numpercol = Math.ceil(alldesc.length / numcols);

    let achunk = [];
    childs.map((cld) => {
        // console.log(cld.label, cld.children);
        ct += cld.children.length;
        cld.children.sort((a, b) => {
            if (a.related_places_header_s < b.related_places_header_s) {
                return -1;
            } else if (
                a.related_places_header_s === b.related_places_header_s
            ) {
                return 0;
            }
            return 1;
        });
        if (ct <= numpercol) {
            achunk.push(cld);
        } else {
            let cld1 = JSON.parse(JSON.stringify(cld));
            let lpct = 0;
            chunkloop: do {
                lpct++;
                let cld2 = JSON.parse(JSON.stringify(cld1));
                let allchild = JSON.parse(JSON.stringify(cld1.children));
                let chldnum =
                    allchild.length > numpercol ? numpercol : allchild.length;
                cld1.children = cld1.children.slice(0, chldnum);
                if (cld1.children.length > 0) {
                    achunk.push(cld1);
                }
                chunks.push(achunk);
                achunk = [];
                cld2.children = cld2.children.slice(chldnum);
                if (cld2?.label && !cld2.label.includes('cont.')) {
                    cld2.label = cld2.label + ' (cont.)';
                }
                if (cld2?.children.length > numpercol) {
                    cld1 = JSON.parse(JSON.stringify(cld2));
                } else {
                    achunk.push(cld2);
                    ct = cld2.children.length;
                    break chunkloop;
                }
            } while (lpct < 20);
        }
    });
    chunks.push(achunk);
    return chunks;
}
