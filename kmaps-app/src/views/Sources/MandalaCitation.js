import React from 'react';
import { queryID } from '../common/utils';
import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { HtmlCustom } from '../common/MandalaMarkup';
import useAsset from '../../hooks/useAsset';

export default function MandalaCitation({ srcid }) {
    const {
        isLoading: isSourceLoading,
        data: sourceData,
        isError: isSourceError,
        error: sourceError,
    } = useAsset('sources', srcid);

    if (isSourceLoading) {
        return <MandalaSkeleton />;
    }

    let citation = null;
    if (sourceData?.numFound > 0) {
        citation = sourceData.docs[0]?.citation_s;
        citation = citation.replace(/<\/?a[^>]*>/g, '');
        citation += ` (<a href="/sources/${srcid}">View</a>)`;
        if (citation && citation?.length > 0) {
            citation = <HtmlCustom markup={citation} />;
        }
    }
    return citation;
}
