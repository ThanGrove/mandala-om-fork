import { findFieldNames, queryID } from '../common/utils';
import { useKmap } from '../../hooks/useKmap';
import useMandala from '../../hooks/useMandala';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { HtmlWithPopovers } from '../common/MandalaMarkup';
import React from 'react';
import { MandalaInfoPopover } from '../common/utilcomponents';
import { Link } from 'react-router-dom';

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

    // console.log('text json api', textjson);

    // Authors
    let authors = textjson?.field_book_author?.und
        ?.map((au, ai) => {
            return au?.safe_value ? au.safe_value : au?.value ? au.value : null;
        })
        .filter((au) => {
            return au;
        });
    const lastauth = authors?.pop();
    authors =
        authors?.length > 0
            ? authors?.join(', ') + ` and ${lastauth}`
            : lastauth;

    // Pubdate
    let pubdate =
        textjson?.field_dc_date_publication_year?.und?.length > 0
            ? textjson.field_dc_date_publication_year.und[0]?.value
            : textjson?.field_dc_date_original_year?.und?.length > 0
            ? textjson.field_dc_date_original_year.und[0]?.value
            : null;
    pubdate = pubdate && pubdate?.length > 0 ? pubdate.split('-')[0] : null;

    // Collection
    const cdata = textjson?.field_og_collection;
    const coll = cdata ? (
        <Link to={`/texts/collection/${cdata?.nid}`}>{cdata?.title}</Link>
    ) : (
        false
    );

    const isToc = textjson?.toc_links && textjson.toc_links.length > 0;
    return (
        <>
            <div className="c-kmaps-related-text">
                <h1 className="title">{textjson?.title}</h1>
                <h2 className="byline">
                    {authors && <>By {authors}</>}
                    {pubdate && <> ({pubdate})</>}
                    {coll && (
                        <>
                            {' '}
                            {authors ? ' from' : 'From'} {coll}
                        </>
                    )}
                </h2>
                <HtmlWithPopovers markup={textjson?.full_markup} />
            </div>
        </>
    );
}
