import Card from 'react-bootstrap/Card';
import { useLocation, Link } from 'react-router-dom';
import _ from 'lodash';
// import Accordion from "react-bootstrap/Accordion";
// import Button from "react-bootstrap/Button";
import * as PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { KmapLink } from '../KmapLink';
import { SmartTitle } from '../SmartTitle';
import { SmartPath } from '../SmartPath';
import { SmartRelateds } from '../SmartRelateds';

import './FeatureCard.scss';
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
    let location = useLocation();
    // console.log('FeatureCard: doc = ', props.doc.uid);
    // console.log('FeatureCard: inline = ', props.inline);
    const inline = props.inline || false;

    const [modalShow, setModalShow] = React.useState(false);

    const doc = props.doc;

    const subTypeGlyph = typeGlyphMap[doc.asset_type + '/' + doc.asset_subtype];
    const typeGlyph = doc.uid ? (
        subTypeGlyph ? (
            subTypeGlyph
        ) : (
            <span
                className={'icon color-invert u-icon__' + doc.asset_type}
            ></span>
        )
    ) : null;

    const assetGlyph =
        doc.uid &&
        doc.asset_type !== 'images' &&
        doc.asset_type !== 'audio-video' ? (
            <span className={'icon u-icon__' + doc.asset_type}></span>
        ) : null;

    const viewer = doc.asset_type;

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

    let date = doc.node_created ? doc.node_created : doc.timestamp;
    date = date?.split('T')[0];

    let creator =
        doc.creator?.length > 0 ? doc.creator.join(', ') : doc.node_user;
    if (doc.creator?.length > 3) {
        creator = doc.creator.slice(0, 3).join(', ') + '…';
    }

    if (creator) {
        creator = creator.replace(/\&amp\;/g, '&');
    }

    let footer_coll_link = doc?.collection_uid_path_ss;
    if (footer_coll_link && footer_coll_link.length > 0) {
        footer_coll_link = footer_coll_link[footer_coll_link.length - 1];
        footer_coll_link =
            '/' + footer_coll_link.replace('-collection-', '/collection/');
    }
    const footer_text = doc.collection_title ? (
        <Link to={footer_coll_link}>
            <span className={'icon u-icon__collections'}>
                {' '}
                {doc.collection_title}{' '}
            </span>
        </Link>
    ) : (
        <span>
            {doc.ancestors_txt && doc.asset_type !== 'terms' && (
                <div className="info shanti-field-path">
                    <span
                        className={
                            'shanti-field-content u-icon__' + doc.asset_type
                        }
                    >
                        <SmartPath doc={doc} />
                    </span>
                </div>
            )}
        </span>
    );

    let relateds = null;

    if (doc.asset_type === 'places') {
        // relateds = related_subjects;
        relateds = feature_types;
    } else if (doc.asset_type === 'subjects') {
        relateds = related_places;
    } else if (doc.asset_type === 'terms') {
        relateds = related_subjects;
    }

    // console.log("FOOTERING: ", doc);
    let avuid = doc.uid;
    let avid = doc.id;
    // Pages need to link to their parent text
    if (doc.asset_type === 'texts' && doc.asset_subtype === 'page') {
        avuid = doc.service + '_' + doc.book_nid_i;
        avid = doc.book_nid_i + '#shanti-texts-' + doc.id;
    }

    const asset_view = inline
        ? createAssetViewURL(avuid, doc.asset_type, location)
        : `/${viewer}/${avid}`;

    const subtitle =
        doc.asset_type === 'texts' ? (
            <span className={'subtitle'}>{doc.title}</span>
        ) : (
            ''
        );

    const myuid = `${doc.asset_type
        .charAt(0)
        .toUpperCase()}${doc.asset_type.substr(1)}-${doc.id}`;
    const mycaption = doc?.caption?.length > 0 ? doc.caption : null;

    return (
        <Card key={doc.uid} className={'c-card__grid--' + doc.asset_type}>
            <Link
                to={asset_view}
                className={'c-card__link--asset c-card__wrap--image'}
            >
                <Card.Img
                    className={'c-card__grid__image--top'}
                    variant="top"
                    src={doc.url_thumb ? doc.url_thumb : '/img/gradient.jpg'}
                />
                <div className={'c-card__grid__glyph--type color-invert'}>
                    {typeGlyph}
                </div>
                <div className={'c-card__grid__glyph--asset'}>{assetGlyph}</div>
            </Link>

            <Card.Body>
                <Card.Title>
                    <Link to={asset_view} className={'c-card__link--asset'}>
                        <SmartTitle doc={doc} />
                        {subtitle}
                    </Link>
                </Card.Title>

                <ListGroup>
                    <ListGroup.Item className={'c-card__listItem--creator'}>
                        {doc.creator && (
                            <div className="info shanti-field-creator">
                                <span className="icon shanti-field-content">
                                    {creator}
                                </span>
                            </div>
                        )}
                    </ListGroup.Item>
                    <ListGroup.Item className={'c-card__listItem--duration'}>
                        {doc.duration_s && (
                            <div className="info shanti-field-duration">
                                <span className="icon shanti-field-content">
                                    {doc.duration_s}
                                </span>
                            </div>
                        )}
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
                    {/*
                    <ListGroup.Item className={'c-card__listItem--created'}>
                        {date && (
                            <div className="shanti-field-created">
                                <span className="icon shanti-field-content">
                                    {date}
                                </span>
                            </div>
                        )}
                    </ListGroup.Item>
                    */}
                </ListGroup>

                <div className={'c-button__json'}>
                    <div className="shanti-field-uid float-left">
                        <span className="info shanti-field-content">
                            {myuid}
                        </span>
                    </div>

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
                className={'c-card__footer c-card__footer--' + doc.asset_type}
            >
                {footer_text}
            </Card.Footer>
        </Card>
    );
}

FeatureCard.propTypes = { doc: PropTypes.any };

function DetailModal(props) {
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    JSON DATA
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <pre>{JSON.stringify(props.data, undefined, 3)}</pre>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

function createAssetViewURL(avuid, asset_type, location) {
    const aid = avuid.split('-').pop();
    if (location.pathname.includes('_definitions-')) {
        let path = location.pathname.split('/');
        const relatedIndex = path.findIndex((el) => el.includes('related'));
        path.splice(relatedIndex + 1);
        return `${path.join('/')}/view/${aid}`;
    }
    return `./view/${aid}`; // ${avuid}?asset_type=${asset_type}
}
