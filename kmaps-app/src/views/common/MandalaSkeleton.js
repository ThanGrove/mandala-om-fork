import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import React from 'react';

export default function MandalaSkeleton(props) {
    // Settings
    let settings = {
        color: '#d0d0d0',
        count: 1,
        duration: 0.5,
        fontSize: '1.4rem',
        height: 47.5,
        highlightColor: '#a5a5a5',
        maxWidth: '35rem',
        minWidth: '15rem',
        marginTop: '0',
        padding: '1.6rem',
        variant: 'rect',
        width: '25%',
    };
    settings = { ...settings, ...props };
    let styleobj = {
        maxWidth: settings.maxWidth,
        minWidth: settings.minWidth,
        fontSize: settings.fontSize,
        width: settings.width,
        padding: settings.padding,
        marginTop: settings.marginTop,
    };
    if (props.overlay) {
        const overlaystyles = {
            position: 'relative',
            maxWidth: 'unset',
            width: '100%',
            minHeight: 1000,
            top: 0,
            left: 0,
            zIndex: 5000,
        };
        styleobj = { ...styleobj, ...overlaystyles };
    }
    return (
        <div style={styleobj}>
            <SkeletonTheme
                color={settings.color}
                highlightColor={settings.highlightColor}
            >
                <Skeleton
                    variang={settings.variant}
                    duration={settings.duration}
                    count={settings.count}
                    height={settings.height}
                />
            </SkeletonTheme>
        </div>
    );
}
