import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { createAssetViewURL } from './FeatureCard/FeatureCard';
import { HtmlCustom } from './MandalaMarkup';
import { Accordion, Card, Col, Collapse } from 'react-bootstrap';
import $ from 'jquery';
import _ from 'lodash';
import { MandalaPopover } from './MandalaPopover';
import { fixEntities } from './utils';
import useAsset from '../../hooks/useAsset';

export function FeatureAssetListItem(props) {
    let location = useLocation();
    let asset_type = props.asset_type;
    const doc = props.doc;
    const inline = props?.inline || false;
    const [areDetails, setAreDetails] = useState(false);
    const [isOpen, setOpen] = useState(false);

    /* old:
  const doc_url = inline
      ? `${props.path}/view/${doc.id}`
      : `/${doc.asset_type}/${doc.id}`;

   */
    let uid = doc?.uid;
    let doc_url = createAssetViewURL(
        doc?.uid,
        asset_type,
        location,
        props.searchParam,
        inline
    );
    if (asset_type === 'mandala' && doc?.asset_uid_s) {
        uid = doc.asset_uid_s;
        doc_url = '/' + uid.replace('-', '/');
        asset_type = doc?.asset_subtype;
    }
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

    let under_title = doc.caption != doc.title ? caption : null;
    if (asset_type === 'sources' || asset_type === 'texts') {
        if (doc?.creator && doc.creator !== '') {
            const creator = Array.isArray(doc?.creator)
                ? doc.creator.join(', ')
                : doc.creator;
            under_title = fixEntities(creator);
        } else if (doc?.asset_type === 'mandala') {
            under_title = <FeatureAssetLinkedCreator auid={doc?.asset_uid_s} />;
        } else {
            under_title = 'Anonymous';
        }
        under_title = (
            <div className="source-authors">
                <span className="icon shanticon-agents"> </span>
                {under_title}
            </div>
        );
    }
    let summary = doc?.summary;
    if (summary) {
        if (summary?.indexOf('<p>') > -1) {
            summary = <HtmlCustom markup={summary} />;
        } else if (summary.length > 0) {
            summary = <p>{summary}</p>;
        }
    }
    const citation =
        doc?.citation_s && doc?.citation_s?.length > 10 ? (
            <HtmlCustom markup={doc.citation_s} nolinks={true} />
        ) : null;

    useEffect(() => {
        if (summary || citation) {
            setAreDetails(true);
        }
    }, []);

    return (
        <Card
            className={`p-0 m-1 ${asset_type}`}
            key={`${asset_type}-${doc.id}`}
        >
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
                        className={`shanticon-${asset_type} type icon`}
                        title={asset_type}
                    ></span>{' '}
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
                    {under_title}
                </Col>
                <Col className={'meta'} md={4} sm={5}>
                    <span className={'uid'}>{uid}</span>
                    {collection && (
                        <span className={'coll'}>
                            <span className={'u-icon__collections icon'}></span>
                            {collection}
                        </span>
                    )}
                </Col>
                <Collapse in={isOpen}>
                    <Col className={'info'}>
                        {doc?.url_thumb && doc.url_thumb !== '' && (
                            <Link to={doc_url}>
                                <span className={'img'}>
                                    <img src={doc.url_thumb} />
                                </span>
                            </Link>
                        )}
                        <span
                            className={`shanticon-${doc.asset_type} icon`}
                            title={doc.asset_type}
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
                        {doc?.asset_type !== 'sources' &&
                            doc?.asset_type !== 'texts' &&
                            doc?.creator &&
                            doc.creator.length > 0 && (
                                <span className={'creator text-capitalize'}>
                                    <span className={'u-icon__agents icon'} />
                                    {doc.creator.join(', ')}
                                </span>
                            )}
                        {summary}
                        {citation && (
                            <div className="citation">
                                {/*<strong>Full Citation: </strong>*/}{' '}
                                {citation}
                            </div>
                        )}
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
                </Collapse>
            </Card.Body>
        </Card>
    );
}

function FeatureListAssetRelateds(props) {
    const doc = props.doc;
    const domain = props.domain;
    const fldnm = 'kmapid_' + domain + '_idfacet';
    if (doc[fldnm]) {
        return (
            <div className={`kmaps ${domain}`}>
                <ul className="list-inline">
                    <li
                        key={`kmaps-${domain}-items-icon`}
                        className="list-inline-item"
                    >
                        <span className={`u-icon__${domain} icon`}></span>
                    </li>
                    {_.map(doc[fldnm], (kmf) => {
                        const kmpts = kmf.split('|');
                        if (kmpts.length > 1) {
                            const idpts = kmpts[1].split('-');
                            return (
                                <li key={kmf} className="list-inline-item">
                                    <MandalaPopover
                                        domain={idpts[0]}
                                        kid={idpts[1]}
                                        children={kmpts[0]}
                                    />
                                </li>
                            );
                        }
                    })}
                </ul>
            </div>
        );
    } else {
        return null;
    }
}

function FeatureAssetLinkedCreator({ auid }) {
    const [asset_type, nid] = auid.split('-');

    const {
        isLoading: isAssetLoading,
        data: assetData,
        isError: isAssetError,
        error: assetError,
    } = useAsset(asset_type, nid);

    if (isAssetError || isAssetLoading) {
        return null;
    }
    console.log('assetdata', assetData);
    let creator = Array.isArray(assetData?.creator)
        ? assetData.creator.join(', ')
        : assetData.creator;
    creator = fixEntities(creator);

    return <>{creator}</>;
}
