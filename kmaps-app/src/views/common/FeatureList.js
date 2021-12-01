import React, { useEffect, useState } from 'react';
import { FeaturePager } from './FeaturePager/FeaturePager';
import { RelatedsIcons } from '../Kmaps/RelatedViewer/RelatedsIcons';
import _ from 'lodash';
import { HtmlCustom } from './MandalaMarkup';
import { Link, useLocation } from 'react-router-dom';
import { Container, Col, Row, Card, Accordion, Button } from 'react-bootstrap';
import $ from 'jquery';
import { createAssetViewURL } from './FeatureCard/FeatureCard';
import { NoResults } from './FeatureDeck';
import { useSolr } from '../../hooks/useSolr';
import Collapse from 'react-bootstrap/Collapse';

export function FeatureList(props) {
    const myloc = useLocation();
    let searchParam = myloc.search;

    // For subsites in WordPress, there will be a hash. We need to parse the hash and
    // put a parent search param in the urls.
    if (myloc.pathname.includes('collection')) {
        const hashmap = myloc.pathname.split('/').slice(-2);

        // Add parent param which contains the hashmap to the search params
        if (searchParam) {
            searchParam = `?${searchParam}&parent=${hashmap.join('/')}`;
        } else {
            searchParam = `?parent=${hashmap.join('/')}`;
        }
    }

    const inline = props?.inline ? props.inline : false;
    const path = myloc.pathname
        .replace(/\/?any\/?.*/, '')
        .replace(/\/?(deck|gallery|list)\/?.*/, ''); // remove the /any from terms
    let LIST = _.map(props.docs, (doc) => {
        const asset_type = doc?.tree ? doc.tree : doc?.asset_type;
        const mid = doc.id;
        const mykey = `${asset_type}-${mid}}`;

        if (asset_type === 'sources' && !myloc.pathname.includes('/search')) {
            const mu = doc.citation_s.replace(/<\/?a[^>]*>/g, '');
            const doc_url = inline
                ? `${path}/view/${doc.id}${searchParam}`
                : `/${doc.asset_type}/${doc.id}${searchParam}`;

            return (
                <Card className={`p-0 m-1 ${asset_type}`} key={mykey}>
                    <Link to={doc_url}>
                        <HtmlCustom markup={mu} />
                    </Link>
                </Card>
            );
        }

        // FeatureKmapCard for kmaps
        if (['places', 'subjects', 'terms', 'kmaps'].indexOf(asset_type) > -1) {
            return (
                <FeatureKmapListItem
                    asset_type={asset_type}
                    doc={doc}
                    key={mykey}
                    inline={inline}
                    path={path}
                    searchParam={searchParam}
                />
            );
        } else {
            // FeatureAssetCard for assets
            return (
                <FeatureAssetListItem
                    asset_type={asset_type}
                    doc={doc}
                    key={mykey}
                    inline={inline}
                    path={path}
                    searchParam={searchParam}
                />
            );
        }
    });

    if (props?.docs?.length === 0) {
        return (
            <div className={'c-view'}>
                <NoResults />
            </div>
        );
    }

    const output = (
        <div className={'c-view'}>
            <FeaturePager position={'top'} {...props} />
            {LIST}
            <FeaturePager position={'bottom'} {...props} />
        </div>
    );

    return <div className={'c-view__wrapper list'}>{output}</div>;
}

function FeatureAssetListItem(props) {
    let location = useLocation();
    const asset_type = props.asset_type;
    const doc = props.doc;
    const inline = props?.inline || false;

    /* old:
    const doc_url = inline
        ? `${props.path}/view/${doc.id}`
        : `/${doc.asset_type}/${doc.id}`;

     */

    const doc_url = createAssetViewURL(
        doc?.uid,
        asset_type,
        location,
        props.searchParam
    );
    const collection = doc?.collection_nid ? (
        <Link
            to={`/${asset_type}/collection/${doc.collection_nid}${props.searchParam}`}
        >
            {doc.collection_title}
        </Link>
    ) : (
        false
    );

    const caption =
        doc.caption?.length > 0 ? (
            <div className={'caption'}>{doc.caption}</div>
        ) : null;

    let summary = doc.summary;
    if (!summary) {
        summary = '';
    }
    if (summary.indexOf('<p>') > -1) {
        summary = <HtmlCustom markup={summary} />;
    } else if (summary.length > 0) {
        summary = <p>{summary}</p>;
    }
    return (
        <Card
            className={`p-0 m-1 ${asset_type}`}
            key={`${doc.asset_type}-${doc.id}`}
        >
            <Accordion>
                <Card.Body className={'p-1 row'}>
                    <Col className={'title'} md={8} sm={7}>
                        <Accordion.Toggle
                            as={'span'}
                            eventKey="0"
                            onClick={(x) => {
                                let targ = $(x.target);
                                if (
                                    targ &&
                                    !targ.hasClass('u-icon__plus') &&
                                    targ.find('span').length > 0
                                ) {
                                    targ = $(targ.find('span').eq(0));
                                }
                                if (targ.hasClass('openitem')) {
                                    targ.removeClass('openitem');
                                } else {
                                    targ.addClass('openitem');
                                }
                            }}
                        >
                            <span className={'u-icon__plus'}></span>
                        </Accordion.Toggle>
                        <span
                            className={`shanticon-${doc.asset_type} type icon`}
                        />{' '}
                        <Link className={'header'} to={doc_url}>
                            {doc.asset_type !== 'texts' && doc.title}
                            {doc.asset_type === 'texts' && (
                                <>
                                    {doc.book_title_s &&
                                        doc.book_title_s.length > 0 && (
                                            <span title={'Text Title'}>
                                                {doc.book_title_s}
                                            </span>
                                        )}
                                    <span
                                        className={'subtitle'}
                                        title={'Section Title'}
                                    >
                                        {doc.title}
                                    </span>
                                </>
                            )}
                        </Link>
                        {doc.caption != doc.title && caption}
                    </Col>
                    <Col className={'meta'} md={4} sm={5}>
                        <span className={'uid'}>{doc.uid}</span>
                        {collection && (
                            <span className={'coll'}>
                                <span
                                    className={'u-icon__collections icon'}
                                ></span>
                                {collection}
                            </span>
                        )}
                    </Col>
                    <Accordion.Collapse eventKey="0">
                        <Col className={'info'}>
                            <Link to={doc_url}>
                                <span className={'img'}>
                                    <img src={doc.url_thumb} />
                                </span>
                            </Link>
                            <span
                                className={`shanticon-${doc.asset_type} icon`}
                            />{' '}
                            <span className={'text-capitalize'}>
                                {doc.asset_type}
                                {doc.asset_subtype && (
                                    <>
                                        {' / '}
                                        {doc.asset_subtype}
                                    </>
                                )}
                            </span>
                            {doc?.creator && doc.creator.length > 0 && (
                                <span className={'creator text-capitalize'}>
                                    <span className={'u-icon__agents icon'} />
                                    {doc.creator.join(', ')}
                                </span>
                            )}
                            {summary}
                            <div className={'kmap-container'}>
                                <FeatureListAssetRelateds
                                    domain={'places'}
                                    doc={doc}
                                />
                                <FeatureListAssetRelateds
                                    domain={'subject'}
                                    doc={doc}
                                />
                                <FeatureListAssetRelateds
                                    domain={'terms'}
                                    doc={doc}
                                />
                            </div>
                        </Col>
                        {/*</Card.Body>*/}
                    </Accordion.Collapse>
                </Card.Body>
            </Accordion>
        </Card>
    );
}

function FeatureListAssetRelateds(props) {
    const doc = props.doc;
    const domain = props.domain;
    const fldnm = 'kmapid_' + domain + '_idfacet';
    if (doc[fldnm]) {
        return (
            <Col className={`kmaps ${domain}`}>
                <h5>
                    <span className={`u-icon__${domain} icon`}></span>
                    Related {domain}
                </h5>
                <ul>
                    {_.map(doc[fldnm], (kmf) => {
                        const kmpts = kmf.split('|');
                        if (kmpts.length > 1) {
                            return (
                                <li key={kmf}>
                                    {kmpts[0]} ({kmpts[1]})
                                </li>
                            );
                        }
                    })}
                </ul>
            </Col>
        );
    } else {
        return null;
    }
}

function FeatureKmapListItem(props) {
    const doc = props.doc;
    const id = props.kid;
    const domain = props.asset_type;
    const kmid = `${domain}-${id}`;
    const kmap_url = `/${domain}/${doc.id}${props.searchParam}`;
    const [areDetails, setAreDetails] = useState(false);
    const [isOpen, setOpen] = useState(false);

    // Check for related Icons
    const query = {
        index: 'assets',
        params: {
            q: `kmapid:${kmid}`,
            rows: 0,
            'json.facet': '{related_count:{type:terms,field:asset_type}}',
        },
    };
    const { facets } = useSolr(kmid, query);
    let buckets = { length: 0 };
    if (facets && facets.related_count?.buckets) {
        buckets.length = facets.related_count.buckets.length;
        for (let bn = 0; bn < facets.related_count.buckets.length; bn++) {
            const bkt = facets.related_count.buckets[bn];
            buckets[bkt.val] = bkt.count;
        }
    }
    let altnames = doc?.names_txt;

    useEffect(() => {
        // UseEffect for areDetails so it doesn't recalculate!!!
        altnames = doc?.names_txt;
        altnames.splice(altnames.indexOf(doc.title), 1);
        const calcAreDetails =
            doc?.caption ||
            !Array.isArray(altnames) ||
            altnames?.length > 0 ||
            buckets?.length > 0;
        setAreDetails(calcAreDetails);
    }, [doc]);

    const feature_types = (
        <span className={'feature-types'}>
            {_.map(doc.feature_types_ss, (ft, ftind) => {
                return <span key={`${ft}-${ftind}`}>{ft}</span>;
            })}
        </span>
    );
    let ancestors = _.map(doc['ancestor_ids_is'], (idval, idn) => {
        return (
            <span key={`${doc.id}-anc-${idval}-${idn}`}>
                <Link to={`/${domain}/${idval}${props.searchParam}`}>
                    {doc['ancestors_txt'][idn]}
                </Link>
            </span>
        );
    });
    if (domain === 'terms') {
        ancestors = null;
    }
    if (
        domain === 'places' &&
        Array.isArray(ancestors) &&
        ancestors.length > 0
    ) {
        ancestors.shift();
    }

    const caption =
        doc.caption?.length > 0 ? (
            <div className={'caption'}>{doc.caption}</div>
        ) : null;

    const cardkey = `${doc.asset_type}-${doc.id}-card`; //${Date.now()}
    return (
        <Card className={`p-0 ${domain}`} key={cardkey}>
            <Accordion>
                <Card.Body className={'p-1 row'}>
                    <Col className={'title'} md={8} sm={7}>
                        {areDetails && (
                            <span
                                onClick={() => {
                                    setOpen(!isOpen);
                                }}
                                className={
                                    isOpen
                                        ? 'u-icon__plus open'
                                        : 'u-icon__plus'
                                }
                            >
                                {' '}
                            </span>
                        )}
                        <span className={`shanticon-${domain} type icon`} />{' '}
                        <Link to={kmap_url} className={'header'}>
                            {doc.title}
                        </Link>
                        {feature_types}
                        {ancestors && ancestors.length > 0 && (
                            <div className={'ancestors'}>{ancestors}</div>
                        )}
                    </Col>
                    <Col className={'meta'} md={4} sm={5}>
                        <span className={'uid'}>{doc.uid}</span>
                    </Col>
                    <Collapse in={isOpen}>
                        <Col id={`${cardkey}-toggle`} className={'info kmaps'}>
                            {doc.caption && (
                                <p className={'caption'}>{doc.caption}</p>
                            )}
                            {altnames && (
                                <div className="altnames">
                                    {altnames.map((altn, ani) => {
                                        return (
                                            <span
                                                key={`${doc.uid}-altname-${ani}`}
                                                className="altname"
                                            >
                                                <HtmlCustom
                                                    markup={altn.replace(
                                                        /xmllang/g,
                                                        'xmlLang'
                                                    )}
                                                />
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                            <RelatedsIcons domain={domain} kid={doc.id} />
                        </Col>
                    </Collapse>
                </Card.Body>
            </Accordion>
        </Card>
    );
}
