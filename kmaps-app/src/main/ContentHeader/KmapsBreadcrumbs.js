import React, { useEffect, useState } from 'react';
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
import axios from 'axios';

/**
 * Grouping element for kmaps breadcrumbs.
 * Creates breadcrumbs based on current Kmap's itemData (Solr record in kmassets)
 * Uses the usePerspective hook that keeps track of when the perspective is changed
 * Uses state for perspName and ancetor_ids that are used to generate the breadcrumbs
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
    const [perspName, setPerspName] = useState('National Administrative Units');
    const [ancestor_ids, setAncestorIds] = useState(
        kmapData?.ancestor_ids_generic
    );
    let perspCode = usePerspective((state) => state[tree]);
    let perspData = {};
    const {
        isLoading: isPerspDataLoading,
        data: perspDataRaw,
        isError: isPerspDataError,
        error: perspDataError,
    } = useQuery(['perspective', 'data', tree], () => getPerspectiveData(tree));

    useEffect(() => {
        setAncestorIds(kmapData[`ancestor_ids_closest_${perspCode}`]);
        if (Object.keys(perspData).includes(perspCode)) {
            setPerspName(perspData[perspCode]);
        }
    }, [perspCode, perspData]);

    if (isPerspDataLoading || !kmapData) {
        return null;
    } else {
        perspDataRaw.forEach((p) => {
            perspData[p.code] = p.name;
        });
    }

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

            <div className="c-content__header__perspective">
                (Perspective: {perspName})
            </div>
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
