import { Button, Col, Modal, Row } from 'react-bootstrap';
import { CollectionField, KmapsFields } from '../common/utilcomponents';
import { HtmlCustom } from '../common/MandalaMarkup';
import React, { useState } from 'react';
import { getLangClass } from '../common/utils';

const IMAGE_FIELDS = [
    'field_image_digital|Only Digital|info',
    'field_image_color|Color|info',
    'field_image_quality|Quality|info',
    'field_image_rotation|Rotation|info',
    'field_physical_size|Physical Size|arrows',
    'field_image_capture_device|Capture Device|camera',
    'field_image_materials|Materials|th',
    'field_image_enhancement|Enhancement|plus-square-o',
    'location_constructed|Location|places',
    'copyright_statement|Copyright|copyright',
    'field_license_url|License|info',
    'field_aperture|Aperture|info',
    'field_exposure_bias|Exposure Bias|info',
    'field_flash_settings|Flash Settings|info',
    'field_focal_length|Focal Length|info',
    'field_iso_speed_rating|ISO Speed|info',
    'field_lens|lens|info',
    'field_light_source|Light Source|info',
    'field_metering_mode|Metering Mode|info',
    'field_noise_reduction|Noise Reduction|info',
    'field_organization_name|Organization|info',
    'field_original_filename|Original File Name|info',
    'field_project_name|Project|info',
    'field_sensing_method|Sensing Method|info',
    'field_sponsor_name|Sponsor|info',
    'field_spot_feature|Spot Feature|info',
];

export function ImageMetadata(props) {
    const solrdoc = props.kmasset;
    const nodejson = props.nodejson;
    const sizestr = props.sizestr ? props.sizestr : '';
    const title = nodejson?.title;
    const [photographer, setPhotographer] = useState('');

    if (nodejson) {
        nodejson['copyright_statement'] = constructCopyright(nodejson);
        nodejson['location_constructed'] = constructLocation(nodejson);
    }

    const imgdescs = nodejson?.field_image_descriptions?.und
        ? nodejson.field_image_descriptions.und
        : [];

    const capkey = 'ir-caption-main-' + Math.floor(Math.random() * 3333333);
    return (
        <>
            <Row className={'l-top'}>
                <Col className={'l-first col-sm-12 col-md-6'}>
                    <h5 className={'c-image__colhead'}>Mandala Collections</h5>
                    <div>
                        <CollectionField solrdoc={solrdoc} />
                    </div>
                </Col>
                <Col className={'col-sm-12 col-md-6'}>
                    <h5 className={'c-image__colhead'}>Classifications</h5>
                    <div className={'c-kmaps-list'}>
                        <KmapsFields
                            nodejson={nodejson}
                            kmapid={solrdoc?.kmapid}
                        />
                    </div>
                </Col>
            </Row>
            <Row className={'l-meta'}>
                <Col className={'l-first col-sm-12 col-xl-6'}>
                    <ImageRow
                        key={capkey}
                        cls={'c-image__caprow'}
                        icon={'images'}
                        label={'Caption'}
                        value={title}
                    >
                        <ImageAltTitles nodejson={nodejson} />
                    </ImageRow>

                    <hr />

                    {/* Image creators had "setMain={setPhotographer}" but can't set parent state from child */}
                    <ImageCreators json={nodejson?.field_image_agents} />
                    <ImageRow
                        key={'ir-uploader'}
                        cls={'u-data'}
                        icon={'agents'}
                        label={'Data Entry'}
                        value={solrdoc?.node_user_full_s}
                        date={processDate(nodejson?.created, 'ts')}
                    />
                    <ImageRow
                        key={'ir-image-type'}
                        cls={'u-data'}
                        icon={'square-o'}
                        label={'Type'}
                        value={nodejson?.field_image_type?.und[0].value}
                        valclass={'text-capitalize'}
                    />
                    <ImageRow
                        key={'ir-image-size'}
                        cls={'u-data'}
                        icon={'arrows'}
                        label={'size'}
                        value={sizestr}
                    />
                    <hr />
                    <ImageDescription
                        key="main-img-desc-1"
                        caption={solrdoc?.caption}
                        summary={solrdoc?.summary}
                        desc={solrdoc?.description}
                        langs={[
                            solrdoc?.caption_lang_s,
                            solrdoc?.summary_lang_s,
                            solrdoc?.description_lang_s,
                        ]}
                        authors={solrdoc?.description_authors_s}
                        hrule={solrdoc?.caption_alt_txt?.length > 0}
                    />
                    {solrdoc?.caption_alt_txt?.map((altcap, dn) => {
                        return (
                            <ImageDescription
                                caption={altcap}
                                summary={solrdoc?.summary_alt_txt[dn]}
                                desc={solrdoc?.description_alt_txt[dn]}
                                langs={[
                                    solrdoc?.caption_alt_lang_ss[dn],
                                    solrdoc?.summary_alt_lang_ss[dn],
                                    solrdoc?.description_alt_lang_ss[dn],
                                ]}
                                authors={
                                    solrdoc?.description_alt_authors_ss[dn]
                                }
                                hrule={
                                    dn + 1 < solrdoc?.caption_alt_txt?.length
                                }
                            />
                        );
                    })}
                </Col>
                <Col className={'l-second col-sm-12 col-xl-6'}>
                    {IMAGE_FIELDS.map((fdstr, i) => {
                        let pts = fdstr.split('|');
                        if (pts.length < 3) {
                            do {
                                pts.push('');
                            } while (pts.length < 3);
                        }
                        return (
                            <ImageInfoField
                                key={pts[0]}
                                fieldName={pts[0]}
                                label={pts[1]}
                                icon={pts[2]}
                                nodejson={nodejson}
                            />
                        );
                    })}
                </Col>
            </Row>
        </>
    );
}

function constructCopyright(node) {
    let holder = false;
    let stmt = false;
    let crdate = false;
    let crstring = '';
    if (node) {
        if (
            node.field_copyright_holder.und &&
            node.field_copyright_holder.und.length > 0
        ) {
            holder = node.field_copyright_holder.und[0].value;
        }
        if (
            node.field_copyright_statement.und &&
            node.field_copyright_statement.und.length > 0
        ) {
            stmt = node?.field_copyright_statement?.und[0].value;
        }
        if (
            node.field_copyright_date.und &&
            node.field_copyright_date.und.length > 0
        ) {
            crdate = new Date(node?.field_copyright_date?.und[0].value);
            crdate = crdate.getFullYear();
        }
        if (crdate && crdate.toString().length > 0) {
            crdate = crdate + '. ';
        }
        if (holder && holder.length > 0) {
            holder = holder + ',  ';
        }
        if (stmt) {
            crstring = holder + crdate + '|' + stmt;
        }
    }
    return {
        und: [{ value: crstring }],
    };
}

function constructLocation(node) {
    let long = node?.field_longitude?.und
        ? node?.field_longitude?.und[0].value
        : false;
    let lat = node?.field_latitude?.und
        ? node?.field_latitude?.und[0].value
        : false;
    let alt = node?.field_altitude?.und
        ? node?.field_altitude?.und[0].value
        : false;
    let location = false;
    if (node && lat && long) {
        if (!long || !lat || !alt) {
            return {
                und: [],
            };
        }
        if (!isNaN(long * 1)) {
            if (long > 0) {
                long = '+' + long;
            } else {
                long = '-' + long;
            }
        }

        if (!isNaN(lat)) {
            if (lat > 0) {
                lat = '+' + lat;
            } else {
                lat = '-' + lat;
            }
        }
        if (!isNaN(alt)) {
            if (alt > 0) {
                alt = '+' + alt;
            } else {
                alt = '-' + alt;
            }
        }
        location = long + ' ' + lat + ' ' + alt;
    }
    return {
        und: [{ value: location }],
    };
}

function ImageRow(props) {
    const myclass = props.cls ? props.cls : '';
    const icon = props.icon ? props.icon : 'info';
    const label = props.label ? props.label : '';
    const labclass = props.labclass ? ' ' + props.labclass : '';
    const value = props.value ? props.value : '';
    const valclass = props.valclass ? ' ' + props.valclass : '';
    const mydate = props.date ? ' (' + props.date + ')' : '';
    const mykey =
        'ir-' +
        label.toLowerCase().replace(' ', '-') +
        Math.floor(Math.random() * 888888);
    return (
        <Row className={myclass} key={mykey}>
            <Col key={mykey + '-c1'}>
                <span className={'u-icon__' + icon} />{' '}
                <span className={'u-label' + labclass}>{label}</span>{' '}
            </Col>
            <Col className={'u-value' + valclass} key={mykey + '-c2'}>
                {value}
                {mydate}
                {props.children}
            </Col>
        </Row>
    );
}

function processDate(dstr, dtype) {
    if (!dstr || dstr === '') {
        return null;
    }
    let mydate = new Date(dstr);
    if (dtype && dtype === 'ts') {
        mydate = new Date(dstr * 1000);
    }
    return mydate.toLocaleString().split(',')[0];
}

export function ImageAltTitles({ nodejson }) {
    if (!nodejson?.field_image_descriptions?.und) {
        return null;
    }
    const alt_titles = nodejson?.field_image_descriptions?.und
        ?.map((desc, di) => {
            if (
                desc?.field_summary?.und?.length > 0 &&
                desc.field_summary.und[0].value === 'Alternate Title'
            ) {
                return desc;
            }
            return null;
        })
        .filter((desc) => desc);

    return (
        <>
            {alt_titles.map((altt, ati) => {
                const langclass = getLangClass(altt);
                return (
                    <span
                        key={`alttitle_${ati}`}
                        className={`c-image__alttitle ${langclass}`}
                    >
                        {altt.title}
                    </span>
                );
            })}
        </>
    );
}

function ImageCreators(props) {
    const data = props?.json;
    if (
        !data ||
        typeof data === 'undefined' ||
        !data.und ||
        data.und.length === 0
    ) {
        return (
            <ImageRow
                cls={'u-data'}
                icon={'agents'}
                label={'Creator'}
                value={'Unknown'}
            />
        );
    }
    return (
        <>
            {data.und.map((item, n) => {
                const mydate =
                    item?.field_agent_dates?.und &&
                    item.field_agent_dates.und.length > 0
                        ? processDate(item.field_agent_dates.und[0].value)
                        : '';
                {
                    /* doesn't work
                if (
                    item.field_agent_role.und[0].value.toLocaleLowerCase() === 'photographer'
                ) {
                    props.setMain(item.title);
                }
                */
                }
                let mykey =
                    item.field_agent_role.und[0].value.toLowerCase() +
                    item.title.toLowerCase();
                mykey = mykey.replace(' ', '-');
                return (
                    <ImageRow
                        key={mykey}
                        cls={'u-data'}
                        icon={'agents'}
                        label={item.field_agent_role.und[0].value.toUpperCase()}
                        value={item.title}
                        date={mydate}
                    />
                );
            })}
        </>
    );
}

/**
 *
 * @param caption
 * @param summary
 * @param desc
 * @param langs  - a list of langs for 0 = caption, 1 = summary, 2 = description
 * @param authors
 * @param hrule
 * @returns {JSX.Element}
 * @constructor
 */
function ImageDescription({ caption, summary, desc, langs, authors, hrule }) {
    const clsstr = authors === '' ? 'byline noauthor' : 'byline';
    if (!summary) {
        if (!desc || desc?.length === 0) {
            return null;
        }
        summary = desc?.substring(0, 750);
    }
    return (
        <div className={'o-desc'}>
            <h4 className={'o-desc__title'}>{caption}</h4>
            <p className={'o-desc__' + clsstr}>{authors}</p>
            <p className={`o-desc-summary ${langs[1]}`}>{summary}</p>
            {desc?.length > 0 && (
                <ImageDescReadMore
                    desc={desc}
                    lang={langs[2]}
                    title={caption}
                    authors={authors}
                />
            )}
            {hrule && <hr className="desc-sep" />}
        </div>
    );
}

function ImageDescReadMore({ desc, lang, title, caption, authors }) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="link" onClick={handleShow}>
                Read More
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className={lang}>
                        <h3>{title}</h3>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <HtmlCustom markup={desc} className={lang} />
                    <div className="float-right">— {authors}</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

function ImageInfoField(props) {
    const node = props.nodejson;
    const field_name = props.fieldName;
    const icon = props.icon;
    const label = props.label;
    if (!node[field_name]?.und) {
        return null;
    }
    let rowclass = 'u-data';
    let value = node[field_name]?.und[0].value;

    // Custom field instructions
    if (field_name === 'location_constructed' && !value) {
        return null;
    } else if (field_name === 'field_original_filename') {
        value = <span className={'t-overwrap-any'}>{value}</span>;
    } else if (field_name === 'field_license_url') {
        const lnktxt = node[field_name].und[0].title
            .replace(/&mdash;/g, '—')
            .replace(/&amp;/g, '&');
        value = (
            <a href={value} target={'_blank'} className={'t-overwrap-any'}>
                {lnktxt}
            </a>
        );
    } else if (value.substr(0, 4) === 'http') {
        value = (
            <a href={value} target={'_blank'}>
                {value}
            </a>
        );
    } else if (field_name === 'field_image_digital') {
        value = value === '0' ? 'No' : 'Yes';
    } else if (field_name === 'field_image_rotation') {
        value += '°';
    } else if (field_name === 'copyright_statement') {
        let valpts = value.split('|');
        if (valpts[0] === '') {
            return null;
        }
        while (valpts.length < 2) {
            valpts.push('');
        }
        return (
            <>
                <Row className={'o-desc'}>
                    <Col>
                        <span className={'u-icon__' + icon} />{' '}
                        <span className={'u-label'}>{label}</span>{' '}
                    </Col>
                    <Col className={'u-value'}>{valpts[0]}</Col>
                </Row>
                <Row className={'o-desc'}>
                    <Col>{valpts[1]}</Col>
                </Row>
            </>
        );
    }

    // Special return for copyright statement to put person and date above with full-column-width description below

    return (
        <ImageRow
            cls={rowclass}
            icon={icon}
            label={label.toUpperCase()}
            value={value}
        />
    );
}
