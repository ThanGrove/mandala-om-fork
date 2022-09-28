import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ImageCarousel } from './ImageCarousel';
import { ImageAltTitles, ImageMetadata } from './ImageMetadata';
import $ from 'jquery';
import './images.scss';
import { ImagesOSDViewer } from './ImagesOSDViewer';
import { useParams } from 'react-router-dom';
import { useKmap } from '../../hooks/useKmap';
import useMandala from '../../hooks/useMandala';
import { useHistory } from '../../hooks/useHistory';
import { RelatedAssetHeader } from '../Kmaps/RelatedAssetViewer';
import { NotFoundPage } from '../common/utilcomponents';
import MandalaSkeleton from '../common/MandalaSkeleton';

/**
 * Compontent that creates the Image Viewer page, including:
 *      1. Main Image which is an instance of the SeaDragon IIIF viewer (Viewer)
 *      2. Title and Byline
 *      3. Carousel of all images in the main images collection (ImageCarousel)
 *      4. Metadata about the image
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 * @author ndg8f (2020-09-02)
 */
export default function ImagesViewer(props) {
    const { id } = useParams();
    const imgid = props?.id ? props.id : id;
    // Build query string based on uid use asterisk for env. Ultimately uids will be images-1234 across all apps
    //    but currently e.g., images-dev_shanti_virginia_edu-13066, so images*-13066 will find that
    const querystr = `images*-${imgid}`;
    // Get record from kmasset index
    const {
        isLoading: isAssetLoading,
        data: kmasset,
        isError: isAssetError,
        error: assetError,
    } = useKmap(querystr, 'asset');

    // Get Node's JSON From AV app endpoint using url_json field in solr record
    const {
        isLoading: isNodeLoading,
        data: nodejson,
        isError: isNodeError,
        error: nodeError,
    } = useMandala(kmasset);

    // const history = useContext(HistoryContext);
    const addPage = useHistory((state) => state.addPage);

    const ismain = props.ismain;

    // usEffect Sets the title in the header and reformats the Seadragon viewer buttons for fullscreen and zoom
    useEffect(() => {
        // Setting title in header and other status options
        if (kmasset && ismain) {
            //history.addPage('images', kmasset.title, window.location.pathname);
            addPage('images', kmasset.title, window.location.pathname);
        }
        // Updating button controls for fullscreen and zoom
        const iiifview = $('.react-iiif-viewer');
        if (iiifview.length > 0) {
            const iiifchild = iiifview.children();
            if (iiifchild.length > 2) {
                $(iiifchild[1]).addClass('zoom');
                const zoomin = $(iiifchild[1]).children().eq(0);
                zoomin.addClass('in');
                zoomin.html('<span class="u-icon__zoom-in"></span>');
                const zoomout = $(iiifchild[1]).children().eq(1);
                zoomout.addClass('out');
                zoomout.html('<span class="u-icon__zoom-out"></span>');

                $(iiifchild[2]).addClass('fullscreen');
                if ($('#expand-proxy').length === 0) {
                    $(iiifchild[2])
                        .children('button')
                        .eq(0)
                        .prepend(
                            '<span id="expand-proxy" class="u-icon__enlarge"></span>'
                        );
                }
            }
        }
    }, [kmasset]);

    if (isNodeLoading || isAssetLoading) {
        return <MandalaSkeleton minWidth="500px" />;
    }

    const arrowClick = function (e) {
        const $this = $(e.target);
        const curr =
            $('.thumb.current').length > 0
                ? $('.thumb.current')
                : $('.thumb').eq(0);
        const dir = $this.parent().hasClass('before') ? 'prev' : 'next';
        const newcurr =
            dir === 'prev'
                ? curr.prev('div').find('a')
                : curr.next('div').find('a');
        try {
            $(newcurr).get(0).click();
        } catch (e) {}
    };

    // JSX Markup for the ImagesViewer component
    if (kmasset && nodejson) {
        const creator = Array.isArray(kmasset.creator)
            ? kmasset.creator.join(', ')
            : kmasset.creator;
        const sizestr = kmasset.img_width_s + ' x ' + kmasset.img_height_s;
        const rotation = nodejson?.field_image_rotation?.und[0]
            ? nodejson.field_image_rotation.und[0].value
            : false;
        return (
            <div className={'c-image'}>
                {props?.id && (
                    <RelatedAssetHeader
                        type="images"
                        subtype="picture"
                        header={kmasset.title}
                    />
                )}
                <Container fluid className={'c-image__context'}>
                    <Col className={'c-image__viewer'}>
                        <Row className={'c-image__viewer-row'}>
                            <Col className={'page-control before'}>
                                <span
                                    className={'u-icon__arrow3-left prev-arrow'}
                                    onClick={arrowClick}
                                >
                                    {' '}
                                </span>
                            </Col>
                            <Col>
                                <ImagesOSDViewer
                                    manifest={kmasset.url_iiif_s}
                                    rotation={rotation}
                                />
                            </Col>
                            <Col className={'page-control after'}>
                                <span
                                    className={
                                        'u-icon__arrow3-right next-arrow'
                                    }
                                    onClick={arrowClick}
                                >
                                    {' '}
                                </span>
                            </Col>
                        </Row>
                        <div className={'c-image__caption'}>
                            <h1 className={'c-image__title'}>
                                <span className={'u-icon__images'}> </span>
                                {kmasset.title}
                                <ImageAltTitles nodejson={nodejson} />
                            </h1>
                            <div className={'c-image__byline'}>
                                {creator && (
                                    <>
                                        <span className={'author'}>
                                            {creator}
                                        </span>{' '}
                                        |{' '}
                                    </>
                                )}
                                <span className={'size'}>{sizestr}</span>
                            </div>
                        </div>
                        <ImageCarousel kmasset={kmasset} />
                    </Col>
                </Container>
                <Container className={'c-image__metadata'}>
                    <ImageMetadata
                        kmasset={kmasset}
                        nodejson={nodejson}
                        sizestr={sizestr}
                    />
                </Container>
            </div>
        );
    } else {
        return <NotFoundPage div={true} atype="image" id={id} />;
    }
}
