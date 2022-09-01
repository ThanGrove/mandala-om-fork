import React, { useState, lazy, Suspense, useContext } from 'react';
import { Route, Redirect, Switch, useSearchParams } from 'react-router-dom';
import {
    QueryParamProvider,
    transformSearchStringJsonSafe,
} from 'use-query-params';
import Router from './RouterSelect';
import { SiteHeader } from './SiteHeader/SiteHeader';
import { Hamburger } from './MainNavToggle/Hamburger';
import MandalaSkeleton from '../views/common/MandalaSkeleton';
import { MandalaSession } from './MandalaSession';
const Home = lazy(() => import('./HomePage/Home'));
const ContentMain = lazy(() => import('./ContentMain'));
const NotFoundPage = lazy(() => import('../views/common/NotFoundPage'));

const stringifyOptions = {
    transformSearchString: transformSearchStringJsonSafe,
};

export function Main(props) {
    MandalaSession();

    return (
        <Router
            {...(process.env.REACT_APP_STANDALONE !== 'standalone'
                ? { basename: '/' }
                : {})}
        >
            <QueryParamProvider
                ReactRouterRoute={Route}
                stringifyOptions={stringifyOptions}
            >
                <div id={'l-site__wrap'} className={`l-site__wrap`}>
                    {/* <HistoryListener /> */}
                    <SiteHeader />
                    <Hamburger hamburgerOpen={false} />
                    {/** TODO:gk3k -> Need to set a proper loading component with Skeletons */}
                    <Suspense fallback={<MandalaSkeleton overlay={true} />}>
                        <Switch>
                            {/*
                            <Route path={'/home'}>
                                <Home />
                            </Route>

                            {process.env.REACT_APP_STANDALONE !==
                                'standalone' && (
                                <Route exact path={'/'}>
                                    <Redirect to={'/home'} />
                                </Route>
                            )}
                            */}
                            <Route path={'*'}>
                                <ContentMain
                                    site={'mandala'}
                                    mode={'development'}
                                    title={'Mandala'}
                                    sui={props.sui}
                                />
                            </Route>
                            {/*
                            <Route path={'*'}>
                                <NotFoundPage />
                                <Home />
                            </Route>

                            */}
                        </Switch>
                    </Suspense>

                    <Hamburger hamburgerOpen={false} />
                </div>
            </QueryParamProvider>
        </Router>
    );
}
