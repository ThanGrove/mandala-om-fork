import React, { useContext } from 'react';
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
    const baseType = 'terms';
    const addPage = useHistory((state) => state.addPage);
    //const history = useContext(HistoryContext);
    const {
        isLoading: isKmapLoading,
        data: kmapData,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(baseType, id), 'info');
    const {
        isLoading: isAssetLoading,
        data: assetData,
        isError: isAssetError,
        error: assetError,
    } = useKmap(queryID(baseType, id), 'asset');
    const {
        isLoading: isRelatedLoading,
        data: relatedData,
        isError: isRelatedError,
        error: relatedError,
    } = useKmapRelated(queryID(baseType, id), 'all', 0, 100);

    //Unpack related data using memoized function
    const kmapsRelated = useUnPackedMemoized(
        relatedData,
        queryID(baseType, id),
        'all',
        0,
        100
    );

    React.useEffect(() => {
        if (!isKmapLoading && !isKmapError) {
            //console.log("kmap (places)", kmapData);
            // history.addPage('terms', kmapData.header, window.location.pathname);
            addPage('terms', kmapData.header, window.location.pathname);
        }
    }, [addPage, isKmapError, isKmapLoading, kmapData]);

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

    //Get all related Definitions
    const definitions = _(kmapData?._childDocuments_)
        .pickBy((val) => {
            return val.block_child_type === 'related_definitions';
        })
        .groupBy((val) => {
            return _.get(val, 'related_definitions_source_s', 'main_defs');
        })
        .value();
    const otherDefinitions = _.omit(definitions, ['main_defs']);

    return (
        <React.Suspense
            fallback={<div>Loading Suspense Terms Skeleton ...</div>}
        >
            <Switch>
                <Route exact path={path}>
                    <>
                        <TermNames kmap={kmapData} />
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
