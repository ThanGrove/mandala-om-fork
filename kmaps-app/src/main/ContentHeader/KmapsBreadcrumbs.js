import React from 'react';
import { Link } from 'react-router-dom';
import { useView } from '../../hooks/useView';
import { useKmap } from '../../hooks/useKmap';
import MandalaSkeleton from '../../views/common/MandalaSkeleton';
import {
    capitalize,
    getHeaderForView,
    queryID,
} from '../../views/common/utils';
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
export function KmapsBreadcrumbs({ kmapData, itemTitle, itemType }) {
    const tree = kmapData?.tree ? kmapData.tree : 'places';

    let perspCode = usePerspective((state) => state[tree]);
    let perspective = 'National Administrative Units';
    /*
    const {
        isLoading: isPerspDataLoading,
        data: perspData,
        isError: isPerspDataError,
        error: perspDataError,
    } = useQuery(['perspective', 'data', tree], () => getPerspectiveData(tree));

    if (isPerspDataLoading || !kmapData) {
        return null;
    }

    let ancestor_ids = kmapData?.ancestor_ids_is
        ? kmapData.ancestor_ids_is
        : [];
    const prsp_ancestors =
        kmapData[`ancestor_ids_closest_${perspCode}`] &&
        kmapData[`ancestor_ids_closest_${perspCode}`].length > 0
            ? kmapData[`ancestor_ids_closest_${perspCode}`]
            : false;
    if (prsp_ancestors) {
        ancestor_ids = prsp_ancestors;
        perspData.forEach((prsp) => {
            if (prsp.code === perspCode) {
                perspective = prsp.name;
            }
        });
    } else {
        ancestor_ids = kmapData?.ancestor_ids_generic;
    }

     */
    let ancestor_ids = kmapData?.ancestor_ids_generic;
    const perspEl = (
        <div className="c-content__header__perspective">
            (Perspective: {perspective})
        </div>
    );
    return (
        <>
            <Link to="#" className="breadcrumb-item">
                {capitalize(tree)}
            </Link>
            {ancestor_ids?.map((aid, idn) => {
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
function KmapsBreadcrumb({ tree, kid, root }) {
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
