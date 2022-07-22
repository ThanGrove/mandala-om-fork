import React, { useEffect, useState } from 'react';
import { useSolr } from '../../hooks/useSolr';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Accordion, Card, Col } from 'react-bootstrap';
import Collapse from 'react-bootstrap/Collapse';
import { HtmlCustom } from './MandalaMarkup';
import { RelatedsIcons } from '../Kmaps/RelatedViewer/RelatedsIcons';
import { useView } from '../../hooks/useView';
import { getHeaderForView } from './utils';

export function FeatureKmapListItem(props) {
    const doc = props.doc;
    const id = props.kid;
    const domain = props.asset_type;
    const kmid = `${domain}-${id}`;
    const kmap_url = `/${domain}/${doc.id}${props.searchParam}`;
    const [areDetails, setAreDetails] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const viewSetting = useView((state) => state[domain]);

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
        if (Array.isArray(altnames) && altnames?.length > 0) {
            altnames.splice(altnames.indexOf(doc.title), 1);
        }
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
    const header = getHeaderForView(doc, viewSetting); // was using {doc.title}
    return (
        <Card className={`p-0 ${domain}`} key={cardkey}>
            <Card.Body className={'p-1 row'}>
                <Col className={'title'} md={8} sm={7}>
                    {areDetails && (
                        <span
                            onClick={() => {
                                setOpen(!isOpen);
                            }}
                            className={
                                isOpen ? 'u-icon__plus open' : 'u-icon__plus'
                            }
                        >
                            {' '}
                        </span>
                    )}
                    <span
                        className={`shanticon-${domain} type icon`}
                        title={domain}
                    />{' '}
                    <Link to={kmap_url} className={'header'}>
                        <HtmlCustom markup={header} />
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
        </Card>
    );
}
