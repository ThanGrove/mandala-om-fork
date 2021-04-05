import React, { useState } from 'react';
import { FeatureCollection } from './common/FeatureCollection';
import { useSearchStore } from '../hooks/useSearchStore';
import { useFilterStore } from '../hooks/useFilterStore';
import { useSearch } from '../hooks/useSearch';
import { useParams } from 'react-router-dom';
import { useQueryParams, StringParam, withDefault } from 'use-query-params';
import { ArrayOfObjectsParam } from '../hooks/utils';
import MandalaSkeleton from './common/MandalaSkeleton';

export function SearchViewer() {
    const { viewMode } = useParams();

    // eslint-disable-next-line no-unused-vars
    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    const { searchText: search, filters } = query;

    const [perPage, setPerPage] = useState(100); // These are the rows returned
    const [page, setPage] = useState(0); // Start will always be page * perPage
    const {
        isLoading: isSearchLoading,
        data: searchData,
        isError: isSearchError,
        error: searchError,
        isPreviousData,
    } = useSearch(search, page, perPage, 'none', 0, 0, true, filters);

    if (isSearchLoading) {
        return (
            <div>
                <MandalaSkeleton />
            </div>
        );
    }

    if (isSearchError) {
        return (
            <div>
                <span>Error: {searchError.message}</span>
            </div>
        );
    }

    const docs = searchData.response?.docs ?? [];
    const numFound = searchData.response?.numFound ?? 0;
    let output = (
        <FeatureCollection
            docs={docs}
            viewMode={viewMode}
            inline={false}
            page={page}
            setPage={setPage}
            perPage={perPage}
            setPerPage={setPerPage}
            isPreviousData={isPreviousData}
            assetCount={numFound}
            showSearchFilters={true}
            hasMore={numFound <= page * perPage + perPage ? false : true}
        />
    );
    return output;
}
