import React, { useEffect, useState } from 'react';
import { FeaturePager } from './FeaturePager/FeaturePager';
import { RelatedsIcons } from '../Kmaps/RelatedViewer/RelatedsIcons';
import _ from 'lodash';
import { HtmlCustom } from './MandalaMarkup';
import { Link, useLocation } from 'react-router-dom';
import { Container, Col, Row, Card, Accordion, Button } from 'react-bootstrap';
import $ from 'jquery';
import { createAssetViewURL } from './FeatureCard/FeatureCard';
import { NoResults } from './FeatureDeck';
import { useSolr } from '../../hooks/useSolr';
import Collapse from 'react-bootstrap/Collapse';
import { FeatureKmapListItem } from './FeatureKmapListItem';
import { FeatureAssetListItem } from './FeatureAssetListItem';

export function FeatureList(props) {
    const myloc = useLocation();
    let searchParam = myloc.search;

    // For subsites in WordPress, there will be a hash. We need to parse the hash and
    // put a parent search param in the urls.
    if (myloc.pathname.includes('collection')) {
        const hashmap = myloc.pathname.split('/').slice(-2);

        // Add parent param which contains the hashmap to the search params
        if (searchParam) {
            searchParam = `?${searchParam}&parent=${hashmap.join('/')}`;
        } else {
            searchParam = `?parent=${hashmap.join('/')}`;
        }
    }

    const inline = props?.inline ? props.inline : false;
    const path = myloc.pathname
        .replace(/\/?any\/?.*/, '')
        .replace(/\/?(deck|gallery|list)\/?.*/, ''); // remove the /any from terms
    let LIST = _.map(props.docs, (doc) => {
        const asset_type = doc?.tree ? doc.tree : doc?.asset_type;
        const mid = doc.id;
        const mykey = `${asset_type}-${mid}}`;
        // FeatureKmapCard for kmaps
        if (['places', 'subjects', 'terms', 'kmaps'].indexOf(asset_type) > -1) {
            return (
                <FeatureKmapListItem
                    asset_type={asset_type}
                    doc={doc}
                    key={mykey}
                    inline={inline}
                    path={path}
                    searchParam={searchParam}
                />
            );
        } else {
            // FeatureAssetCard for assets
            return (
                <FeatureAssetListItem
                    asset_type={asset_type}
                    doc={doc}
                    key={mykey}
                    inline={inline}
                    path={path}
                    searchParam={searchParam}
                />
            );
        }
    });

    if (props?.docs?.length === 0) {
        return (
            <div className={'c-view'}>
                <NoResults />
            </div>
        );
    }

    const output = (
        <div className={'c-view'}>
            <FeaturePager position={'top'} {...props} />
            {LIST}
            <FeaturePager position={'bottom'} {...props} />
        </div>
    );

    return <div className={'c-view__wrapper list'}>{output}</div>;
}
