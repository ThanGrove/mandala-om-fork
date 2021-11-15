import { findFieldNames, queryID } from '../common/utils';
import { useKmap } from '../../hooks/useKmap';
import useMandala from '../../hooks/useMandala';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { HtmlWithPopovers } from '../common/MandalaMarkup';
import React from 'react';
import { MandalaInfoPopover } from '../common/utilcomponents';

export function RelatedTextFinder({ kmapdata }) {
    let txtidfield = findFieldNames(kmapdata, 'homepage_text_', 'starts');
    if (!txtidfield || txtidfield.length === 0) return null;
    txtidfield = txtidfield[0];
    const kid = kmapdata[txtidfield];
    return <RelatedText kid={kid} />;
}

export function RelatedText({ kid }) {
    const {
        isLoading: isAssetLoading,
        data: textasset,
        isError: isAssetError,
        error: assetError,
    } = useKmap(queryID('texts', kid), 'asset');

    const {
        isLoading: isJsonLoading,
        data: textjson,
        isError: isJsonError,
        error: jsonError,
    } = useMandala(textasset);

    if (isAssetLoading || isJsonLoading) return <MandalaSkeleton />;
    if (!textjson?.full_markup) return null;

    if (textjson?.bibl_summary) {
        //console.log(textjson.bibl_summary);
    }
    const isToc = textjson?.toc_links && textjson.toc_links.length > 0;
    const defkey = isToc ? 'toc' : 'info';
    return (
        <>
            <div className="c-kmaps-related-text">
                <MandalaInfoPopover
                    markup={textjson?.bibl_summary}
                    clnm="kmaps-related-text-info"
                />
                <HtmlWithPopovers markup={textjson?.full_markup} />
            </div>
        </>
    );
}
