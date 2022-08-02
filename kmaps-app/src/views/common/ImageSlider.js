/**
 * Image Slider: A simple, custom slideshow for featured images in Mandala
 * Adapted from https://tinloof.com/blog/how-to-build-an-auto-play-slideshow-with-react
 * Than Grove, Aug. 1, 2022
 *
 */
import React, { useEffect, useState, useRef } from 'react';
import '../css/ImageSlider.css';
import { useSolr } from '../../hooks/useSolr';

export function ImageSlider({ images }) {
    const [index, setIndex] = useState(0);
    const [auton, setAuto] = useState(true);
    const timeoutRef = useRef(null);
    const delay = images?.length > 4 ? 5000 : 9000;

    function resetTimeout() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    useEffect(() => {
        if (!auton || images?.length == 1) {
            return;
        }
        resetTimeout();
        timeoutRef.current = setTimeout(
            () =>
                setIndex((prevIndex) =>
                    prevIndex === images.length - 1 ? 0 : prevIndex + 1
                ),
            delay
        );

        return () => {
            resetTimeout();
        };
    }, [index]);

    // If no images given, return nothing
    if (!images || images?.length === 0 || images === '') {
        return null;
    }
    // Otherwise return the simple slideshow
    return (
        <div className="imageslider">
            <div className="wrapper">
                <div
                    className="slider"
                    style={{
                        transform: `translate3d(${-index * 275}px, 0, 0)`,
                    }}
                >
                    {images.map((animage, imind) => (
                        <div className="slide" key={imind}>
                            <img src={animage} width="275" />
                            <ImageCaption src={animage} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="captions">
                {images.map((animage, imind) => (
                    <ImageCaption
                        key={`caption-${imind}`}
                        src={animage}
                        active={imind === index}
                    />
                ))}
            </div>
            {images?.length > 1 && (
                <div className="dots">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`dot${index === idx ? ' active' : ''}`}
                            onClick={() => {
                                setAuto(false);
                                setIndex(idx);
                            }}
                        ></div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function ImageCaption({ src, active }) {
    // console.log("animage", src);
    const sidmtch = src?.match(/shanti-image-\d+/);
    const sid = sidmtch ? sidmtch[0] : '';
    // TODO: change query to use shanti_image_id_s field when it is indexed
    const sqid = `https://iiif.lib.virginia.edu/mandala/${sid}`;
    const qry = `url_iiif_s:"${sqid}/info.json"`;
    const qobj = {
        index: 'assets',
        params: {
            q: qry,
            fl: '*',
            rows: 1,
            wt: 'json',
        },
    };

    // console.log("qry", qobj);
    // Works in postman: url_iiif_s:"https://iiif.lib.virginia.edu/mandala/shanti-image-562831/info.json"
    const {
        isLoading: isImageLoading,
        data: image,
        isError: isSolrError,
        error: solrError,
    } = useSolr(sqid, qobj);
    // console.log("data in image caption", image);
    if (image?.numFound === 1 && image.docs[0]?.caption?.length > 0) {
        const activeclass = active ? ' active' : '';
        const mycap = image.docs[0].caption?.trim();
        // console.log("capt", mycap);
        if (mycap !== '(Untitled)') {
            return (
                <div className={`caption${activeclass}`}>
                    {image.docs[0].caption}
                </div>
            );
        }
    }
    return null;
}
