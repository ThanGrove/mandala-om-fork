import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import FancyTree from '../FancyTree';
import { MandalaPopover } from '../common/MandalaPopover';
import { Route, useParams, useRouteMatch } from 'react-router-dom';
import { useHistory } from '../../hooks/useHistory';
import { useKmap } from '../../hooks/useKmap';
import { getProject, queryID } from '../common/utils';
import { PlacesSummary } from './PlacesInfo';
import MandalaSkeleton from '../common/MandalaSkeleton';
import KmapTree from '../KmapTree/KmapTree';

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
    const ancestors = kmap?.ancestor_id_path
        ? kmap.ancestor_id_path.split('/')
        : [];
    if (ancestors?.length > 0) {
        ancestors.pop(); // remove self.
    }

    // Process Children into Different List for Counts
    let adminkids = kmapkids?.filter((cd, ci) => {
        return cd.related_places_relation_code_s === 'administers';
    });
    if (!adminkids) {
        adminkids = [];
    }
    let locatedkids = kmapkids?.filter((cd, ci) => {
        return (
            cd.related_places_relation_code_s ===
            'has.entirely.located.within.it'
        );
    });
    if (!locatedkids) {
        locatedkids = [];
    }

    // Get Unique Feature Types of Children
    let child_ftypes = kmapkids
        ?.filter((cd, ci) => {
            return cd.block_child_type === 'related_places';
        })
        .map((cd, ci) => {
            return cd.related_places_feature_type_s;
        });
    child_ftypes = [...new Set(child_ftypes)];
    child_ftypes.sort(); // Sort feature types

    // Group Children by Feature Type
    const children_by_ftype = child_ftypes?.map((cft, cfti) => {
        const children = kmapkids.filter((kmk, kmki) => {
            return kmk.related_places_feature_type_s === cft;
        });
        return {
            label: cft,
            children: children,
        };
    });

    useEffect(() => {
        $('main.l-column__main').addClass('places');
    }, [kmap]);

    if (!kmap) {
        return <MandalaSkeleton />;
    }

    return (
        <Tabs
            defaultActiveKey="context"
            id="place-kmap-tabs"
            className={'kmaps-related-viewer places'}
        >
            <Tab eventKey="context" title="Place Context">
                <Container
                    fluid
                    className={'c-relplaces-list kmap-related places'}
                >
                    <h4 className={'row head-related'}>
                        Hierarchy of Places Related to {kmap.header}
                    </h4>
                    <Row>
                        <p>
                            {kmap.header} has {ancestors.length} superordinate
                            places and {adminkids.length + locatedkids.length}{' '}
                            subordinate places. It administers{' '}
                            {adminkids.length}, while {locatedkids.length} of
                            the places are simply located in {kmap.header}.
                        </p>
                        <p>
                            One can browse these subordinate places as well as
                            its superordinate categories with the tree below.
                        </p>
                    </Row>
                    <Row>
                        <KmapTree
                            elid={`related-places-tree-${id}`}
                            className="l-place-content-tree"
                            domain="places"
                            selectedNode={`places-${id}`}
                            showAncestors={true}
                            showRelatedPlaces={true}
                        />
                    </Row>
                </Container>
            </Tab>
            <Tab eventKey="related" title="Related Places">
                <Container
                    fluid
                    className={'c-relplaces-list kmap-related places'}
                >
                    <h4 className={'row head-related'}>
                        Places Related to {kmap.header} by Feature Type
                    </h4>
                    <Row>
                        <Col>
                            <p>
                                These are the list of related places by feature
                                type.
                            </p>
                            <p>
                                One can browse these subordinate places as well
                                as its superordinate categories with the tree
                                below. Longer lists can be scrolled to view all
                                items.
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        {children_by_ftype?.length > 0 &&
                            children_by_ftype.map((ftyp, fti) => {
                                return (
                                    <RelatedPlacesFeature
                                        key={`rpf-${fti}`}
                                        label={ftyp?.label}
                                        features={ftyp?.children}
                                    />
                                );
                            })}
                    </Row>
                </Container>
            </Tab>
        </Tabs>
    );
}

export function RelatedPlacesFeature({ label, features }) {
    const numfeat = features?.length;
    const wrapclass = numfeat > 0 ? 'scroll-list-wrap' : '';
    const divclass = numfeat > 0 ? 'scroll-list' : '';
    return (
        <Col className="rel-place-feature" md={3}>
            <div className={wrapclass}>
                <h4>
                    {label} ({numfeat})
                </h4>
                <div className={divclass}>
                    <ul>
                        {features?.map((f, fi) => {
                            return (
                                <li key={`clitem-${fi}`}>
                                    <RelatedPlaceItem clitem={f} />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </Col>
    );
}

function RelatedPlaceItem({ clitem }) {
    return (
        <>
            {' '}
            {clitem.related_places_header_s}
            <MandalaPopover
                domain={'places'}
                kid={clitem.related_places_id_s.replace('places-', '')}
            />
        </>
    );
}
