import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import _ from 'lodash';
import 'rc-input-number/assets/index.css';
import NodeHeader from '../common/NodeHeader';
import '../Terms/TermsViewer.css';
import { TermsInfo } from '../Terms/TermsInfo';
import { PlacesInfo } from './PlacesInfo';
import { SubjectsInfo } from './SubjectsInfo';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
// import useStatus from '../../hooks/useStatus';
import MdlAssetContext from '../../context/MdlAssetContext';
import GenAssetContext from '../../context/GenAssetContext';
import { useLocation } from 'react-router';
import {
    KmapsRelatedsViewer,
    SubjectsRelPlacesViewer,
    PlacesRelPlacesViewer,
    PlacesRelSubjectsViewer,
} from './KmapsRelatedsViewer';
import TermsDefinitionsFilter from '../Terms/TermsDefinitionsFilter';
import MandalaSkeleton from '../common/MandalaSkeleton';
const AudioVideoViewer = React.lazy(() =>
    import('../AudioVideo/AudioVideoViewer')
);
const TextsViewer = React.lazy(() => import('../Texts/TextsViewer'));
const RelatedsGallery = React.lazy(() => import('../common/RelatedsGallery'));
const ImagesViewer = React.lazy(() => import('../Images/ImagesViewer'));
const SourcesViewer = React.lazy(() => import('../Sources/SourcesViewer'));
const VisualsViewer = React.lazy(() => import('../Visuals/VisualsViewer'));

/**
 * DEPRECATED: Old Kmaps Viewer. No longer used.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function KmapsViewer(props) {
    const route = useRouteMatch();
    const [modalShow, setModalShow] = useState();
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Loading ...');
    }, [status]);

    const queryParams = new URLSearchParams(useLocation().search);

    function grokAssetType(route, queryParams) {
        // console.log("grokAssetType props = ", props);
        // console.log("grokAssetType route = ", route  );
        // console.log("grokAssetType queryParams = ", queryParams.get("asset_type")  );

        const asset_type = queryParams.get('asset_type');
        let viewer = null;
        switch (asset_type) {
            case 'images':
                viewer = (
                    <ImagesViewer kmasset={props.kmasset} kmap={props.kmap} />
                );
                break;
            case 'audio-video':
                viewer = <AudioVideoViewer sui={window.sui} />;
                break;
            case 'sources':
                viewer = <SourcesViewer />;
                break;
            case 'texts':
                viewer = <TextsViewer />;
                break;
            case 'visuals':
                viewer = <VisualsViewer />;
                break;
            case 'subjects':
            case 'terms':
            case 'places':
                viewer = <KmapsViewer />;
                break;
            default:
                viewer = <span>No defined viewer</span>;
                break;
        }

        return {
            declaredType: asset_type,
            declaredViewer: viewer,
        };
    }

    const { declaredType, declaredViewer } = grokAssetType(route, queryParams);

    useEffect(() => {
        if (props.kmasset) {
            status.clear();
            status.setHeaderTitle(props.kmasset.title);
            status.setType(props.kmasset.asset_type);
            const superPath = assemblePath(props.kmap, props.kmasset);
            status.setPath(superPath);
            status.setId(props.kmasset?.uid);
        }
    }, [route, props.kmap, props.kmasset, status]);

    let output = <div className="l-content__main__wrap">Loading...</div>;
    if (props.kmasset && props.kmasset.asset_type) {
        output = (
            <section className="l-content__main__wrap">
                <div className="c-content__main__kmaps">
                    {/*<NodeHeader kmasset={props.kmasset} />*/}
                    {/** TODO:gk3k -> Change loading to skeletons. See if we can remove this file entirely. */}
                    <React.Suspense fallback={<MandalaSkeleton />}>
                        <Switch>
                            {/* Related AV */}
                            <Route
                                path={
                                    '/:viewerType/:nid/related-audio-video/view/:relId'
                                }
                            >
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                    relatedType={'audio-video'}
                                    back={'true'}
                                />
                                <GenAssetContext assetType={'audio-video'}>
                                    <AudioVideoViewer sui={window.sui} />
                                </GenAssetContext>
                            </Route>

                            {/* Related Texts */}
                            <Route
                                path={
                                    '/:viewerType/:nid/related-texts/view/:relId'
                                }
                            >
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                    relatedType={'texts'}
                                    back={'true'}
                                />
                                <GenAssetContext assetType={'texts'}>
                                    <TextsViewer inline={true} />
                                </GenAssetContext>
                            </Route>

                            {/* Related Images */}
                            <Route
                                path={
                                    '/:viewerType/:nid/related-images/view/:relId'
                                }
                            >
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                    relatedType={'images'}
                                    back={'true'}
                                />
                                <GenAssetContext assetType={'images'}>
                                    <ImagesViewer inline={true} />
                                </GenAssetContext>
                            </Route>

                            {/* Related Sources */}
                            <Route
                                path={
                                    '/:viewerType/:nid/related-sources/view/:relId'
                                }
                            >
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                    relatedType={'sources'}
                                    back={'true'}
                                />
                                <GenAssetContext assetType={'sources'}>
                                    <SourcesViewer inline={true} />
                                </GenAssetContext>
                            </Route>

                            {/* Related Visuals */}
                            <Route
                                path={
                                    '/:viewerType/:nid/related-visuals/view/:relId'
                                }
                            >
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                    relatedType={'visuals'}
                                    back={'true'}
                                />
                                <GenAssetContext assetType={'visuals'}>
                                    <VisualsViewer inline={true} />
                                </GenAssetContext>
                            </Route>

                            <Route
                                path={
                                    '/:viewerType/:nid/related-all/view/:relId'
                                }
                            >
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                    relatedType={'all'}
                                    back={'true'}
                                />
                                <GenAssetContext
                                    assetType={declaredType}
                                    inline={true}
                                >
                                    {declaredViewer}
                                </GenAssetContext>
                            </Route>

                            {/* Catch relatedType routes that are not specified above */}
                            <Route path={'/subjects/:id/related-subjects'}>
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                />
                                <KmapsRelatedsViewer {...props} />
                            </Route>

                            <Route path={'/subjects/:id/related-places'}>
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                />
                                <SubjectsRelPlacesViewer {...props} />
                            </Route>

                            <Redirect
                                from={'/places/:id/related-places/:view'}
                                to={'/places/:id/related-places'}
                            />
                            <Route path={'/places/:id/related-places'}>
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                />
                                <PlacesRelPlacesViewer {...props} />
                            </Route>

                            <Redirect
                                from={'/places/:id/related-subjects/:view'}
                                to={'/places/:id/related-subjects'}
                            />
                            <Route path={'/places/:id/related-subjects'}>
                                <NodeHeader
                                    {...props}
                                    kmasset={props.kmasset}
                                />
                                <PlacesRelSubjectsViewer {...props} />
                            </Route>

                            <Route
                                path={[
                                    `/:viewerType/:id/related-:relatedType/:definitionID/:viewMode`,
                                    `/:viewerType/:id/related-:relatedType/:viewMode`,
                                ]}
                            >
                                <NodeHeader {...props} />
                                <TermsDefinitionsFilter {...props} />
                                <RelatedsGallery {...props} />
                            </Route>

                            <Route
                                path={'/:viewerType/:id/related-:relatedType'}
                            >
                                <Redirect to={'./all'} />
                            </Route>

                            {/* Default or "Home" path */}
                            {/*<Route>
                                <NodeHeader
                                    kmasset={props.kmasset}
                                    kmap={props.kmap}
                                />
                                <Switch>
                                    <Route path={'/subjects'}>
                                        <SubjectsInfo {...props} />
                                    </Route>
                                    <Route path={'/places'}>
                                        <PlacesInfo {...props} />
                                    </Route>
                                    <Route path={'/terms'}>
                                        <TermsInfo
                                            kmasset={props.kmasset}
                                            kmap={props.kmap}
                                            kmRelated={props.relateds}
                                            defnum={queryParams.get('def')}
                                        />
                                    </Route>
                                </Switch>
                            </Route> */}
                        </Switch>
                    </React.Suspense>
                </div>

                <span
                    className={'sui-showinfo u-icon__info float-right'}
                    onClick={() => setModalShow(true)}
                ></span>

                <DetailModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    data={props.kmasset}
                    scrollable={true}
                />
            </section>
        );
    }

    return output;
}

function DetailModal(props) {
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    JSON DATA
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <pre>{JSON.stringify(props.data, undefined, 3)}</pre>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

//  assembles a path from the data is has...
function assemblePath(kmap, kmasset) {
    // console.log("assemble kmap = ", kmap);
    // console.log("assemble kmasset = ", kmasset);
    //
    let path = [];

    if (kmasset?.ancestor_ids_is && kmasset?.ancestors_txt) {
        const t = kmasset.asset_type;
        const ids = kmasset.ancestor_ids_is;
        const names = kmasset.ancestors_txt;

        path.push({
            uid: '/' + t,
            name: t[0].toUpperCase() + t.substr(1),
        });

        for (let i = 0; i < ids.length; i++) {
            const uid = t + '-' + ids[i];
            const name = names[i];
            path.push({
                uid: uid,
                name: name,
            });
        }
    } else {
        console.log(
            'KmapContext.assembledPath: kmasset does not have ancestor_ids_is or ancestors_txt.'
        );
    }
    return path;
}
