import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MandalaPopover } from './MandalaPopover';
import {
    Col,
    Container,
    Row,
    Button,
    Tabs,
    Tooltip,
    OverlayTrigger,
    Overlay,
    Popover,
} from 'react-bootstrap';
import { findFieldNames, queryID } from './utils';
import { useKmap } from '../../hooks/useKmap';
import useMandala from '../../hooks/useMandala';
import MandalaSkeleton from './MandalaSkeleton';
import { HtmlCustom, HtmlWithPopovers } from './MandalaMarkup';
import Tab from 'react-bootstrap/Tab';
import { useSolr } from '../../hooks/useSolr';
import GenericPopover from './GenericPopover';

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

export function MandalaInfoPopover({ markup, clnm }) {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    return (
        <>
            <Button
                variant="outline-light"
                ref={target}
                className="mandala-info-link"
                onClick={() => setShow(!show)}
            >
                <span className="u-icon__info"></span>
            </Button>
            <Overlay target={target.current} show={show} placement="left">
                <div id="mandala-info-tip" className={clnm}>
                    <Button
                        variant="outline-light"
                        className="mandala-close-info"
                        onClick={() => setShow(false)}
                    >
                        <span className="u-icon__close2"></span>
                    </Button>
                    <HtmlWithPopovers markup={markup} />
                </div>
            </Overlay>
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

export function MandalaSourceNote({
    markup,
    title = 'Sources',
    children = [],
}) {
    const srcicon = <span className="u-icon__sources"> </span>;
    return (
        <GenericPopover
            title={title}
            content={markup}
            children={children}
            icon={srcicon}
        />
    );
}

export function ShanticonRefPage() {
    const sicons = [
        'shanticon-address-card-o',
        'shanticon-agents',
        'shanticon-angle-double-left',
        'shanticon-angle-double-right',
        'shanticon-angle-down',
        'shanticon-angle-left',
        'shanticon-angle-right',
        'shanticon-angle-up',
        'shanticon-arrow-circle-o-right',
        'shanticon-arrow-dbl-left',
        'shanticon-arrow-dbl-right',
        'shanticon-arrow-empty-right',
        'shanticon-arrow-end-left',
        'shanticon-arrow-end-right',
        'shanticon-arrow-left',
        'shanticon-arrow-left_2',
        'shanticon-arrow-right',
        'shanticon-arrow-right_2',
        'shanticon-arrow-tip-down',
        'shanticon-arrow-tip-left',
        'shanticon-arrow-tip-right',
        'shanticon-arrow-tip-up',
        'shanticon-arrow-tri-left',
        'shanticon-arrow-tri-right',
        'shanticon-arrow3-down',
        'shanticon-arrow3-left',
        'shanticon-arrow3-right',
        'shanticon-arrow3-up',
        'shanticon-arrows',
        'shanticon-arrows-alt',
        'shanticon-arrows-h',
        'shanticon-arrowselect',
        'shanticon-audio',
        'shanticon-audio-video',
        'shanticon-books',
        'shanticon-calendar',
        'shanticon-camera',
        'shanticon-cancel',
        'shanticon-cancel-circle',
        'shanticon-check',
        'shanticon-check-square-o',
        'shanticon-circle-right',
        'shanticon-close',
        'shanticon-close2',
        'shanticon-cog',
        'shanticon-collections',
        'shanticon-commenting-o',
        'shanticon-comments-o',
        'shanticon-community',
        'shanticon-compress',
        'shanticon-create',
        'shanticon-directions',
        'shanticon-disc',
        'shanticon-disc2',
        'shanticon-download',
        'shanticon-download1',
        'shanticon-edit',
        'shanticon-editor',
        'shanticon-enlarge',
        'shanticon-envelope-o',
        'shanticon-essays',
        'shanticon-events',
        'shanticon-expand',
        'shanticon-explore',
        'shanticon-eye',
        'shanticon-eye-blocked',
        'shanticon-facebook',
        'shanticon-file-o',
        'shanticon-file-picture',
        'shanticon-file-text-o',
        'shanticon-files-empty',
        'shanticon-googleplus',
        'shanticon-grid',
        'shanticon-headphones',
        'shanticon-hourglass',
        'shanticon-image',
        'shanticon-images',
        'shanticon-info',
        'shanticon-kmaps-popover',
        'shanticon-link-external',
        'shanticon-list',
        'shanticon-list-alt',
        'shanticon-list2',
        'shanticon-list4',
        'shanticon-lock',
        'shanticon-lock-open',
        'shanticon-logo-shanti',
        'shanticon-magnify',
        'shanticon-mail',
        'shanticon-map-marker',
        'shanticon-menu',
        'shanticon-menu3',
        'shanticon-minus',
        'shanticon-minus-square-o',
        'shanticon-multiply',
        'shanticon-new-tab',
        'shanticon-overview',
        'shanticon-pause',
        'shanticon-pencil',
        'shanticon-places',
        'shanticon-play-transcript',
        'shanticon-play-video',
        'shanticon-play2',
        'shanticon-plus',
        'shanticon-plus-square-o',
        'shanticon-preview',
        'shanticon-print',
        'shanticon-question-circle-o',
        'shanticon-row-empty-left',
        'shanticon-search',
        'shanticon-share',
        'shanticon-shrink',
        'shanticon-sign-out',
        'shanticon-sort-alpha-asc',
        'shanticon-sort-alpha-desc',
        'shanticon-sort-amount-asc',
        'shanticon-sort-amount-desc',
        'shanticon-sources',
        'shanticon-spin3',
        'shanticon-spinner',
        'shanticon-spinner2',
        'shanticon-spinner6',
        'shanticon-square-o',
        'shanticon-star',
        'shanticon-star-half-empty',
        'shanticon-star-o',
        'shanticon-stop',
        'shanticon-subjects',
        'shanticon-tags',
        'shanticon-terms',
        'shanticon-texts',
        'shanticon-th',
        'shanticon-trash',
        'shanticon-tree',
        'shanticon-twitter',
        'shanticon-uniE626',
        'shanticon-upload',
        'shanticon-upload1',
        'shanticon-user-check',
        'shanticon-user-circle-o',
        'shanticon-video',
        'shanticon-visuals',
        'shanticon-zoom-in',
        'shanticon-zoom-out',
    ];

    return (
        <div className="sicon-ref-page">
            <h1>Shanticon Reference Page</h1>
            <div className="sicon-ref-list">
                {sicons.map((sicon, si) => {
                    return (
                        <ShanticonItem
                            key={`shanticon-sq-${si}`}
                            sicon={sicon}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function ShanticonItem({ sicon }) {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const copy2clip = (e) => {
        let txt = e.target?.dataset?.icon
            ? e.target.dataset.icon
            : e.target?.parentElement?.dataset?.icon;
        if (txt) {
            navigator.clipboard.writeText(txt);
            setShow(true);
            setTimeout(() => {
                setShow(false);
            }, 2000);
        }
    };
    return (
        <>
            <div
                className="sicon-item"
                onClick={copy2clip}
                data-icon={sicon}
                ref={target}
            >
                <span className={`icon ${sicon}`}> </span>
                <p className="label">{sicon}</p>
            </div>
            <Overlay target={target.current} show={show} placement="auto">
                {(props) => (
                    <Tooltip className="sicon-tooltip" {...props}>
                        Copied to Clipboard!
                    </Tooltip>
                )}
            </Overlay>
        </>
    );
}

export function NotAvailable({ div = true, atype = 'asset', id = null }) {
    const prep = ['a', 'e', 'i', 'o', 'u'].includes(atype[0]) ? 'an' : 'a';
    const idst = id ? `this ID, ${id},` : 'this ID';
    const message = (
        <>
            <h1>Not Available For Viewing</h1>
            <p className="h4">
                Either {prep} {atype} with {idst} does not exist or it is
                private.
            </p>
        </>
    );

    if (div) {
        return <div>{message}</div>;
    } else {
        return message;
    }
}
