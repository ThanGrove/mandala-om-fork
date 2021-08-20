import React from 'react';
import { Link } from 'react-router-dom';
import { MandalaPopover } from './MandalaPopover';
import { Col, Container, Row, Button, Tabs } from 'react-bootstrap';
import { findFieldNames, queryID } from './utils';
import { useKmap } from '../../hooks/useKmap';
import useMandala from '../../hooks/useMandala';
import MandalaSkeleton from './MandalaSkeleton';
import { HtmlWithPopovers } from './MandalaMarkup';
import Tab from 'react-bootstrap/Tab';
import { useSolr } from '../../hooks/useSolr';

export function CollectionField(props) {
    const solrdoc = props?.solrdoc;
    // console.log("Collection Field props", props);
    if (!solrdoc) {
        return <div>Loading Field ...</div>;
    }
    const assettype = solrdoc.asset_type;
    const collurl =
        assettype && solrdoc
            ? '/' + assettype + '/collection/' + solrdoc.collection_nid
            : '#';
    const colltitle = solrdoc.collection_title;
    return (
        <>
            <span className="u-icon__collections"> </span>
            <Link to={collurl}>{colltitle}</Link>
            <span className="u-visibility">Public</span>
        </>
    );
}

/**
 * Utility component that takes a nodejson object from an asset API returning Drupal json and displays
 * the three common fields: field_subjects, field_places, field_terms
 *
 * TODO: Allow user to pass alternative names for fields
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function KmapsFields(props) {
    const nodejson = props.nodejson;
    const kmapid = props?.kmapid;

    if (!nodejson || typeof nodejson === 'undefined') {
        return null;
    }
    const kcolls_field_name = props.collfield
        ? props.collfield
        : 'field_kmap_collections';
    const kcolls = nodejson[kcolls_field_name]?.und?.map((item, n) => {
        const mykey = 'kmcolls-' + item.domain + '-' + item.id + '-' + n;
        return (
            <MandalaPopover
                key={mykey}
                domain={item.domain}
                kid={item.id}
                children={[item?.header]}
            />
        );
    });
    const sub_field_name = props.subjectfield
        ? props.subjectfield
        : 'field_subjects';
    const subjects = nodejson[sub_field_name]?.und?.map((item, n) => {
        const mykey = 'kmsubj-' + item.domain + '-' + item.id + '-' + n;
        return (
            <MandalaPopover
                key={mykey}
                domain={item.domain}
                kid={item.id}
                children={[item?.header]}
            />
        );
    });
    const places = nodejson.field_places?.und?.map((item, n) => {
        const mykey = 'kmplc-' + item.domain + '-' + item.id + '-' + n;
        return (
            <MandalaPopover
                key={mykey}
                domain={item.domain}
                kid={item.id}
                children={[item?.header]}
            />
        );
    });
    const termsorig = nodejson.field_terms
        ? nodejson.field_terms
        : nodejson.field_kmap_terms;

    let terms = termsorig?.und?.map((item, n) => {
        const mykey = 'kmterm-' + item.domain + '-' + item.id + '-' + n;
        return (
            <MandalaPopover
                key={mykey}
                domain={item.domain}
                kid={item.id}
                kmapid={kmapid}
                children={[item?.header]}
            />
        );
    });
    const kcollclass = !kcolls || kcolls.length === 0 ? ' d-none' : '';
    const subjclass = !subjects || subjects.length === 0 ? ' d-none' : '';
    const placeclass = !places || places.length === 0 ? ' d-none' : '';
    const termsclass = !terms || terms.length === 0 ? ' d-none' : '';
    return (
        <>
            <div className={'c-kmaps__collections' + kcollclass}>
                <span className="u-icon__collections" title="Collections" />{' '}
                {kcolls}{' '}
            </div>
            <div className={'c-kmaps__subjects' + subjclass}>
                <span className="u-icon__subjects" title="Subjects" />{' '}
                {subjects}{' '}
            </div>
            <div className={'c-kmaps__places' + placeclass}>
                <span className="u-icon__places" title="Places" /> {places}{' '}
            </div>
            <div className={'c-kmaps__terms' + termsclass}>
                <span className="u-icon__terms" title="Terms" /> {terms}{' '}
            </div>
        </>
    );
}

// TODO: Actually use the react history object here
const backbutton = () => {
    window.history.back();
    setTimeout(function () {
        window.location.reload();
    }, 1000);
};

/**
 * The Component for when an asset page is not found.
 * TODO: Could be broadened to other not-found contexts.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function NotFoundPage(props) {
    let atype = props.type;
    let notFoundMessage = (
        <div>
            <p>Sorry, the page you are looking for</p>
            <p className={'badurl'}>{window.location.href}</p>
            <p>
                is not available. It either does not exist or is private. Please
                try again!
            </p>
        </div>
    );

    if (atype && atype !== '' && props?.id) {
        if (atype[atype.length - 1] === 's') {
            atype = atype.substr(0, atype.length - 1);
        }
        if ('aeiou'.includes(atype[0])) {
            atype = 'an ' + atype;
        } else {
            atype = 'a ' + atype;
        }
        const aid = props.id;

        notFoundMessage = (
            <p>
                Sorry, {atype} with ID, {aid}, does not exist.
                <br />
                If you followed a link to an item, you may have the wrong item
                ID,
                <br />
                or the item may have been deleted or is private.
            </p>
        );
    }

    return (
        <div className={'c-not-found'}>
            <Container fluid>
                <Row className="justify-content-md-center">
                    <Col lg={'auto'}>
                        <img
                            className={'logo'}
                            src={'/img/logo-shanti.png'}
                            alt={'mandala logo'}
                        />
                        <h1>Page Not Found!</h1>
                        {notFoundMessage}
                        <Button variant="primary" href="#" onClick={backbutton}>
                            Back
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export function RelatedTextFinder({ kmapdata }) {
    let txtidfield = findFieldNames(kmapdata, 'homepage_text_', 'starts');
    if (!txtidfield || txtidfield.length === 0) return null;
    txtidfield = txtidfield[0];
    const kid = kmapdata[txtidfield];
    return <RelatedText kid={kid} />;
}

export function RelatedText({ kid }) {
    const {
        isLoading: isAssetLoading,
        data: textasset,
        isError: isAssetError,
        error: assetError,
    } = useKmap(queryID('texts', kid), 'asset');

    const {
        isLoading: isJsonLoading,
        data: textjson,
        isError: isJsonError,
        error: jsonError,
    } = useMandala(textasset);

    if (isAssetLoading || isJsonLoading) return <MandalaSkeleton />;
    if (!textjson?.full_markup) return null;
    const isToc = textjson?.toc_links && textjson.toc_links.length > 0;
    const defkey = isToc ? 'toc' : 'info';
    return (
        <>
            <Container className="c-kmaps-related-text">
                <Row>
                    <Col lg={7}>
                        <HtmlWithPopovers markup={textjson?.full_markup} />
                    </Col>
                    <Col lg={5}>
                        <Tabs defaultActiveKey={defkey} id="text-meta-tabs">
                            {isToc && (
                                <Tab eventKey="toc" title="Table of Contents">
                                    <div className={'toc'}>
                                        <HtmlWithPopovers
                                            markup={textjson?.toc_links}
                                        />
                                    </div>
                                </Tab>
                            )}
                            <Tab eventKey="info" title="Info">
                                {textjson?.bibl_summary && (
                                    <div className={'info'}>
                                        <HtmlWithPopovers
                                            markup={textjson?.bibl_summary}
                                        />
                                    </div>
                                )}
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export function AssetTitle({ kmasset }) {
    if (!kmasset || !kmasset?.title?.length > 0) {
        return null;
    }
    const mytype = kmasset?.asset_type;
    const title = kmasset.title[0];
    let mylang = 'en';
    if (title.includes('་')) {
        mylang = 'bo';
    }
    if (title.charCodeAt(0) > 19967) {
        mylang = 'zh';
    }
    return <h1 className={`title ${mytype} ${mylang}`}>{kmasset.title[0]}</h1>;
}

export function SAProjectName({ pid }) {
    const querySpecs = {
        index: 'assets',
        params: {
            q: `asset_type:projects AND project_id_s:${pid}`,
            rows: 10,
        },
    };
    const {
        isLoading: isProjLoading,
        data: projData,
        isError: isProjError,
        error: projError,
    } = useSolr(`mandala-projects-${pid}`, querySpecs, false, false);

    if (isProjLoading) {
        return '...';
    }

    if (isProjError) {
        console.log('Error loading project: ' + pid, projError);
        return '';
    }

    if (projData?.docs?.length > 0) {
        return projData.docs[0].title[0];
    }
    return '';
}
