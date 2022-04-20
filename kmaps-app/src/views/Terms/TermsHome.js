import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { FeatureCollection } from '../common/FeatureCollection';

export function TermsHome(props) {
    const { view_mode } = useParams();
    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(50);

    // See line in .env.tibet. Set to: REACT_APP_TERMS_SORT=position_i or whatever the field is
    const tmsort_envvar = process.env?.REACT_APP_TERMS_SORT;
    const sortfield =
        tmsort_envvar && !(tmsort_envvar === '')
            ? tmsort_envvar
            : 'title_latin_sort';
    const qval =
        sortfield === 'cascading_position_i'
            ? 'asset_type:terms AND cascading_position_i:*'
            : 'asset_type:terms';
    const q = {
        index: 'assets',
        params: {
            q: qval,
            rows: pageSize,
            start: startRow,
            sort: `${sortfield} ASC`,
        },
    };

    const {
        isLoading: isTermsLoading,
        data: termsData,
        isError: isTermsError,
        error: termsError,
    } = useSolr(['all-terms', sortfield, pageSize, startRow, pageNum], q);

    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    if (isTermsLoading) {
        return <MandalaSkeleton />;
    }

    const numFound = termsData?.numFound;
    const hasMore = numFound && (pageNum + 1) * pageSize < numFound;

    return (
        <div className="terms-home">
            <h1>Terms</h1>
            <FeatureCollection
                docs={termsData?.docs}
                assetCount={numFound}
                viewMode={view_mode}
                page={pageNum}
                setPage={setPageNum}
                perPage={pageSize}
                setPerPage={setPageSize}
                isPreviousData={false}
                hasMore={hasMore}
            />
        </div>
    );
}

export default TermsHome;
