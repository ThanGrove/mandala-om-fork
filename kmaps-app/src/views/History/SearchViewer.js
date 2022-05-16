import React from 'react';

import './HistoryViewer.css';

import { Link } from 'react-router-dom';
import { encodeQueryParams, StringParam, withDefault } from 'use-query-params';
import { ImStack } from 'react-icons/im';
import { BsCheckCircle, BsMap } from 'react-icons/bs';
import { capitalAsset } from '../common/utils';
import { useRecentSearch } from '../../hooks/useRecentSearch';
import { ArrayOfObjectsParam } from '../../hooks/utils';
import { stringify } from 'query-string';
export function SearchViewer(props) {
    //const history = useContext(HistoryContext);
    let searches = props.searches;

    const removeSearchPage = useRecentSearch((state) => state.removeSearchPage);

    if (!searches || searches.length === 0) {
        return null;
    }

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

    return (
        <div className="c-HistoryViewer">
            {searches &&
                searches.map((search, index) => {
                    const { searchText, filters } = search;

                    const encodedQuery = encodeQueryParams(
                        {
                            searchText: StringParam,
                            filters: withDefault(ArrayOfObjectsParam, []),
                        },
                        search
                    );

                    return (
                        <div
                            className="c-HistoryViewer__relatedRecentItem"
                            key={`${stringify(searchText)}_${index}`}
                        >
                            <span className="c-HistoryViewer__title">
                                <Link
                                    to={`/search/deck?${stringify(
                                        encodedQuery
                                    )}`}
                                    title={searchText}
                                >
                                    {searchText.trim() ? searchText : '<Empty>'}
                                </Link>
                            </span>
                            <span
                                className="c-HistoryViewer__removeItem u-icon__cancel-circle icon"
                                alt="Remove from list"
                                aria-label="Remove from list"
                                data-search-text={searchText}
                                onClick={(event) => {
                                    const searchID =
                                        event.target.getAttribute(
                                            'data-search-text'
                                        );
                                    removeSearchPage(searchID);
                                }}
                            >
                                {' '}
                            </span>
                        </div>
                    );
                })}
        </div>
    );
}

export default SearchViewer;
