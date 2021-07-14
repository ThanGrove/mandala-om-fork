import React, { useEffect } from 'react';
import { useRouteMatch, useParams, Switch, Route } from 'react-router-dom';
import useDimensions from 'react-use-dimensions';
import KmapsMap from '../KmapsMap/KmapsMap';
import { useKmap } from '../../hooks/useKmap';
import {
    findFieldNames,
    getFieldData,
    getSolrCitation,
    getSolrNote,
    queryID,
} from '../../views/common/utils';
import { HtmlCustom } from '../common/MandalaMarkup';
import { Tabs, Tab, Row, Col } from 'react-bootstrap';
import './placesinfo.scss';
import { useHistory } from '../../hooks/useHistory';
import RelatedAssetViewer from './RelatedAssetViewer';
import MandalaSkeleton from '../common/MandalaSkeleton';
import GenericPopover from '../common/GenericPopover';

import {
    PlacesFeatureTypes,
    PlacesRelSubjects,
} from './PlacesRelSubjectsViewer';
import { PlacesGeocodes } from './KmapsPlacesGeocodes';

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
                                    <PlacesNames
                                        id={queryID(baseType, id)}
                                        kmap={kmapData}
                                    />
                                </Tab>
                                <Tab eventKey="location" title="Location">
                                    <PlacesLocation
                                        kmap={kmapData}
                                        id={queryID(baseType, id)}
                                    />
                                </Tab>

                                <Tab eventKey="ids" title="Ids">
                                    <PlacesIds
                                        kmap={kmapData}
                                        id={queryID(baseType, id)}
                                    />
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
    // See if there is some kind of image url
    let imgurl =
        kmapData?.illustration_mms_url?.length > 0
            ? kmapData.illustration_mms_url[0]
            : false;
    imgurl =
        !imgurl && kmapData?.illustration_external_url?.length > 0
            ? kmapData?.illustration_external_url[0]
            : imgurl;
    const capnames = findFieldNames(kmapData, 'caption_', 'starts');
    // TODO: Currently just uses the first caption field it finds. Make this more robust
    const cap =
        capnames.length > 0 ? (
            <HtmlCustom markup={kmapData[capnames[0]][0]} />
        ) : null;
    const plimg = imgurl ? (
        <Col md={4} className={'img featured'}>
            <img src={imgurl} alt={kmapData.header} />
            {cap}
        </Col>
    ) : null;
    itemSummary = (
        <Row className={'c-nodeHeader-itemSummary'}>
            {/* Add column with illustration if exists (if not is null) */}
            {plimg}
            <Col md={8}>
                {/* Feature type list if exists */}
                <PlacesFeatureTypes parent={kmapData} />
                <PlacesRelSubjects children={kmapData?._childDocuments_} />
                {/* Custom Html summary if exists */}
                {/* TODO: account for other language summaries */}
                {kmapData?.summary_eng?.length > 0 && (
                    <HtmlCustom markup={kmapData.summary_eng[0]} />
                )}
            </Col>
        </Row>
    );
    return itemSummary;
}

export function PlacesNames(props) {
    // Places Name tab content. Displays main name, alternative names and etymologies
    // Code for query from Bill's code, searchui.js function GetChildNamesFromID()
    // Code for processing results from places.js line 446ff
    let etymologies = [];
    if (!props?.kmap) {
        return <MandalaSkeleton />;
    }
    const namelist = props?.kmap._childDocuments_.filter((cd, i) => {
        return cd?.block_child_type === 'related_names';
    });
    const nameobjs = namelist.map((o, ind) => {
        // console.log('o', o);

        return {
            label: o.related_names_header_s, // Label
            lang: o.related_names_language_s, // Language
            rel: o.related_names_relationship_s, // Relationship
            write: o.related_names_writing_system_s, // Writing system
            ety: o.related_names_etymology_s, // Etymology
            path: o.related_names_path_s, // Path
            tab: o.related_names_level_i - 1,
            date: getTimeUnits(o, 'related_names'),
            note: getRelNameNote(o),
            citation: getSolrCitation(
                o,
                'Citation',
                'related_names_citation_references_ss'
            ),
        };
    });
    nameobjs.sort(function (a, b) {
        // Sort by path
        if (a.path > b.path) return 1;
        // Higher
        else if (a.path < b.path) return -1;
        // Lower
        else return 0; // The same
    });
    etymologies = nameobjs.filter((c, i) => {
        return c.ety && c.ety.length > 0;
    });

    return (
        <Row className={'c-place-names'}>
            <Col>
                {/* <h1>Names</h1> */}
                {nameobjs?.length === 0 && <p>No names found!</p>}
                {nameobjs?.length > 0 && (
                    <>
                        {nameobjs.map((l, i) => {
                            const llang = l?.lang ? `${l.lang}, ` : '';
                            const lwrite = l?.write ? ` ${l.write}, ` : '';
                            return (
                                <div
                                    key={`place-name-${i}`}
                                    className={`lv-${l.tab}`}
                                >
                                    <strong>{l.label} </strong> ({llang}
                                    {lwrite}
                                    {l.rel}
                                    {l.date}
                                    <span className="text-nowrap">
                                        ) {l.citation}
                                        {l.note}
                                    </span>
                                </div>
                            );
                        })}
                    </>
                )}
            </Col>

            <PlaceNameEtymologies etymologies={etymologies} />
        </Row>
    );
}

/**
 * Special function to get related name notes because such notes have the title, author, and content each in a
 * separate field in the Solr record. For generic notes, use utils.js/getSolrNote(data, title, field)
 *
 * @param nameobj
 * @returns {boolean|{title: string, content: boolean, authors: boolean}}
 */
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
        return null;
    }
    if (typeof note['content'] !== 'string') {
        note['content'] = note['content'].join(', ');
    }
    if (note['authors']) {
        note['content'] += ` (${note['authors']})`;
    }
    const noteel = <GenericPopover title={note.title} content={note.content} />;
    return noteel;
}

function getTimeUnits(nameobj, pref) {
    const fieldnm = `${pref}_time_units_ss`;
    if (Object.keys(nameobj).includes(fieldnm)) {
        let val = nameobj[fieldnm];
        if (Array.isArray(val)) {
            val = val.join(', ');
        }
        if (typeof val === 'string') {
            val = val.trim();
            if (!isNaN(val) && parseInt(val) < 0) {
                val += ' BCE';
            } else {
                val += ' CE';
            }
            return `, ${val}`;
        }
    }
    return '';
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
    const kmap = props?.kmap;
    const data_s = kmap?.shapes_centroid_grptgeom;
    const data = data_s ? JSON.parse(data_s) : false;
    let coords = false;

    const {
        isLoading: isFullDataLoading,
        data: fullData,
        isError: isFullDataError,
        error: fullDataError,
    } = useKmap(props?.kmap?.id, 'infofull');

    if (isFullDataLoading) {
        return <MandalaSkeleton />;
    }

    const children = fullData?._childDocuments_
        ? fullData._childDocuments_
        : [];
    let shape = children.filter((c, i) => {
        return c.block_child_type === 'places_shape';
    });
    shape = shape.length > 0 ? shape[0] : false;
    let note = getSolrNote(shape, 'Note on Location');

    // Date (time_units_ss)
    let shapedate = getFieldData(shape, 'time_units_ss');
    shapedate =
        shapedate && shapedate?.length > 0 ? (
            <span className="refdate shape">{shapedate}</span>
        ) : null;

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

    let altchild = children.filter((c, i) => {
        return c.id.includes('altitude');
    });
    const citesuff = '_citation_references_ss';
    const placerefs = Object.keys(kmap).filter((k) => k.endsWith(citesuff));
    const refs = placerefs.map((fnm, n) => {
        const fldpref = fnm.replace(citesuff, '');
        const valfld = `${fldpref}_value_s`;
        const timefld = `${fldpref}_time_units_ss`;
        let datestr = kmap[timefld] ? ` (${kmap[timefld]})` : '';
        if (!datestr) {
            datestr = '';
        }
        if (!kmap[valfld]) {
            kmap[valfld] = '';
        }
        const mu = `<p>See ${kmap[fnm]} ${kmap[valfld]}${datestr}</p>`;
        return <HtmlCustom key={`place-info-custom-ref-${n}`} markup={mu} />;
    });

    // Figure out Altitude Display
    let altitude = null;
    if (altchild && altchild?.length > 0) {
        altchild = altchild[0];
        if (altchild?.estimate_s?.length > 0) {
            altitude = altchild.estimate_s;
        } else if (altchild?.average_i) {
            altitude = altchild.average_i;
            if (altchild?.unit_s) {
                altitude += ` ${altchild.unit_s}`;
            }
        }
        if (altchild?.time_units_ss?.length > 0) {
            altitude += ` (${altchild.time_units_ss[0]})`;
        }
        altitude = (
            <p>
                <span className={'altitude'}>↑ </span> <label>Alt</label>
                {` ${altitude}`}
            </p>
        );
    }

    return (
        <div key={`${kmap.uid}-placeinfo`} className={'c-place-location'}>
            {coords && (
                <p>
                    <span className={'icon shanticon-places'}> </span>{' '}
                    <label>Lat/Long</label> {coords}
                    {shapedate}
                    {note}
                </p>
            )}
            {altitude}
            {refs}
            {!coords && (!altchild || altchild?.length === 0) && (
                <p>
                    There is no location information for{' '}
                    {props.kmap.header ||
                        'this location, because no record was found.'}
                </p>
            )}
        </div>
    );
}

export function PlacesIds({ kmap }) {
    return (
        <div key={`${kmap.uid}-placeids`} className={'c-place-ids'}>
            <br />
            <p>
                <strong>Mandala ID: </strong> {kmap.id}
            </p>
            <p>
                <strong>Place ID: </strong> F{kmap.id.replace('places-', '')}
            </p>
            <PlacesGeocodes kmap={kmap} />
        </div>
    );
}
