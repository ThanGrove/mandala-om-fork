import React from 'react';
import { ImStack } from 'react-icons/im';
import { BsCheckCircle, BsMap } from 'react-icons/bs';

const ICON_MAP = {
    'audio-video': <span className={'icon u-icon__audio-video'} />,
    texts: <span className={'icon u-icon__texts'} />,
    'texts:pages': <span className={'icon u-icon__texts'} />,
    images: <span className={'icon u-icon__images'} />,
    sources: <span className={'icon u-icon__sources'} />,
    visuals: <span className={'icon u-icon__visuals'} />,
    places: <span className={'icon u-icon__places'} />,
    subjects: <span className={'icon u-icon__subjects'} />,
    terms: <span className={'icon u-icon__terms'} />,
    collections: <ImStack />,
    asset_type: <BsCheckCircle />,
    users: <span className={'icon u-icon__community'} />,
    creator: <span className={'icon u-icon__agents'} />,
    languages: <span className={'icon u-icon__comments-o'} />,
    feature_types: <BsMap />,
    associated_subjects: <span className={'icon u-icon__essays'} />,
    perspective: <span className={'icon u-icon__file-picture'} />,
};

const RecentSearchItem = ({ searchText, filters }) => {
    return (
        <span>
            {searchText.trim() ? searchText : '<Empty>'} {` `}
            {filters.map((filter) => (
                <span key={filter.id}>
                    {` + `}
                    {ICON_MAP[filter.field]}
                </span>
            ))}
        </span>
    );
};

export default RecentSearchItem;
