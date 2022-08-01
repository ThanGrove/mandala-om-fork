/**
 * Image Slider: A simple, custom slideshow for featured images in Mandala
 * Adapted from https://tinloof.com/blog/how-to-build-an-auto-play-slideshow-with-react
 * Than Grove, Aug. 1, 2022
 *
 */
import React, { useEffect, useState, useRef } from 'react';
import '../css/ImageSlider.css';

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
                        transform: `translate3d(${-index * 215}px, 0, 0)`,
                    }}
                >
                    {images.map((animage, index) => (
                        <div className="slide" key={index}>
                            <img src={animage} width="225" />
                        </div>
                    ))}
                </div>
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
