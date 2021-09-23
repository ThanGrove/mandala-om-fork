import { FacetBox } from './FacetBox';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import { HistoryBox } from './HistoryBox';
import { useSearch } from '../hooks/useSearch';
import { closeStore } from '../hooks/useCloseStore';
import {
    useQueryParams,
    StringParam,
    withDefault,
    encodeQueryParams,
} from 'use-query-params';
import { IconContext } from 'react-icons';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { stringify } from 'query-string';
import { ArrayOfObjectsParam } from '../hooks/utils';
import MandalaSkeleton from '../views/common/MandalaSkeleton';
import { Redirect } from 'react-router';

const SEARCH_PATH = '/search/:view';

export default function SearchAdvanced(props) {
    const history = useHistory();
    const location = useLocation();
    let [reset, setReset] = useState(0);

    // Get function to handle closeButton state.
    const handleCloseButton = closeStore((state) => state.changeButtonState);

    // eslint-disable-next-line no-unused-vars
    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    const { searchText: search, filters } = query;

    // This tells us whether we are viewing the search results
    // so that we can give a link to go there (or not).
    const searchView = useRouteMatch(SEARCH_PATH);

    // console.log("SearchAdvance searchView = ", searchView);
    let [booleanControls, setBooleanControls] = useState(true);
    const {
        isLoading: isSearchLoading,
        data: searchData,
        isError: isSearchError,
        error: searchError,
    } = useSearch(search, 0, 0, 'all', 0, 0, true, filters);

    let openclass = props.advanced ? 'open' : 'closed';
    //const historyStack = useStoreState((state) => state.history.historyStack);
    const historyStack = {};

    if (isSearchLoading) {
        return (
            <aside
                id="l-column__search"
                className={`l-column__search ${openclass}`}
            >
                <MandalaSkeleton
                    count={11}
                    height={25}
                    width={'100%'}
                    marginTop={'2rem'}
                />
            </aside>
        );
    }

    if (isSearchError) {
        return (
            <aside
                id="l-column__search"
                className={`l-column__search ${openclass}`}
            >
                <span>Error: {searchError.message}</span>
            </aside>
        );
    }

    const handleBooleanControlClick = () =>
        setBooleanControls(!booleanControls);

    function gotoSearchPage(newFilters) {
        if (!searchView) {
            //encode each parameter according to the configuration
            const encodedQuery = encodeQueryParams(
                {
                    searchText: StringParam,
                    filters: withDefault(ArrayOfObjectsParam, []),
                },
                {
                    searchText: search,
                    filters: newFilters,
                }
            );

            if (process.env.REACT_APP_STANDALONE === 'standalone') {
                window.location.hash = `#/search/deck?${stringify(
                    encodedQuery
                )}`;
            } else {
                history.push({
                    pathname: `/search/deck`,
                    search: `?${stringify(encodedQuery)}`,
                });
            }
        } else {
            setQuery(
                {
                    searchText: search,
                    filters: newFilters,
                },
                'push'
            );
        }
    }

    function handleFacetChange(msg) {
        let newFilters = [...filters];
        const command = {
            facetType: msg.facetType,
            value: msg.value,
            operator: msg.operator,
            action: msg.action,
        };

        const compound_id = `${msg.facetType}:${msg.value}`;

        if (command.action === null || command.action === 'add') {
            const new_filter = {
                id: compound_id,
                label: msg.labelText,
                operator: msg.operator,
                field: msg.facetType,
                match: msg.value,
            };
            let shouldAdd = true;
            newFilters = newFilters.map((filter) => {
                if (filter.id === new_filter.id) {
                    shouldAdd = false;
                    return new_filter;
                }
                return filter;
            });
            if (shouldAdd) {
                newFilters = [...newFilters, new_filter];
            }
        } else if (command.action === 'remove') {
            newFilters = newFilters.filter(
                (filter) => !(filter.id === compound_id)
            );
        }
        gotoSearchPage(newFilters); // declaratively navigate to search
    }

    function handleNarrowFilters(narrowFilter) {
        const search = props?.search;
        if (search) {
            search.narrowFilters(narrowFilter);
        }
    }

    function getChosenFacets(type) {
        return filters.filter((filter) => filter.field === type);
    }

    function handleResetFilters() {
        setQuery(
            {
                searchText: search,
                filters: [],
            },
            'push'
        );
    }

    function handleResetAll() {
        setQuery(
            {
                searchText: '',
                filters: [],
            },
            'push'
        );
    }

    if (searchView?.params?.view === ':view') {
        return <Redirect to={`/search/deck${location.search}`} />;
    }

    // TODO: review whether the FacetBoxes should be a configured list rather than hand-managed components as they are now.
    return (
        <aside
            id="l-column__search"
            className={`l-column__search ${openclass}`}
        >
            <div className="search-column-header-filters">
                <h4>
                    Total Results
                    <span className={'header-label-count'}>
                        <Badge pill variant={'secondary'}>
                            {searchData.response?.numFound}
                        </Badge>
                    </span>
                </h4>
                <button
                    onClick={handleCloseButton}
                    className={'search-column-close-filters'}
                >
                    <span className={'icon shanticon-cancel'}></span>
                </button>
            </div>

            <div className="search-column-reset-filters">
                {process.env.REACT_APP_STANDALONE !== 'standalone' && (
                    <Button
                        onClick={() =>
                            history.push(`/search/deck${location.search}`)
                        }
                        variant="link"
                        className={'back-to-results'}
                    >
                        <span className={'header-icon'}>
                            <span className="icon shanticon-magnify"></span>
                        </span>
                        View Results
                    </Button>
                )}
                {process.env.REACT_APP_STANDALONE === 'standalone' && (
                    <span className={'header-label-count back-to-results'}>
                        <a href={`#/search/deck${location.search}`}>
                            <span className={'header-icon'}>
                                <span className="icon shanticon-magnify"></span>
                            </span>
                            View Results
                        </a>
                    </span>
                )}

                <button onClick={handleResetAll}>Clear All</button>
            </div>
            <p>Filters for refining search results.</p>
            <section>
                <FacetBox
                    id="asset_count"
                    label="resource type"
                    facets={searchData.facets?.asset_count?.numBuckets}
                    facetType={'asset_type'}
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('asset_type')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="collections"
                    label="collections"
                    facets={searchData.facets?.collections?.numBuckets}
                    facetType="collections"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('collections')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="related_subjects"
                    label="related subjects"
                    facets={searchData.facets?.related_subjects?.numBuckets}
                    facetType="subjects"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('subjects')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="related_places"
                    label="related places"
                    facets={searchData.facets?.related_places?.numBuckets}
                    facetType="places"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('places')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="related_terms"
                    label="related terms"
                    facets={searchData.facets?.related_terms?.numBuckets}
                    facetType="terms"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('terms')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="feature_types"
                    label="feature types"
                    facets={searchData.facets?.feature_types?.numBuckets}
                    facetType="feature_types"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('feature_types')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="languages"
                    label="languages"
                    facets={searchData.facets?.languages?.numBuckets}
                    facetType="languages"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('languages')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="node_user"
                    label="users"
                    facets={searchData.facets?.node_user?.numBuckets}
                    facetType="users"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('users')}
                    booleanControls={booleanControls}
                />

                <FacetBox
                    id="creator"
                    label="creator"
                    facets={searchData.facets?.creator?.numBuckets}
                    facetType="creator"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('creator')}
                    booleanControls={booleanControls}
                />

                <FacetBox
                    id="perspective"
                    label="perspective"
                    facets={searchData.facets?.perspective?.numBuckets}
                    facetType="perspective"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('perspective')}
                    booleanControls={booleanControls}
                />

                <FacetBox
                    id="associated_subjects"
                    label="Associated Subjects"
                    facets={searchData.facets?.associated_subjects?.numBuckets}
                    facetType="associated_subjects"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('associated_subjects')}
                    booleanControls={booleanControls}
                />

                <HistoryBox
                    historyStack={historyStack}
                    id="recent"
                    label="Recently Viewed"
                    facetType="recent-searches"
                />
            </section>
            <div className={'sui-advFooter'}>
                Show Boolean Controls? &nbsp;
                <input
                    type="checkbox"
                    onChange={handleBooleanControlClick}
                    checked={booleanControls}
                    id="sui-showBool"
                ></input>
            </div>
        </aside>
    );
}
