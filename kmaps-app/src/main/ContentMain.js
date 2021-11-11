import React, { useEffect } from 'react';
import { Container, Section, Bar } from 'react-simple-resizer';
import { ContentHeader } from './ContentHeader/ContentHeader';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { AudioVideoHome } from '../views/AudioVideo/AudioVideoHome';
import { ImagesHome } from '../views/Images/ImagesHome';
import { TextsHome } from '../views/Texts/TextsHome';
import { SourcesHome } from '../views/Sources/SourcesHome';
import { VisualsHome } from '../views/Visuals/VisualsHome';
import { RelatedsViewer } from '../views/Kmaps/RelatedViewer/RelatedsViewer';
import LegacyViewer from '../views/LegacyViewer';
import { SearchViewer } from '../views/SearchViewer';
import { CollectionsViewer } from '../views/Collections/CollectionsViewer';
import { CollectionsHome } from '../views/Collections/CollectionsHome';
import PlacesHome from '../views/PlacesHome';
import SubjectsHome from '../views/SubjectsHome';
import TermsHome from '../views/Terms/TermsHome';
import { CollectionsRedirect } from '../views/Collections/CollectionsRedirect';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import MandalaSkeleton from '../views/common/MandalaSkeleton';
import { TreeTest } from '../views/KmapTree/TreeTest';
import { AssetCollectionLocator } from './AssetCollectionLocator';
import $ from 'jquery';
import Home from './HomePage/Home';
import { SEARCH_COOKIE_NAME } from '../search/SearchAdvanced';
import { TextViewerRedirect } from '../views/Texts/TextsViewer';
import ResourcesHome from '../views/ResourcesHome';
import { IsoLookupMandala } from '../views/common/Iso639M/IsoLookupMandala';
import { Iso639DataFactory } from '../views/common/Iso639M/iso639DataFactory';

const PlacesInfo = React.lazy(() => import('../views/Kmaps/PlacesInfo'));
const SubjectsInfo = React.lazy(() => import('../views/Kmaps/SubjectsInfo'));
const TermsInfo = React.lazy(() => import('../views/Terms/TermsInfo'));
const RightSideBar = React.lazy(() => import('./RightSideBar'));
const NotFoundPage = React.lazy(() => import('../views/common/NotFoundPage'));
const NodeHeader = React.lazy(() => import('../views/common/NodeHeader'));
const AudioVideoViewer = React.lazy(() =>
    import('../views/AudioVideo/AudioVideoViewer')
);
const TextsViewer = React.lazy(() => import('../views/Texts/TextsViewer'));
const SourcesViewer = React.lazy(() =>
    import('../views/Sources/SourcesViewer')
);
const VisualsViewer = React.lazy(() =>
    import('../views/Visuals/VisualsViewer')
);
const ImagesViewer = React.lazy(() => import('../views/Images/ImagesViewer'));

export default function ContentMain(props) {
    const title = props.title || 'Untitled';
    const siteClass = props.site || 'default';
    const myLocation = useLocation();
    const advsrch_target = document.getElementById('advancedSearchPortal');
    const column_class = advsrch_target ? 'one-column' : 'two-columns';
    useEffect(() => {
        if (myLocation.pathname === '/') {
            $('body').removeClass('mandala');
            //console.log('removing class', myLocation);
        } else {
            $('body').addClass('mandala');
            //console.log('adding class', myLocation);
        }
        // Save Search String in a cookie to retrieve for returning to results
        if (myLocation?.search) {
            localStorage.setItem(SEARCH_COOKIE_NAME, myLocation.search);
        }
    }, [myLocation]);
    const left = (
        <main className="l-column__main">
            <article id="l-column__main__wrap" className="l-column__main__wrap">
                <ContentHeader
                    siteClass={siteClass}
                    title={title}
                    location={myLocation}
                />
                <Container className={column_class}>
                    <Section id="l-content__main" className="l-content__main">
                        {/** TODO:gk3k -> Create loading component with skeletons. */}
                        <React.Suspense fallback={<MandalaSkeleton />}>
                            <Switch>
                                <Redirect from="/mandala-om/*" to="/*" />

                                {/* All RESOURCES */}
                                <Route path={`/resources`}>
                                    <ResourcesHome />
                                </Route>

                                {/* COLLECTIONS */}
                                <Route
                                    path={`/:asset_type/collections/all/:view_mode`}
                                >
                                    <CollectionsHome />
                                </Route>

                                <Redirect
                                    from={`/:asset_type/collections/all`}
                                    to={`/:asset_type/collections/all/deck`}
                                />

                                <Route path={`/collections/all/:view_mode`}>
                                    <CollectionsHome />
                                </Route>

                                <Redirect
                                    from="/collections"
                                    to="/collections/all/deck"
                                />
                                <Route
                                    path={`/:asset_type/collection/:cid/view/:nid`}
                                >
                                    <CollectionsRedirect />
                                </Route>
                                <Route
                                    path={`/:asset_type/collection/:id/:view_mode`}
                                >
                                    <CollectionsViewer ismain={true} />
                                </Route>

                                <Route path={`/:asset_type/collection/:id`}>
                                    <CollectionsRedirect />
                                </Route>

                                {/* AUDIO-VIDEO */}
                                <Route path={`/audio-video/all/:view_mode`}>
                                    <AudioVideoHome />
                                </Route>
                                <Route path={`/audio-video/all`}>
                                    <Redirect to={`/audio-video/all/deck`} />
                                </Route>
                                <Route path={`/audio-video/:id`}>
                                    <AudioVideoViewer
                                        sui={props.sui}
                                        ismain={true}
                                    />
                                </Route>
                                <Route path={`/audio-video`}>
                                    <Redirect to={`/audio-video/all/deck`} />
                                </Route>

                                {/* IMAGES */}
                                <Route path={`/images/all/:view_mode`}>
                                    <ImagesHome />
                                </Route>
                                <Route path={`/images/all`}>
                                    <Redirect to={`/images/all/gallery`} />
                                </Route>
                                <Route path={`/images/:id`}>
                                    <ImagesViewer
                                        ismain={true}
                                        sui={props.sui}
                                    />
                                </Route>
                                <Route path={`/images`}>
                                    <Redirect to={`/images/all/gallery`} />
                                </Route>

                                {/* PLACES */}
                                <Route path={`/places/all/:view_mode`}>
                                    <PlacesHome />
                                </Route>
                                <Route path={`/places/all`}>
                                    <Redirect to={`/places/all/list`} />
                                </Route>
                                <Route path={`/places/:id`}>
                                    <RelatedsViewer />
                                    <section className="l-content__main__wrap">
                                        <div className="c-content__main__kmaps">
                                            <NodeHeader />
                                            <PlacesInfo />
                                        </div>
                                    </section>
                                </Route>
                                <Route path={`/places`}>
                                    <Redirect to={`/places/all/list`} />
                                </Route>

                                {/* SUBJECTS */}
                                <Route path={`/subjects/all/:view_mode`}>
                                    <SubjectsHome />
                                </Route>
                                <Route path={`/subjects/all`}>
                                    <Redirect to={`/subjects/all/list`} />
                                </Route>
                                <Route path={`/subjects/:id`}>
                                    <RelatedsViewer />
                                    <section className="l-content__main__wrap">
                                        <div className="c-content__main__kmaps">
                                            <NodeHeader />
                                            <SubjectsInfo />
                                        </div>
                                    </section>
                                </Route>
                                <Route path={`/subjects`}>
                                    <Redirect to={`/subjects/all/list`} />
                                </Route>

                                {/* TERMS */}
                                <Route path={`/terms/all/:view_mode`}>
                                    <TermsHome />
                                </Route>
                                <Route path={`/terms/all`}>
                                    <Redirect to={`/terms/all/list`} />
                                </Route>
                                <Route path={`/terms/:id`}>
                                    <RelatedsViewer />
                                    <section className="l-content__main__wrap">
                                        <div className="c-content__main__kmaps">
                                            <NodeHeader />
                                            <TermsInfo />
                                        </div>
                                    </section>
                                </Route>
                                <Route path={`/terms`}>
                                    <Redirect to={`/terms/all/list`} />
                                </Route>

                                {/* SOURCES */}
                                <Route path={`/sources/all/:view_mode`}>
                                    <SourcesHome />
                                </Route>
                                <Route path={`/sources/all`}>
                                    <Redirect to="/sources/all/list" />
                                </Route>
                                <Route path={`/sources/:id`}>
                                    <SourcesViewer />
                                </Route>
                                <Route path={`/sources`}>
                                    <Redirect to="/sources/all/list" />
                                </Route>

                                {/* TEXTS */}

                                <Route path={`/texts/all/view/:id`}>
                                    <TextViewerRedirect />
                                </Route>
                                <Route path={`/texts/all/:view_mode`}>
                                    <TextsHome />
                                </Route>
                                <Route path={`/texts/all`}>
                                    <Redirect to="/texts/all/list" />
                                </Route>
                                <Route
                                    path={[`/texts/:id/:pageid`, `/texts/:id`]}
                                >
                                    <TextsViewer ismain={true} />
                                </Route>
                                <Route path={`/texts`}>
                                    <Redirect to="/texts/all/list" />
                                </Route>

                                {/* VISUALS */}
                                <Route path={`/visuals/all/:view_mode`}>
                                    <VisualsHome />
                                </Route>
                                <Route path={`/visuals/all`}>
                                    <Redirect to="/visuals/all/deck" />
                                </Route>
                                <Route path={`/visuals/:id`}>
                                    <VisualsViewer />
                                </Route>
                                <Route path={`/visuals`}>
                                    <Redirect to="/visuals/all/deck" />
                                </Route>

                                {/* SEARCH */}
                                <Route path={`/search/:viewMode`}>
                                    <SearchViewer />
                                </Route>
                                <Route exact path={`/search`}>
                                    <Redirect to={`/search/deck`} />
                                </Route>

                                {/* LEGACY VIEWER */}
                                <Route path={`/assets/:id`}>
                                    <RelatedsViewer />
                                    <LegacyViewer
                                        id={props.id}
                                        sui={props.sui}
                                    />
                                </Route>

                                <Route path={`/find/:assetType/:id/collection`}>
                                    <AssetCollectionLocator />
                                </Route>

                                {/* Admin Paths */}
                                <Route path={`/admin/isodata`}>
                                    <Iso639DataFactory />
                                </Route>
                                <Route path={`/admin/isolookup`}>
                                    <IsoLookupMandala />
                                </Route>

                                <Route path={['/', '/home']}>
                                    <Home />
                                </Route>

                                {/* CATCHALL => 404 */}
                                <Route path="*">
                                    <NotFoundPage />
                                </Route>
                            </Switch>
                        </React.Suspense>
                    </Section>
                    {!advsrch_target && <Bar className="resize-right-column" />}
                    <React.Suspense fallback={<MandalaSkeleton count={10} />}>
                        <RightSideBar />
                    </React.Suspense>
                </Container>
            </article>
        </main>
    );
    return left;
}
