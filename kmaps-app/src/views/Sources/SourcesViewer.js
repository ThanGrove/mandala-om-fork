import React, { useContext, useEffect } from 'react';
import { Col, Container, Row, Image } from 'react-bootstrap';
import './sources.scss';
import { HtmlCustom } from '../common/MandalaMarkup';
import { MandalaPopover } from '../common/MandalaPopover';
import { Link, useParams } from 'react-router-dom';
import { useKmap } from '../../hooks/useKmap';
import useMandala from '../../hooks/useMandala';
// import { HistoryContext } from '../History/HistoryContext';
import { useHistory } from '../../hooks/useHistory';
import { RelatedAssetHeader } from '../Kmaps/RelatedAssetViewer';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { NotFoundPage } from '../common/utilcomponents';

export default function SourcesViewer(props) {
    const baseType = `sources`;
    const { id } = useParams();
    const srcId = props.id ? props.id : id;
    const queryID = `${baseType}*-${srcId}`;
    const ismain = props?.ismain;
    const addPage = useHistory((state) => state.addPage);

    const {
        isLoading: isAssetLoading,
        data: kmasset,
        isError: isAssetError,
        error: assetError,
    } = useKmap(queryID, 'asset');
    const {
        isLoading: isNodeLoading,
        data: nodejson,
        isError: isNodeError,
        error: nodeError,
    } = useMandala(kmasset);

    useEffect(() => {
        if (kmasset) {
            addPage(baseType, kmasset.title, window.location.pathname);
        }
    }, [kmasset]);

    if (isAssetLoading || isNodeLoading) {
        return (
            <Container fluid className="c-source__container">
                <Col className="c-source">
                    <MandalaSkeleton />
                </Col>
            </Container>
        );
    }

    if (isAssetError || isNodeError) {
        if (isAssetError) {
            return (
                <Container fluid className="c-source__container">
                    <Col className="c-source">
                        <div className="error">Error: {assetError.message}</div>
                    </Col>
                </Container>
            );
        }
        if (isNodeError) {
            return (
                <Container fluid className="c-source__container">
                    <Col className="c-source">
                        <div className="error">Error: {nodeError.message}</div>
                    </Col>
                </Container>
            );
        }
    }

    const solrdoc = kmasset;
    console.log('solrdoc', solrdoc);

    if (solrdoc?.response?.numFound === 0 || !nodejson) {
        return <NotFoundPage div={true} atype={'sources'} id={id} />;
    }

    const data_col_width = solrdoc?.url_thumb?.length > 0 ? 8 : 12;

    console.log('solr doc', solrdoc);
    const biblio_fields = {
        title_long_bo_t: 'Long Title',
        title_corpus_bo_t: 'Corpus Title',
        title_corpus_bo_latn_t: 'Corpus Title Wylie',
        title_short_t: 'Short Title',
        title_short_bo_latn_t: 'Short Title Wylie',
        title_alt_t: 'Alternate Title',
        title_alt_bo_latn_t: 'Alternate Title Wylie',
        place_production_s: 'Place of Production',
        url_publisher: 'Publisher URL',
        extent_s: 'Extent',
        time_period_t: 'Time Period',
        display_format_s: 'Display Format',
        pub_freq_s: 'Publication Frequency',
        library_name_s: 'Library/Archive',
        manuscript_id_s: 'Manuscript ID',
        notes_txt: 'Notes',
        toc_t: 'Table of Content',
        url_pdf: 'PDF',
        related_assets_ss: 'Related Sources',
    };

    /* The component is here */
    return (
        <>
            {props?.id && (
                <RelatedAssetHeader
                    type="sources"
                    subtype={nodejson?.biblio_type_name}
                    header={kmasset.title}
                />
            )}
            <Container fluid className={'c-source__container'}>
                <Col className={'c-source'}>
                    {/* Headers */}
                    <h1 className={'c-source__head'}>
                        <span className={'u-icon__sources'} />{' '}
                        <span className={'c-source__title'}>
                            {solrdoc?.title}
                        </span>
                    </h1>

                    {nodejson?.biblio_secondary_title?.length > 0 && (
                        <h2 className={'c-source__second-head'}>
                            {nodejson.biblio_secondary_title}
                        </h2>
                    )}

                    {nodejson?.biblio_tertiary_title?.length > 0 && (
                        <h3 className={'c-source__third-head'}>
                            {nodejson.biblio_tertiary_title}
                        </h3>
                    )}
                    <Row>
                        <Col md={data_col_width} className={'c-sources__data'}>
                            {nodejson?.biblio_contributors?.length > 0 && (
                                <SourcesAgents
                                    agents={nodejson.biblio_contributors}
                                />
                            )}
                            {Object.keys(biblio_fields).map((t, tn) => {
                                const field_val = solrdoc[t];
                                if (!field_val) {
                                    return null;
                                }
                                return (
                                    <SourcesRow
                                        key={`sources-${t}-${tn}`}
                                        label={biblio_fields[t]}
                                        value={field_val}
                                    />
                                );
                            })}
                            <SourcesCollection sdata={solrdoc} />

                            {/* Publication Info */}
                            <SourcesRow
                                label={'Format'}
                                value={nodejson?.biblio_type_name}
                            />

                            {nodejson?.biblio_year?.length > 0 && (
                                <SourcesRow
                                    label={'Publication Year'}
                                    value={nodejson.biblio_year}
                                />
                            )}

                            {nodejson?.biblio_publisher?.length > 0 && (
                                <SourcesRow
                                    label={'Publisher'}
                                    value={nodejson.biblio_publisher}
                                />
                            )}

                            {nodejson?.biblio_place_published?.length > 0 && (
                                <SourcesRow
                                    label={'Place of Publication'}
                                    value={nodejson.biblio_place_published}
                                />
                            )}
                            {nodejson?.biblio_pages?.length > 0 && (
                                <SourcesRow
                                    label={'Pages'}
                                    value={nodejson.biblio_pages}
                                />
                            )}
                            <SourcesRow
                                label={'Source ID'}
                                value={'sources-' + nodejson?.nid}
                            />

                            <SourcesKmap
                                label={'Language'}
                                field={nodejson?.field_language_kmaps}
                            />
                            <SourcesKmap
                                label={'Places'}
                                field={nodejson?.field_kmaps_places}
                            />
                            <SourcesKmap
                                label={'Subjects'}
                                field={nodejson?.field_kmaps_subjects}
                            />
                            <SourcesKmap
                                label={'Terms'}
                                field={nodejson?.field_kmaps_terms}
                            />

                            {/* Abstract, Link, Etc. */}
                            {nodejson?.biblio_abst_e?.length > 0 && (
                                <SourcesRow
                                    label={'Abstract'}
                                    value={nodejson.biblio_abst_e}
                                    has_markup={true}
                                />
                            )}

                            {nodejson?.biblio_url?.length > 0 && (
                                <SourcesRow
                                    label={'url'}
                                    value={nodejson.biblio_url}
                                />
                            )}
                        </Col>
                        {solrdoc?.url_thumb && solrdoc.url_thumb.length > 0 && (
                            <Col className={'c-source__thumb'}>
                                <Image src={solrdoc.url_thumb} fluid />
                            </Col>
                        )}
                    </Row>
                </Col>
            </Container>
        </>
    );
}

/**
 * Sources Paren Row: Takes two fields one label if both fields have an entry puts the second one in parentheses
 *
 * @param doc
 * @param label
 * @param field
 * @param field2
 * @returns {JSX.Element|null}
 * @constructor
 */
function SourcesParenRow({ doc, label, field, field2 = null }) {
    console.log(label, field, field2, doc);
    let val1 = doc[field];
    const val2 = doc[field2];
    console.log('val2', val2);
    if (!val1 && !val2) {
        return null;
    }
    // If there is only the 2nd transliteration value, use it
    if (!val1) {
        val1 = val2;
    } else if (val2) {
        // Otherwise if both values exist put the second in parentheses
        val1 += ` (${val2})`;
    }
    return <SourcesRow label={label} value={val1} />;
}

function SourcesAgents(props) {
    const getAgentType = (atype) => {
        if (isNaN(atype)) {
            return 'Author';
        }
        switch (parseInt(atype)) {
            case 1:
                return 'Author';
            case 2:
                return 'Secondary Author';
            case 3:
                return 'Tertiary Author';
            case 4:
                return 'Subsidiary Author';
            case 5:
                return 'Corporate Author';
            case 10:
                return 'Series Editor';
            case 11:
                return 'Performer';
            case 12:
                return 'Sponsor';
            case 13:
                return 'Translator';
            case 14:
                return 'Editor';
            case 15:
                return 'Counsel';
            case 16:
                return 'Director';
            case 17:
                return 'Producer';
            case 18:
                return 'Department';
            case 19:
                return 'Issuing Organization';
            case 20:
                return 'International Author';
            case 21:
                return 'Recipient';
            case 22:
                return 'Advisor';
            default:
                return 'Author';
        }
    };
    const agents = props?.agents?.map((agnt) => {
        const mykey = `${agnt.firstname}-${agnt.lastname}-${Math.ceil(
            Math.random() * 10000
        )}`;
        return (
            <span className={'agent'} key={mykey}>
                {agnt.firstname} {agnt.lastname} ({getAgentType(agnt.auth_type)}
                )
            </span>
        );
    });

    return (
        <Row className={'agents'} key={'src-agent-row'}>
            <span className={'u-icon__agents'}></span>
            {agents}
        </Row>
    );
}

function SourcesCollection(props) {
    const sdata = props.sdata;
    if (!sdata) {
        return null;
    }
    let url = sdata?.url_html ? sdata.url_html : '';
    if (url.includes('.edu')) {
        let pts = url.split('.edu');
        url = pts[0] + '.edu/node/';
    }
    const titles = sdata?.collection_title_path_ss
        ? sdata.collection_title_path_ss
        : [];
    const nids = sdata?.collection_nid_path_is
        ? sdata.collection_nid_path_is
        : [];
    if (titles.length > 0) {
        const lastind = titles.length - 1;
        const collid = nids[lastind];
        const coltitle = titles[lastind];
        const collink = (
            <Link to={'/sources/collection/' + collid}>{coltitle}</Link>
        );
        return <SourcesRow label={'Collection'} value={collink} />;
    }
    return null;
}

function SourcesKmap(props) {
    const kmfield = props.field;
    if (!kmfield || !kmfield?.und || kmfield.und.length == 0) {
        return null;
    }

    const kmchildren = kmfield.und.map((kmitem) => {
        const mykey = `${kmitem.domain}-${kmitem.id}-${Math.ceil(
            Math.random() * 10000
        )}`;
        return (
            <MandalaPopover
                domain={kmitem.domain}
                kid={kmitem.id}
                children={[kmitem.header]}
                key={mykey}
            />
        );
    });
    return <SourcesRow label={props.label} value={kmchildren} />;
}

function SourcesRow({
    label,
    value,
    myclass = '',
    valclass = '',
    icon = 'info',
    has_markup = false,
}) {
    const rowclass = ' ' + label.replace(/\s+/g, '-').toLowerCase();
    if (has_markup) {
        value = <HtmlCustom markup={value} />;
    } else if (typeof value == 'string' && value.indexOf('http') == 0) {
        value = (
            <a href={value} target={'_blank'}>
                {value}
            </a>
        );
    }
    valclass = valclass ? ' ' + valclass : '';
    const mykey =
        'ir-' +
        label.toLowerCase().replace(' ', '-') +
        Math.floor(Math.random() * 888888);
    return (
        <Row className={myclass + rowclass} key={mykey}>
            <span className={'u-label'}>{label}</span>{' '}
            <span className={'u-value' + valclass}>{value}</span>
        </Row>
    );
}
