import React, { useContext, useEffect } from 'react';
import { Switch, Route, useRouteMatch, useParams } from 'react-router-dom';
import { useKmap } from '../../hooks/useKmap';
import { useKmapRelated } from '../../hooks/useKmapRelated';
import { useUnPackedMemoized } from '../../hooks/utils';
import TermNames from './TermNames';
import _, { divide } from 'lodash';
import TermsDetails from './TermsDetails';
import { queryID } from '../../views/common/utils';
import { useHistory } from '../../hooks/useHistory';
import RelatedAssetViewer from '../Kmaps/RelatedAssetViewer';
import MandalaSkeleton from '../common/MandalaSkeleton';
import './TermsInfo.scss';
import { openTabStore } from '../../hooks/useCloseStore';
import { HtmlCustom } from '../common/MandalaMarkup';

const RelatedsGallery = React.lazy(() =>
    import('../../views/common/RelatedsGallery')
);

const TermsDefinitionsFilter = React.lazy(() =>
    import('./TermsDefinitionsFilter')
);

const TermsRelatedNodes = React.lazy(() => import('./TermsRelatedNodes'));

const TermsInfo = (props) => {
    // id is of format: asset_type-kid (ex. terms-81593)
    let { path } = useRouteMatch();
    let { id } = useParams();
    const setOpenTab = openTabStore((state) => state.changeButtonState);
    const openTab = openTabStore((state) => state.openTab);
    const baseType = 'terms';
    const addPage = useHistory((state) => state.addPage);
    const qid = queryID(baseType, id);
    //const history = useContext(HistoryContext);
    const {
        isLoading: isKmapLoading,
        data: kmapData,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(qid, 'info');
    const {
        isLoading: isAssetLoading,
        data: assetData,
        isError: isAssetError,
        error: assetError,
    } = useKmap(qid, 'asset');
    const {
        isLoading: isRelatedLoading,
        data: relatedData,
        isError: isRelatedError,
        error: relatedError,
    } = useKmapRelated(qid, 'all', 0, 100);

    //Unpack related data using memoized function
    const kmapsRelated = useUnPackedMemoized(relatedData, qid, 'all', 0, 100);

    React.useEffect(() => {
        if (!isKmapLoading && !isKmapError) {
            //console.log("kmap (places)", kmapData);
            // history.addPage('terms', kmapData.header, window.location.pathname);
            addPage('terms', kmapData.header, window.location.pathname);
        }
    }, [addPage, isKmapError, isKmapLoading, kmapData]);

    // Function to loop through until leaf is loaded, then scroll into center of vertical view
    let tofunc = () => {
        if (document.getElementById('leaf-terms-' + id)) {
            setTimeout(function () {
                const el = document.getElementById('leaf-terms-' + id);
                if (el) {
                    const tree = el.closest('.c-kmaptree');
                    if (tree) {
                        const scrollval =
                            el.offsetTop -
                            Math.floor(tree.offsetHeight / 2) -
                            60;
                        tree.scrollTop = scrollval;
                        console.log('scrolling to: ', scrollval);
                    }
                }
            }, 100);
        } else {
            setTimeout(tofunc, 250);
        }
    };

    useEffect(() => {
        setOpenTab(2);
        setTimeout(tofunc, 10);
        // Cancel loop if element is not found in 10 secs.
        setTimeout(() => {
            tofunc = () => {};
        }, 10000);
    }, [path, id]);

    if (isKmapLoading || isAssetLoading || isRelatedLoading) {
        return <MandalaSkeleton />;
    }

    if (isKmapError || isAssetError || isRelatedError) {
        if (isKmapError) {
            return <span>Error: {kmapError.message}</span>;
        }
        if (isAssetError) {
            return <span>Error: {assetError.message}</span>;
        }
        if (isRelatedError) {
            return <span>Error: {relatedError.message}</span>;
        }
    }

    if (kmapData?.response?.numFound === 0) {
        return (
            <p>
                We’re sorry. We cannot find a term with the ID of “{qid}” in our
                index.
            </p>
        );
    }

    //Get all related Definitions
    // TODO: Need to check this after Andres' renaming of Solr fields  (1/2/23)
    const definitions = _(kmapData?._childDocuments_)
        .pickBy((val) => {
            return (
                val.block_child_type === 'related_definitions' &&
                val?.related_definitions_content_s?.length > 0
            );
        })
        .groupBy((val) => {
            let category = _.get(val, 'related_definitions_source_s');
            if (!category || category === '') {
                category = _.get(
                    val,
                    'related_definitions_in_house_source_s',
                    'main_defs'
                );
            }
            return category;
        })
        .value();
    // Other definitions do not work any longer  (1/2/23)
    const otherDefinitions = _.omit(definitions, ['main_defs']);

    const caption_eng =
        kmapData?.caption_eng?.length > 0 ? (
            <>
                <h4>Caption</h4>
                <HtmlCustom markup={kmapData.caption_eng[0]} />
            </>
        ) : null;

    const summary_eng =
        kmapData?.summary_eng?.length > 0 ? (
            <>
                <h4>Summary</h4>
                <HtmlCustom markup={kmapData.summary_eng[0]} />
            </>
        ) : null;

    return (
        <React.Suspense
            fallback={<div>Loading Suspense Terms Skeleton ...</div>}
        >
            <Switch>
                <Route exact path={path}>
                    <>
                        <TermNames kmap={kmapData} kmAsset={assetData} />
                        {(caption_eng || summary_eng) && (
                            <div>
                                {caption_eng}
                                {summary_eng}
                            </div>
                        )}
                        <TermsDetails
                            kmAsset={assetData}
                            kmapData={kmapData}
                            definitions={definitions}
                            otherDefinitions={otherDefinitions}
                            kmapsRelated={kmapsRelated}
                        />
                    </>
                </Route>
                <Route path={`${path}/related-:relatedType/view/:assetId`}>
                    <RelatedAssetViewer parentData={kmapData} />
                </Route>
                <Route
                    path={`${path}/related-:relatedType/:definitionID/view/:relID`}
                >
                    <TermsRelatedNodes />
                </Route>
                <Route
                    path={[
                        `${path}/related-:relatedType/:definitionID/:viewMode`,
                        `${path}/related-:relatedType/:viewMode`,
                        `${path}/related-:relatedType`,
                    ]}
                >
                    <TermsDefinitionsFilter
                        relateds={kmapsRelated}
                        kmap={kmapData}
                    />
                    <RelatedsGallery baseType="terms" />
                </Route>
            </Switch>
        </React.Suspense>
    );
};

export default TermsInfo;
