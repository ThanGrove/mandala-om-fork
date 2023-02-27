import React, { useEffect, useState, useContext } from 'react';
import { useKmap } from '../../hooks/useKmap';
import useMandala from '../../hooks/useMandala';
import { Container, Row, Tabs, Tab, Col } from 'react-bootstrap';
import { HtmlWithPopovers, getRandomKey } from '../common/MandalaMarkup';
import { addBoClass, createAssetCrumbs } from '../common/utils';
import './TextsViewer.sass';
import $ from 'jquery';
import { useParams, Redirect, Link } from 'react-router-dom';
import { useHistory } from '../../hooks/useHistory';
import { RelatedAssetHeader } from '../Kmaps/RelatedAssetViewer';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { useSolr } from '../../hooks/useSolr';
import { NotFoundPage } from '../common/utilcomponents';

function scrollToSection(sectid) {
    let newScrollTop = 0;
    const pgel = document.getElementById(`shanti-texts-${sectid}`);
    if (pgel) {
        const topPos = pgel.offsetTop;
        newScrollTop = topPos;
    }
    window.scrollTo(0, newScrollTop);
}

// Add inviewport test to jQuery elements from https://stackoverflow.com/a/40658647/2911874 (2023/02/21)
$.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

// On scroll function to highlight text toc
const docscroll = (e) => {
    $('.text-toc li.active').removeClass('active');
    $('.shanti-texts-section').each((n, s) => {
        if ($(s).isInViewport()) {
            let myid = $(s).attr('id');
            let tocid = myid.replace('shanti-texts-', '#toc-link-');
            $(tocid).addClass('active');
        }
    });
    if (window.pageYOffset > 108) {
        $('#shanti-texts-sidebar').addClass('fixed');
    } else {
        $('#shanti-texts-sidebar').removeClass('fixed');
    }
};
document.onscroll = docscroll;

/**
 * Text Viewer Component: The parent component for viewing a text. Gets sent the asset information as a prop
 * called "mdlasset" from MdlAssetContext.js. When there is asset information, it creates a bootstrap container
 * with one row that contains a TextBody component and a TextTabs component (Both defined in this file).
 *
 * Uses State and Effect to keep track of which section(s) is/are visible in the scrolling body and passes this
 * information to the TextTabs component so it can highlight the active part of the TOC.
 *
 * State Variables:
 *      text_sections => an array of objects about the sections of the text each object has:
 *          el : the jQuery element
 *          id : the html ID value for the section <div>
 *          title : the title for that section
 *          top: the offset top of the element within its container
 *          bottom: the offset top of the next element or 1000000 if last element
 *
 *      section_showing => a simple array of strings which are IDs for the sections visible in the
 *                         main body's viewport.
 *
 * @param props
 * @returns {*}
 * @constructor
 */

export default function TextsViewer(props) {
    const baseType = `texts`;
    const { id, pageid } = useParams();
    const txtId = props.id ? props.id : id;
    const queryID = `${baseType}*-${txtId}`;
    const addPage = useHistory((state) => state.addPage);
    // Solr Call for Asset and API call for Node Data
    const {
        isLoading: isAssetLoading,
        data: kmasset,
        isError: isAssetError,
        error: assetError,
    } = useKmap(queryID, 'asset');
    const {
        isLoading: isNodeLoading,
        data: nodeData,
        isError: isNodeError,
        error: nodeError,
    } = useMandala(kmasset);

    const nodejson = nodeData;
    const tid = nodejson ? nodejson.nid : '';
    const title = nodejson ? nodejson.title : '';
    let ismain = props?.ismain || false;
    const inline = props?.inline || false;
    if (ismain && inline) {
        ismain = false;
    }
    const [text_sections, setSections] = useState([]);
    const [section_showing, setSectionShowing] = useState([
        'shanti-texts-' + tid,
    ]);

    const [alt_viewer_url, setAltViewerUrl] = useState(''); // alt_viewer has url for alt view to show if showing or empty string is hidden

    // When asset is loaded, add it to the history
    useEffect(() => {
        if (!isAssetLoading && !isAssetError) {
            addPage(baseType, kmasset.title, window.location.pathname);
        }
    }, [kmasset]);

    // For links directly to a text page, redirect to book url with hash for page section
    if (kmasset?.asset_type === 'texts' && kmasset?.asset_subtype === 'page') {
        if (ismain) {
            const redurl = `/texts/${kmasset.book_nid_i}#shanti-texts-${kmasset.id}`;
            return <Redirect to={redurl} />;
        }
    }

    let output = (
        <div>
            <h1>Invalid Text ID</h1>
            <p className="h4">
                The text ID given, {txtId}, is invalid.
                <br />
                Either the text does not exist or you do not have priviledges to
                view it.
            </p>
        </div>
    );

    if (isAssetLoading || isNodeLoading) {
        return (
            <Container className={'astviewer texts'} fluid="true">
                <Row id={'shanti-texts-container'}>
                    <MandalaSkeleton />
                </Row>
            </Container>
        );
    }

    if (isAssetError) {
        return (
            <Container className={'astviewer texts'} fluid="true">
                <Row id={'shanti-texts-container'}>
                    <div className={'not-found-msg d-none'}>
                        <h1>Text Not Found!</h1>
                        <p className={'error'}>Error: {assetError.message}</p>
                    </div>
                </Row>
            </Container>
        );
    }
    if (isNodeError) {
        return (
            <Container className={'astviewer texts'} fluid="true">
                <Row id={'shanti-texts-container'}>
                    <div className={'not-found-msg d-none'}>
                        <h1>Text Not Found!</h1>
                        <p className={'error'}>Error: {nodeError.message}</p>
                    </div>
                </Row>
            </Container>
        );
    }

    // Set output to return. If there's an asset, then output with text BS Container with one BS Row
    // Row contains: TextBody (main part of text) and Text Tabs (Collapsible tabs on right side including TOC)
    if (nodejson && nodejson.nid) {
        //console.log("Currast", currast);
        if (nodejson.bibl_summary === '') {
            nodejson.bibl_summary = '<div>Description is loading!</div>';
        }

        output = (
            <>
                {props?.id && (
                    <RelatedAssetHeader
                        type="texts"
                        subtype="text"
                        header={kmasset.title}
                    />
                )}
                <div className={'l-site__wrap astviewer texts'} fluid="true">
                    <div id={'shanti-texts-container'} className="d-flex">
                        <TextBody
                            id={nodejson.nid}
                            alias={nodejson.alias}
                            markup={nodejson.full_markup}
                            pageid={pageid}
                        />
                        <TextTabs
                            textid={nodejson.nid}
                            pageid={pageid}
                            mlid={nodejson.book.mlid}
                            toc={nodejson.toc_links}
                            meta={nodejson.bibl_summary}
                            links={nodejson.views_links}
                            html={kmasset.url_html}
                            title={title}
                            altChange={setAltViewerUrl}
                        />
                    </div>
                </div>
                <TextsAltViewer
                    title={title}
                    url={alt_viewer_url}
                    altChange={setAltViewerUrl}
                />
            </>
        );
    } else {
        return <NotFoundPage div={true} atype="text" id={id} />;
    }
    return output;
}

/**
 *
 * @param props
 * @returns {*}
 * @constructor
 */
function TextBody(props) {
    const txt_link = props.alias;
    const pageid = props.pageid;

    // Adjust CSS for Texts only
    useEffect(() => {
        $(
            '.l-content__wrap, #l-content__main,.astviewer, .astviewer.texts #shanti-texts-container'
        ).css('height', 'inherit');
    }, []);

    useEffect(() => {
        addBoClass('#l-content__main');
    }, []);

    useEffect(() => {
        scrollToSection(pageid);
    }, [pageid]);

    return (
        <div
            id={'shanti-texts-body'}
            className="p-4 flex-grow-1"
            onScroll={props.listener}
        >
            <div className={'link-external mandala-edit-link'}>
                <a
                    href={txt_link}
                    target={'_blank'}
                    title={'View Text in Mandala'}
                >
                    <span className={'icon u-icon__external'}></span>
                </a>
            </div>
            <HtmlWithPopovers markup={props.markup} />
        </div>
    );
}

/**
 *
 * @param props
 * @returns {*}
 * @constructor
 */
function TextTabs(props) {
    const info_icon = <span className={'shanticon shanticon-info'}></span>;
    const collapse_icon = (
        <span className={'shanticon shanticon-close2'}></span>
    );
    /*
    const info_icon = <span className={'shanticon shanticon-info'}></span>;
    const collapse_icon = (
        <span className={'shanticon shanticon-circle-right'}></span>
    );*/
    const [open, setOpen] = useState(true);
    const [icon, setIcon] = useState(collapse_icon);
    const toggle_col = () => {
        setOpen(!open);
    };

    useEffect(() => {
        const curr_icon = open ? collapse_icon : info_icon;
        setIcon(curr_icon);
    }, [open]);

    // Deal with Alternate Views Links
    const altviewhtml = $(props.links);
    const altviewlinks = altviewhtml.find('a');
    const altviewcomponent = altviewlinks.map((n, item) => {
        //console.log('altview component', item);
        let href = $(item).attr('href');
        if (!href.includes('http')) {
            href = process.env.REACT_APP_DRUPAL_TEXTS + href;
        }
        const mytxt = $(item).text();
        const mykey = getRandomKey(mytxt);
        return (
            <tr className="shanti-texts-field nothing" key={mykey}>
                <td colSpan="2" className="shanti-texts-field-content">
                    <a
                        data-href={href}
                        onClick={() => {
                            props.altChange(href);
                        }}
                        className="link__nohref"
                    >
                        {mytxt}
                    </a>
                </td>
            </tr>
        );
    });

    // Commonly used props
    const title = props.title;
    const textid = props.textid;
    const sidebar_class = open ? 'open' : 'closed';

    return (
        <Row id={'shanti-texts-sidebar'} className={sidebar_class + ' p-2'}>
            <Col className="meta-toggle-col">
                <a className="meta-toggle" onClick={toggle_col}>
                    {icon}
                </a>
            </Col>

            {open && (
                <Col>
                    <Tabs
                        id={'shanti-texts-sidebar-tabs'}
                        className={'nav-justified'}
                    >
                        <Tab eventKey={'text_bibl'} title={'Description'}>
                            <HtmlWithPopovers
                                markup={props.meta}
                                app={'texts'}
                            />
                        </Tab>
                        <Tab
                            eventKey={'text_toc'}
                            title={'Contents'}
                            className={'shanti-texts-toc'}
                        >
                            <div className={'shanti-texts-record-title'}>
                                <Link to={`/texts/${textid}`}>{title}</Link>
                            </div>
                            <TextTocLinks
                                plid={props?.mlid}
                                pageid={props?.pageid}
                            />
                        </Tab>
                        <Tab eventKey={'text_links'} title={'Views'}>
                            <div className="shanti-texts-record-title">
                                {title}
                            </div>
                            <h6>Alternative Formats</h6>
                            <div>
                                <table className="shanti-texts-record-table table">
                                    <tbody>
                                        {altviewcomponent}
                                        <tr className="shanti-texts-field nothing">
                                            <td
                                                colSpan="2"
                                                className="shanti-texts-field-content"
                                            >
                                                <a
                                                    href={props.html}
                                                    target="_blank"
                                                >
                                                    View in Mandala
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Tab>
                    </Tabs>
                </Col>
            )}
        </Row>
    );
}

/**
 * Component to build text TOC from MLIDs and PLIDs of the Book module
 * MLID = Menu link ID and PLID = Parent (menu link) ID
 */

function TextTocLinks({ plid, pageid }) {
    const querySpecs = {
        index: 'assets',
        params: {
            q: `plid_i:${plid}`,
            fq: 'asset_type:texts',
            sort: 'mlweight_i asc',
            start: 0,
            rows: 100,
        },
    };
    const {
        isLoading: isTocLoading,
        data: tocItems,
        isError: isTocError,
        error: tocError,
    } = useSolr(`text-toc-items-${plid}`, querySpecs, false, false);

    if (isTocLoading) {
        return <MandalaSkeleton />;
    }
    if (isTocError) {
        console.error(`Toc loading error: (${plid})`, tocError);
        return null;
    }
    if (!tocItems?.numFound || tocItems?.numFound === 0) {
        return null;
    }
    return (
        <ul className="text-toc">
            {tocItems.docs.map((item, ii) => {
                const bid = item?.book_nid_i;
                const myid = item?.id;
                const mytitle =
                    item?.title && item.title?.length > 0
                        ? item.title[0]
                        : 'Untitled';
                const cname = ii === 0 ? ['first'] : [];
                if (myid === pageid) {
                    cname.push('active');
                }
                return (
                    <li
                        id={`toc-link-${myid}`}
                        className={cname.join(' ')}
                        key={`toclink-${ii}`}
                    >
                        <Link to={`/texts/${bid}/${myid}`}>{mytitle}</Link>
                        <TextTocLinks plid={item.mlid_i} pageid={pageid} />
                    </li>
                );
            })}
        </ul>
    );
}

/**
 * Text Alt viewer provides the IFrame to show the alternative views in an Iframe
 *
 * @param props
 * @returns {*}
 * @constructor
 */
function TextsAltViewer(props) {
    const iframe_url = props.url ? props.url : '';
    const clname = iframe_url === '' ? 'hidden' : 'shown';
    const text_title = props.title ? props.title : '';
    const iframe = iframe_url ? (
        <iframe src={iframe_url} className={'full-page-frame'} />
    ) : (
        ' '
    );
    return (
        <div id={'text-alt-viewer'} className={clname}>
            <div className={'close-iframe'}>
                <a
                    title={'Back to ' + text_title}
                    onClick={() => {
                        props.altChange('');
                    }}
                    className="link__nohref"
                >
                    <span className={'icon shanticon-cancel'}></span>
                </a>
            </div>
            {iframe}
        </div>
    );
}

export function TextViewerRedirect(props) {
    const { id } = useParams();
    return <Redirect to={`/texts/${id}`} />;
}
