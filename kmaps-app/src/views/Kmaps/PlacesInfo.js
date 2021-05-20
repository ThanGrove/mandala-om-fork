import React, { useContext, useEffect } from 'react';
import { useRouteMatch, useParams, Switch, Route } from 'react-router-dom';
import useDimensions from 'react-use-dimensions';
import KmapsMap from '../KmapsMap/KmapsMap';
import { useSolr } from '../../hooks/useSolr';
import { useKmap } from '../../hooks/useKmap';
import { queryID } from '../../views/common/utils';
import { MandalaPopover } from '../../views/common/MandalaPopover';
import { HtmlCustom } from '../common/MandalaMarkup';
import { Tabs, Tab, Row, Col } from 'react-bootstrap';
import './placesinfo.scss';
import { useHistory } from '../../hooks/useHistory';
import RelatedAssetViewer from './RelatedAssetViewer';
import MandalaSkeleton from '../common/MandalaSkeleton';
import GenericPopover from '../common/GenericPopover';

const RelatedsGallery = React.lazy(() =>
    import('../../views/common/RelatedsGallery')
);
const PlacesRelPlacesViewer = React.lazy(() =>
    import('./PlacesRelPlacesViewer')
);
const PlacesRelSubjectsViewer = React.lazy(() =>
    import('./PlacesRelSubjectsViewer')
);
export default function PlacesInfo(props) {
    let { path } = useRouteMatch();
    let { id } = useParams();
    const baseType = 'places';
    const addPage = useHistory((state) => state.addPage);

    const {
        isLoading: isKmapLoading,
        data: kmapData,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(baseType, id), 'info');
    const {
        isLoading: isAssetLoading,
        data: kmasset,
        isError: isAssetError,
        error: assetError,
    } = useKmap(queryID(baseType, id), 'asset');

    useEffect(() => {
        if (kmapData?.header) {
            addPage('places', kmapData.header, window.location.pathname);
        }
    }, [kmapData]);

    const [mapRef, mapSize] = useDimensions();

    const fid = kmasset?.id;

    if (isKmapLoading || isAssetLoading) {
        return (
            <div id="place-kmap-tabs">
                <MandalaSkeleton />
            </div>
        );
    } else if (isKmapError) {
        return <div id="place-kmap-tabs">Error: {kmapError.message}</div>;
    } else if (isAssetError) {
        return <div id="place-kmap-tabs">Error: {assetError.message}</div>;
    }

    return (
        <>
            <React.Suspense fallback={<MandalaSkeleton />}>
                <Switch>
                    <Route exact path={path}>
                        <PlacesSummary kmapData={kmapData} />
                        <div ref={mapRef}>
                            <Tabs
                                defaultActiveKey="map"
                                id="place-kmap-tabs"
                                mountOnEnter={true}
                            >
                                <Tab eventKey="map" title="Map">
                                    {mapSize.width && (
                                        <KmapsMap
                                            fid={fid}
                                            languageLayer="roman_popular"
                                            height={mapSize.height}
                                            width={mapSize.width}
                                        />
                                    )}
                                </Tab>
                                <Tab eventKey="names" title="Names">
                                    <PlacesNames id={queryID(baseType, id)} />
                                </Tab>
                                <Tab eventKey="location" title="Location">
                                    <PlacesLocation kmap={kmapData} />
                                </Tab>
                            </Tabs>
                        </div>
                    </Route>
                    <Route
                        path={[`${path}/related-:relatedType/view/:assetId`]}
                    >
                        <RelatedAssetViewer parentData={kmapData} />
                    </Route>
                    <Route
                        path={[
                            `${path}/related-places/:viewMode`,
                            `${path}/related-places`,
                        ]}
                    >
                        <PlacesRelPlacesViewer />
                    </Route>
                    <Route
                        path={[
                            `${path}/related-subjects/:viewMode`,
                            `${path}/related-subjects`,
                        ]}
                    >
                        <PlacesRelSubjectsViewer />
                    </Route>
                    <Route
                        path={[
                            `${path}/related-:relatedType/:viewMode`,
                            `${path}/related-:relatedType`,
                        ]}
                    >
                        <RelatedsGallery baseType="places" />
                    </Route>
                </Switch>
            </React.Suspense>
        </>
    );
}

export function PlacesSummary({ kmapData }) {
    // Kmaps Summary (Mainly for Places)
    let itemSummary = null;
    if (
        kmapData?.illustration_mms_url?.length > 0 ||
        kmapData?.summary_eng?.length > 0
    ) {
        itemSummary = (
            <Row className={'c-nodeHeader-itemSummary'}>
                {/* Add column with illustration if exists */}
                {kmapData?.illustration_mms_url?.length > 0 && (
                    <Col md={3} className={'img featured'}>
                        <img
                            src={kmapData.illustration_mms_url[0]}
                            alt={kmapData.header}
                        />
                    </Col>
                )}

                {/* Add column with summary if exists */}
                {(kmapData?.summary_eng?.length > 0 ||
                    kmapData?.feature_type_ids?.length > 0) && (
                    <Col>
                        {/* Feature type list if exists */}
                        {kmapData?.feature_type_ids?.length > 0 && (
                            <p className={'featureTypes'}>
                                <label>Feature Types</label>
                                {kmapData.feature_type_ids.map((ftid, ftn) => {
                                    return (
                                        <MandalaPopover
                                            key={`place-popover-${ftn}`}
                                            domain={'subjects'}
                                            kid={ftid}
                                            children={
                                                kmapData.feature_types[ftn]
                                            }
                                        />
                                    );
                                })}
                            </p>
                        )}
                        {/* Custom Html summary if exists */}
                        {/* TODO: account for other language summaries */}
                        {kmapData?.summary_eng?.length > 0 && (
                            <HtmlCustom markup={kmapData.summary_eng[0]} />
                        )}
                    </Col>
                )}
            </Row>
        );
    }
    return itemSummary;
}

export function PlacesNames(props) {
    // Places Name tab content. Displays main name, alternative names and etymologies
    // Code for query from Bill's code, searchui.js function GetChildNamesFromID()
    // Code for processing results from places.js line 446ff

    const query = {
        index: 'terms',
        params: {
            fl: `uid,[child childFilter=id:${props.id}_names-* parentFilter=block_type:parent]`,
            q: `uid:${props.id}`,
            wt: 'json',
            rows: 300,
        },
    }; // Need to make new query because _childDocuments_ does not contain all name children returned by this query
    const namedoc = useSolr(`place-${props.id}-names`, query);
    let childlist = [];
    let etymologies = [];
    if (namedoc?.data?.numFound && namedoc.data.numFound > 0) {
        childlist = namedoc.data.docs[0]._childDocuments_;
        childlist = childlist.map((o, ind) => {
            // console.log('o', o);
            return {
                label: o.related_names_header_s, // Label
                lang: o.related_names_language_s, // Language
                rel: o.related_names_relationship_s, // Relationship
                write: o.related_names_writing_system_s, // Writing system
                ety: o.related_names_etymology_s, // Etymology
                path: o.related_names_path_s, // Path
                tab: o.related_names_level_i - 1,
                note: getRelNameNote(o),
            };
        });
        childlist.sort(function (a, b) {
            // Sort by path
            if (a.path > b.path) return 1;
            // Higher
            else if (a.path < b.path) return -1;
            // Lower
            else return 0; // The same
        });
        etymologies = childlist.filter((c, i) => {
            return c.ety && c.ety.length > 0;
        });
    }

    return (
        <Row className={'c-place-names'}>
            <Col>
                <h1>Names</h1>
                {childlist.map((l, i) => {
                    return (
                        <div key={`place-name-${i}`} className={`lv-${l.tab}`}>
                            <strong>{l.label} </strong>&nbsp; ({l.lang},{' '}
                            {l.write}, {l.rel}){' '}
                            {l.note && (
                                <GenericPopover
                                    title={l.note.title}
                                    content={l.note.content}
                                />
                            )}
                        </div>
                    );
                })}
            </Col>

            <PlaceNameEtymologies etymologies={etymologies} />
        </Row>
    );
}

function getRelNameNote(nameobj) {
    const note = {
        title: 'Related Name Note',
        authors: false,
        content: false,
    };
    const notekeys = Object.keys(nameobj).filter((k) => {
        return k.includes('_note_');
    });
    notekeys.forEach((k) => {
        let val = nameobj[k];
        if (k.includes('_title_')) {
            note['title'] = val;
        } else if (k.includes('_authors_')) {
            note['authors'] = val.join(', ');
        } else {
            note['content'] = val;
        }
    });
    if (!note['content']) {
        return false;
    }
    if (typeof note['content'] !== 'string') {
        note['content'] = note['content'].join(', ');
    }
    if (note['authors']) {
        note['content'] += ` (${note['authors']})`;
    }
    return note;
}

function PlaceNameEtymologies({ etymologies }) {
    if (!etymologies || etymologies?.length == 0) {
        return null;
    }
    return (
        <Col>
            <h1>Etymology</h1>
            {etymologies.map((l, i) => {
                if (l.ety) {
                    return (
                        <div key={`place-etymology-${i}`}>
                            <strong>{l.label} </strong>:
                            <HtmlCustom
                                markup={l.ety.replace(/<p\/?>/g, ' ')}
                            />
                        </div>
                    );
                }
            })}
        </Col>
    );
}

export function PlacesLocation(props) {
    // Places "Location" tab contents
    // Uses centroid for lat long and child altitude for altitude and displays these is they exist
    const data_s = props?.kmap?.shapes_centroid_grptgeom;
    const data = data_s ? JSON.parse(data_s) : false;
    let coords = false;
    if (
        data &&
        data?.features &&
        data.features.length > 0 &&
        data.features[0].geometry?.coordinates
    ) {
        let codata = data.features[0].geometry.coordinates;
        let lat = Math.round(codata[1] * 100000) / 100000;
        let lng = Math.round(codata[0] * 100000) / 100000;
        coords = `${lat}º N, ${lng}º E`;
    }

    const altchild = props?.kmap?._childDocuments_.filter((c, i) => {
        return c.id.includes('altitude');
    });

    return (
        <div className={'c-place-location'}>
            {coords && (
                <p>
                    <span className={'icon shanticon-places'}> </span>{' '}
                    <label>Lat/Long</label> {coords}
                </p>
            )}
            {altchild && altchild?.length > 0 && altchild[0]?.estimate_s && (
                <p>
                    <span className={'altitude'}>↑ </span> <label>Alt</label>{' '}
                    {altchild &&
                        altchild?.length > 0 &&
                        altchild[0]?.estimate_s}
                </p>
            )}
            {!coords && altchild && altchild?.length === 0 && (
                <p>There is no location information for {props.kmap.header}</p>
            )}
        </div>
    );
}
