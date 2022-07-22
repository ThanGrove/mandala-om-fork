import React from 'react';

import './HistoryViewer.css';

import { Link } from 'react-router-dom';
import { encodeQueryParams, StringParam, withDefault } from 'use-query-params';
import { useRecentSearch } from '../../hooks/useRecentSearch';
import { ArrayOfObjectsParam } from '../../hooks/utils';
import RecentSearchItem from './RecentSearchItem';
import { stringify } from 'query-string';
export function SearchViewer(props) {
    //const history = useContext(HistoryContext);
    let searches = props.searches;

    const removeSearchPage = useRecentSearch((state) => state.removeSearchPage);

    if (!searches || searches.length === 0) {
        return null;
    }

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
                                >
                                    <RecentSearchItem
                                        searchText={searchText}
                                        filters={filters}
                                    />
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
