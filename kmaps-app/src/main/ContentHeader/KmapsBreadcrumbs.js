import React from 'react';
import { Link } from 'react-router-dom';
import { useView } from '../../hooks/useView';
import { useKmap } from '../../hooks/useKmap';
import MandalaSkeleton from '../../views/common/MandalaSkeleton';
import { getHeaderForView, queryID } from '../../views/common/utils';
import { HtmlCustom } from '../../views/common/MandalaMarkup';
import { usePerspective } from '../../hooks/usePerspective';
import { useQuery } from 'react-query';
import { getPerspectiveData } from '../../views/KmapTree/KmapPerspectives';

/**
 * Grouping element for kmaps breadcrumbs.
 * Creates breadcrumbs based on current Kmap's itemData (Solr record in kmassets)
 * Uses ancestor_ids
 *
 * TODO: Determine ancestor_id list based on perspective (may have to use _closets_ancetsors_
 *
 * @param itemData
 * @param itemTitle
 * @param itemType
 * @returns {JSX.Element}
 * @constructor
 */
export function KmapsBreadcrumbs({ itemData, itemTitle, itemType }) {
    const tree = itemData.asset_type;
    let perspective = usePerspective((state) => state[tree]);
    const {
        isLoading: isPerspDataLoading,
        data: perspData,
        isError: isPerspDataError,
        error: perspDataError,
    } = useQuery(['perspective', 'data', tree], () => getPerspectiveData(tree));
    if (isPerspDataLoading) {
        return null;
    }
    perspData.forEach((prsp) => {
        if (prsp.code === perspective) {
            perspective = prsp.name;
        }
    });
    const perspEl = (
        <div className="c-content__header__perspective">
            (Perspective: {perspective})
        </div>
    );
    return (
        <>
            {itemData?.ancestor_ids_is?.map((aid, idn) => {
                return (
                    <KmapsBreadcrumb
                        key={`kmap-bcrumb-${idn}`}
                        tree={tree}
                        kid={aid}
                    />
                );
            })}

            {perspEl}
        </>
    );
}

// A kmap breadcrumb
function KmapsBreadcrumb({ tree, kid }) {
    const view = useView((state) => state[tree]);
    const uid = queryID(tree, kid);
    const {
        isLoading: isKmapLoading,
        data: kmapData,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(uid, 'info');
    if (isKmapLoading) {
        return <MandalaSkeleton />;
    }
    const kmurl = `/${tree}/${kid}`;
    const label = getHeaderForView(kmapData, view);
    return (
        <Link to={kmurl} className="breadcrumb-item">
            <HtmlCustom markup={label} />
        </Link>
    );
}
