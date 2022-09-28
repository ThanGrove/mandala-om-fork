import React, { useEffect, useState, useContext } from 'react';
import { useKmap } from '../../hooks/useKmap';
import useMandala from '../../hooks/useMandala';
import { useParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import './visuals.scss';
import { HtmlCustom } from '../common/MandalaMarkup';
import { MandalaPopover } from '../common/MandalaPopover';
import { useHistory } from '../../hooks/useHistory';
import { RelatedAssetHeader } from '../Kmaps/RelatedAssetViewer';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { NotFoundPage } from '../common/utilcomponents';

export default function VisualsViewer(props) {
    const baseType = `visuals`;
    const { id } = useParams();
    const visId = props.id ? props.id : id;
    const queryID = `${baseType}*-${visId}`;
    const addPage = useHistory((state) => state.addPage);

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

    const solrdoc = kmasset;
    const nodejson = nodeData;

    const [mycoll, setMyColl] = useState({});
    const [snjson, setSnJson] = useState({});

    useEffect(() => {
        if (nodejson) {
            const jstr = nodejson.shivanode_json.und[0].value;
            setSnJson(JSON.parse(jstr));
        }
    }, [nodejson, kmasset]);

    if (isAssetLoading || isNodeLoading) {
        return (
            <Container fluid className="c-visual__container">
                <Col className="c-visual">
                    <MandalaSkeleton />
                </Col>
            </Container>
        );
    }

    if (isAssetError || isNodeError) {
        if (isAssetError) {
            return (
                <Container fluid className="c-visual__container">
                    <Col className="c-visual">
                        <div className="error">Error: {assetError.message}</div>
                    </Col>
                </Container>
            );
        }
        if (isNodeError) {
            return (
                <Container fluid className="c-visual__container">
                    <Col className="c-visual">
                        <div className="error">Error: {nodeError.message}</div>
                    </Col>
                </Container>
            );
        }
    }

    if (!isAssetLoading && !isAssetError) {
        // history.addPage(baseType, kmasset.title, window.location.pathname);
        addPage(baseType, kmasset.title, window.location.pathname);
    }
    const mydate = new Date(solrdoc?.node_created);
    const mytype = snjson && snjson.shivaGroup ? snjson.shivaGroup : '';
    const has_sheet =
        mytype == 'Chart' ||
        mytype == 'Graph' ||
        mytype.toLowerCase().includes('timeline');
    const vidsrc =
        mytype == 'Video' && isNaN(snjson?.dataSourceUrl) ? 'YouTube' : 'Vimeo';
    const vidurl =
        vidsrc == 'YouTube'
            ? 'https://www.youtube.com/watch?v=' + snjson?.dataSourceUrl
            : 'https://vimeo.com/' + snjson?.dataSourceUrl;
    return (
        <>
            {props?.id && (
                <RelatedAssetHeader
                    type="visuals"
                    subtype={nodejson?.shivanode_element_type?.label}
                    header={kmasset.title}
                />
            )}
            <Container fluid className={'c-visual__container'}>
                {nodejson && (
                    <Col className={'c-visual'}>
                        <div className={'c-visual__player'}>
                            <HtmlCustom markup={nodejson?.iframe} />
                        </div>
                        <div
                            className={'c-visual__info'}
                            style={{ width: snjson.width + 'px' }}
                        >
                            <h2>
                                <span className={'u-icon__visuals'}></span>
                                <span className={'title'}>
                                    {solrdoc?.title}
                                </span>
                            </h2>
                            <VisualsRow
                                label={'Collection'}
                                value={mycoll.name}
                                url={mycoll.uid}
                                icon={'collections'}
                            />
                            <VisualsRow
                                label={'Type'}
                                value={nodejson?.shivanode_element_type?.label}
                                icon={'th'}
                            />
                            <VisualsRow
                                label={'Date'}
                                value={mydate.toLocaleDateString()}
                                icon={'calendar'}
                            />
                            <VisualsRow
                                label={'Data Entry'}
                                value={solrdoc?.node_user}
                                icon={'agents'}
                            />
                            <VisualsRow
                                label={'UID'}
                                value={'visuals-' + solrdoc?.id}
                            />
                            <VisualsKmap
                                label={'Language'}
                                field={nodejson?.field_language_kmap}
                                icon={'comments-o'}
                            />
                            <VisualsKmap
                                label={'Subjects'}
                                field={nodejson?.field_subjects_kmap}
                                icon={'subjects'}
                            />
                            <VisualsKmap
                                label={'Places'}
                                field={nodejson?.field_places_kmap}
                                icon={'places'}
                            />
                            <VisualsKmap
                                label={'Terms'}
                                field={nodejson?.field_terms_kmap}
                                icon={'terms'}
                            />
                            {nodejson?.shivanode_description?.und &&
                                nodejson?.shivanode_description?.und.length >
                                    0 && (
                                    <VisualsRow
                                        label={'Description'}
                                        value={
                                            nodejson?.shivanode_description
                                                ?.und[0].safe_value
                                        }
                                        has_markup={true}
                                        myclass={'visdesc'}
                                        icon={'file-text-o'}
                                    />
                                )}
                            {snjson?.dataSourceUrl && has_sheet && (
                                <VisualsRow
                                    label={'Data Source'}
                                    value={'External spreadsheet'}
                                    url={snjson.dataSourceUrl}
                                    icon={'list-alt'}
                                />
                            )}
                            {snjson?.dataSourceUrl && mytype == 'Video' && (
                                <VisualsRow
                                    label={'Data Source'}
                                    value={vidsrc}
                                    url={vidurl}
                                    icon={'list-alt'}
                                />
                            )}
                        </div>
                    </Col>
                )}
                {!nodejson && (
                    <Col className={'c-visual'}>
                        <NotFoundPage div={false} atype="visual" id={id} />
                    </Col>
                )}
            </Container>
        </>
    );
}

function VisualsRow(props) {
    const label = props?.label;
    let value = props?.value;
    const url = props?.url;
    let icon = props?.icon;
    const has_markup = props?.has_markup;
    const myclass = props?.myclass ? ' ' + props.myclass : '';
    const valclass = props?.valclass ? ' ' + props?.valclass : '';

    if (!icon) {
        icon = 'info';
    }
    const rowclass = label.replace(/\s+/g, '-').toLowerCase();
    if (has_markup) {
        value = <HtmlCustom markup={value} />;
    } else if (url) {
        value = (
            <a href={url} target={'_blank'}>
                {value}
            </a>
        );
    }
    const mykey =
        'ir-' +
        label.toLowerCase().replace(' ', '-') +
        Math.floor(Math.random() * 888888);
    return (
        <Row className={rowclass + myclass} key={mykey}>
            <span className={'icon u-icon__' + icon}></span>
            <span className={'u-label'}>{label}</span>{' '}
            <span className={'u-value' + valclass}>{value}</span>
        </Row>
    );
}

function VisualsKmap(props) {
    const kmfield = props.field;
    const icon = props?.icon ? props.icon : 'info';
    if (!kmfield || !kmfield?.und || kmfield.und.length == 0) {
        return null;
    }
    const kmchildren = kmfield.und.map((kmitem, kmind) => {
        const kmkey = `${kmitem.domain}-${kmitem.id}-${kmind}`;
        return (
            <MandalaPopover
                key={kmkey}
                domain={kmitem.domain}
                kid={kmitem.id}
                children={[kmitem.header]}
            />
        );
    });
    return (
        <VisualsRow
            label={props.label}
            value={kmchildren}
            icon={icon}
            myclass={'kmapfield'}
            valclass={'kmapval'}
        />
    );
}
