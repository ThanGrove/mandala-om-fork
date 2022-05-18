import Card from 'react-bootstrap/Card';
import { useLocation, Link, useParams } from 'react-router-dom';
import _ from 'lodash';
// import Accordion from "react-bootstrap/Accordion";
import * as PropTypes from 'prop-types';
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { KmapLink } from '../KmapLink';
import { SmartTitle } from '../SmartTitle';
import { SmartPath } from '../SmartPath';
import { SmartRelateds } from '../SmartRelateds';
import { browseSearchToggle } from '../../../hooks/useBrowseSearchToggle';

import './FeatureCard.scss';
import { HtmlCustom } from '../MandalaMarkup';
import { capitalize, isAssetType } from '../utils';
// import '../../../css/fonts/shanticon/style.css';
// import '../../../_index-variables.scss';

// import {  } from 'react-icons/bs';

// Map of special type glyphs:  This uses a compound key of "<asset_type>/<asset_subtype>" so that special glyphs can be used.
// If a type/subtype does not appear in this map, then the asset_type glyph is used.  -- ys2n
const typeGlyphMap = {
    'audio-video/video': <span className={'icon color-invert u-icon__video'} />,
    'audio-video/audio': <span className={'icon color-invert u-icon__audio'} />,
};

export function FeatureCard(props) {
    //console.log('props in feature card', props);
    const doc = props.doc; // Solr doc for the asset
    const inline = props.inline || false;

    //console.log('params', params);
    let location = useLocation();
    let searchParam = location.search;
    // For subsites in WordPress, there will be a hash. We need to parse the hash and
    // put a parent search param in the urls.
    if (location.pathname.includes('collection')) {
        const hashmap = location.pathname.split('/').slice(-2);

        // Add parent param which contains the hashmap to the search params
        if (searchParam) {
            searchParam = `?${searchParam}&parent=${hashmap.join('/')}`;
        } else {
            searchParam = `?parent=${hashmap.join('/')}`;
        }
    }

    const setBrowse = browseSearchToggle((state) => state.setBrowse);
    const [modalShow, setModalShow] = React.useState(false);

    // Determine asset type and subtype
    let asset_type = doc.asset_type;
    let asset_subtype = doc.asset_subtype;
    // Is the asset and asset link that points to another asset.
    const is_link = asset_type === 'mandala';

    // if it is an asset lnk, use subtype and subsubtype
    if (is_link) {
        asset_type = asset_subtype;
        asset_subtype = doc?.asset_subsubtype;
    }

    let subTypeGlyph = typeGlyphMap[asset_type + '/' + asset_subtype];
    const typeGlyph = doc.uid ? (
        subTypeGlyph ? (
            subTypeGlyph
        ) : (
            <span className={'icon color-invert u-icon__' + asset_type}></span>
        )
    ) : null;

    const assetGlyph =
        doc.uid && asset_type !== 'images' && asset_type !== 'audio-video' ? (
            <span className={'icon u-icon__' + asset_type}></span>
        ) : null;
    // console.log('asset type', asset_type);
    const viewer =
        asset_type === 'collections'
            ? asset_subtype + '/collection'
            : asset_type;

    const related_places = _.uniq(doc.kmapid_places_idfacet).map((x, i) => {
        const [name, id] = x.split('|');
        return (
            <div key={i} className="c-card__content-field shanti-field-place">
                <span className="icon shanti-field-content">
                    <KmapLink uid={id} label={name} />
                </span>
            </div>
        );
    });

    const related_subjects = _.uniq(doc.kmapid_subjects_idfacet).map((x, i) => {
        const [name, id] = x.split('|');
        return (
            <div key={i} className="c-card__content-field shanti-field-subject">
                <span className="icon shanti-field-content">
                    <KmapLink uid={id} label={name} />
                </span>
            </div>
        );
    });

    const feature_types = _.uniq(doc.feature_types_idfacet).map((x, i) => {
        const [name, id] = x.split('|');
        return (
            <div
                key={id}
                className="c-card__content-field shanti-field-subject"
            >
                <span className="icon shanti-field-content">
                    <KmapLink uid={id} label={name} />
                </span>
            </div>
        );
    });

    let date = false;
    if (doc?.date_start) {
        let dtobj = new Date(doc.date_start);
        const yr = dtobj?.getUTCFullYear();
        // Was using 9999 as "no date" year but switching to 0000
        if (yr === 0 || yr === 9999) {
            dtobj = new Date(doc.node_created);
        }
        date = dtobj.toLocaleDateString();
    }

    // Set Creator variable for display in card
    let creator = doc.creator;
    if (Array.isArray(creator)) {
        if (creator.length > 4) {
            creator = creator.slice(0, 4).join(', ') + '…';
        } else if (creator.length > 0) {
            creator = creator.join(', ');
        } else if (doc?.node_user_full_s) {
            creator = doc.node_user_full_s;
        } else {
            creator = doc?.node_user;
        }
    }
    if (typeof creator === 'object') {
        creator = creator.toString();
    }
    if (creator) {
        creator = creator.replace(/&amp;/g, '&');
    }

    let footer_coll_link = doc?.collection_uid_path_ss;
    if (footer_coll_link && footer_coll_link.length > 0) {
        footer_coll_link = footer_coll_link[footer_coll_link.length - 1];
        footer_coll_link =
            '/' +
            footer_coll_link.replace('-collection-', '/collection/') +
            searchParam;
    }
    const footer_text = doc.collection_title ? (
        <Link to={footer_coll_link}>
            <span className={'u-icon__collections icon'}>
                {' '}
                {doc.collection_title}{' '}
            </span>
        </Link>
    ) : (
        <span>
            {doc.ancestors_txt && asset_type !== 'terms' && (
                <div className="info shanti-field-path">
                    <span
                        className={
                            'shanti-field-content icon u-icon__' + asset_type
                        }
                    >
                        <SmartPath doc={doc} />
                    </span>
                </div>
            )}
        </span>
    );

    let relateds = null;

    if (asset_type === 'places') {
        // relateds = related_subjects;
        relateds = feature_types;
    } else if (asset_type === 'subjects') {
        relateds = related_places;
    } else if (asset_type === 'terms') {
        relateds = related_subjects;
    }

    // console.log("FOOTERING: ", doc);
    let avuid = doc.uid;
    let avid = doc.id;
    // Pages need to link to their parent text
    if (asset_type === 'texts' && asset_subtype === 'page') {
        avuid = doc.service + '_' + doc.book_nid_i;
        avid = doc.book_nid_i + '#shanti-texts-' + doc.id;
    }

    let asset_view = inline
        ? createAssetViewURL(avuid, asset_type, location, searchParam, inline)
        : `/${viewer}/${avid}${searchParam}`;

    // If it is an asset link, show it within its manddala collection
    if (is_link) {
        const asset_path = doc.asset_uid_s
            .replace(/\-/g, '/')
            .replace('audio/video', 'audio-video');
        asset_view = `/mandala/collection/${doc.collection_nid}/${asset_path}`;
    }
    /* Duplicates title in Texts. Not sure why this is here? ndg 2/7/22
    const subtitle =
        asset_type === 'texts' ? (
            <span className={'subtitle'}>{doc.title}</span>
        ) : (
            ''
        );
    */
    const subtitle = null;
    const myuid = `${asset_type.charAt(0).toUpperCase()}${asset_type.substr(
        1
    )}-${doc.id}`;
    let mycaption = doc?.caption?.length > 0 ? doc.caption : null;
    const mupatt = /<\/(p|a|header|h1|h2|span|ul|ol)>/; // Search for various closing tags
    if (mupatt.exec(mycaption)) {
        mycaption = <HtmlCustom markup={mycaption} />;
    }

    let thumb_url = doc.url_thumb
        ? doc.url_thumb
        : process.env.PUBLIC_URL + '/img/gradient.jpg';
    thumb_url = thumb_url.replace('!200,200', '!900,900');

    // Asset link type
    let asset_link_type = null;
    if (is_link) {
        const atype = doc.asset_subtype;
        let atype_display = capitalize(atype).replace(/s$/, ''); // Take of s plural in some asset types
        asset_link_type = (
            <ListGroup.Item className={'c-card__listItem--linktype'}>
                <div className="info shanti-field-linktype">
                    <span
                        className={`u-icon__${atype} icon shanti-field-content`}
                    >
                        {atype_display}
                    </span>
                </div>
            </ListGroup.Item>
        );
    }

    return (
        <Card key={doc.uid} className={'c-card__grid--' + asset_type}>
            <Link
                to={asset_view}
                className={'c-card__link--asset c-card__wrap--image'}
                onClick={setBrowse}
            >
                <Card.Img
                    className={'c-card__grid__image--top'}
                    variant="top"
                    src={thumb_url}
                />
                <div className={'c-card__grid__glyph--type color-invert'}>
                    {typeGlyph}
                </div>
                <div className={'c-card__grid__glyph--asset'}>{assetGlyph}</div>
            </Link>

            <Card.Body>
                <Card.Title>
                    <Link
                        to={asset_view}
                        className={'c-card__link--asset'}
                        onClick={setBrowse}
                    >
                        <SmartTitle doc={doc} />
                        {subtitle}
                    </Link>
                </Card.Title>

                <ListGroup>
                    {asset_link_type}
                    <ListGroup.Item className={'c-card__listItem--creator'}>
                        {creator && (
                            <div className="info shanti-field-creator">
                                <span className="u-icon__agents icon shanti-field-content">
                                    {creator}
                                </span>
                            </div>
                        )}
                    </ListGroup.Item>
                    {date && (
                        <ListGroup.Item className={'c-card__listItem--created'}>
                            <div className="shanti-field-created">
                                <span className="u-icon__calendar icon shanti-field-content">
                                    {date}
                                </span>
                            </div>
                        </ListGroup.Item>
                    )}
                    {doc.duration_s && (
                        <ListGroup.Item
                            className={'c-card__listItem--duration'}
                        >
                            <div className="info shanti-field-duration">
                                <span className="icon shanticon-hourglass shanti-field-content">
                                    {doc.duration_s}
                                </span>
                            </div>
                        </ListGroup.Item>
                    )}

                    <ListGroup.Item className="shanti-field-uid">
                        <div className="icon u-icon__info info shanti-field-content">
                            <span>ID-{myuid}</span>
                        </div>
                    </ListGroup.Item>

                    <ListGroup.Item className={'c-card__listItem--related'}>
                        <div className="info shanti-field-related">
                            <span className="shanti-field-content">
                                <SmartRelateds relateds={relateds} />
                            </span>
                        </div>
                    </ListGroup.Item>
                    {mycaption && (
                        <ListGroup.Item className={'c-card__listItem--caption'}>
                            <div className="shanti-field-caption">
                                <span className="info shanti-field-content">
                                    {mycaption}
                                </span>
                            </div>
                        </ListGroup.Item>
                    )}
                </ListGroup>

                <div className={'c-button__json'}>
                    <span
                        className={'sui-showinfo u-icon__info float-right'}
                        onClick={() => setModalShow(true)}
                    ></span>
                    <DetailModal
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                        data={doc}
                        scrollable={true}
                    />
                </div>
            </Card.Body>

            <Card.Footer
                className={'c-card__footer c-card__footer--' + asset_type}
            >
                {footer_text}
            </Card.Footer>
        </Card>
    );
}

FeatureCard.propTypes = { doc: PropTypes.any };

function DetailModal(props) {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => {
        setIsOpen(!isOpen);
    };

    const data = props?.data;
    let title = data?.title;
    title = Array.isArray(title) && title?.length > 0 ? title[0] : title;
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Metadata for Mandala{' '}
                    <span className="text-capitalize">{data?.asset_type}</span>{' '}
                    Item
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ul>
                    <li>
                        <strong>UID: </strong> {data?.uid}
                    </li>
                    <li>
                        <strong>Title: </strong> {title}
                    </li>
                    <li>
                        <strong>Uploader: </strong> {data?.node_user_full_s} (
                        {data?.node_user})
                    </li>
                    <li>
                        <strong>Date Created: </strong>{' '}
                        {new Date(data?.node_created).toLocaleDateString()}
                    </li>
                    <li>
                        <strong>Last Modified: </strong>{' '}
                        {new Date(data?.node_changed).toLocaleDateString()}
                    </li>
                    <li>
                        <strong>Language: </strong> {data?.node_lang}
                    </li>
                    <li>
                        <strong>Type: </strong> {data?.asset_type}{' '}
                        {data?.asset_subtype && <>({data?.asset_subtype})</>}
                    </li>
                    <li>
                        <strong>Projects: </strong> {data?.projects_ss}
                    </li>
                    <li>
                        <strong>Sort Title: </strong> {data?.title_sort_s}
                    </li>
                    <li>
                        <strong>Sort Creator: </strong> {data?.creator_sort_s}
                    </li>
                    <li>
                        <strong>Mandala Url: </strong>{' '}
                        <a
                            href={data?.url_html}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {data?.url_html}
                        </a>
                    </li>
                </ul>
                <Button
                    color="info"
                    onClick={toggle}
                    style={{ marginBottom: '1rem' }}
                >
                    Show Full JSON Record
                </Button>
                <div style={{ display: isOpen ? 'block' : 'none' }}>
                    <pre>{JSON.stringify(props.data, undefined, 3)}</pre>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export function createAssetViewURL(
    avuid,
    asset_type,
    location,
    searchParam,
    inline
) {
    if (asset_type === 'collections') {
        return `/${avuid
            .replace(/\-/g, '/')
            .replace('audio/video', 'audio-video')}${searchParam}`;
    }
    const atype = avuid.split('-')[0];
    const aid = avuid.split('-').pop();
    if (location.pathname.includes('_definitions-')) {
        let path = location.pathname.split('/');
        const relatedIndex = path.findIndex((el) => el.includes('related'));
        path.splice(relatedIndex + 1);
        return `${path.join('/')}/view/${aid}${searchParam}`;
    }
    let path = location.pathname
        .replace(/\/?any\/?.*/, '') // remove the /any from terms
        .replace(/\/?(deck|gallery|list)\/?.*/, '');
    path = `${path}/view/${aid}${searchParam}`; // ${avuid}?asset_type=${asset_type}
    path = path.replace('related-all', `related-${asset_type}`);
    if (['places', 'subjects', 'terms'].includes(asset_type)) {
        path = `/${asset_type}/${aid}${searchParam}`;
    }
    if (isAssetType(atype)) {
        path = `/${asset_type}/${aid}`;
    }
    // If looking at related assets within a Kmap context use the inline (embedded) viewer
    if (location.pathname.includes('/related-' + asset_type) && inline) {
        let ppts = location.pathname.split('/related');
        let uid = avuid.split('-');
        uid = uid.length > 1 ? uid[1] : uid[0];
        // Use embedded viewer url
        path = `${ppts[0]}/related-${asset_type}/view/${uid}`;
    }
    return path;
}
