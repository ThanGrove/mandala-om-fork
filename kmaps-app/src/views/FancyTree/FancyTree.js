import React, { useEffect, useRef, useState } from 'react';
import fancytree from 'jquery.fancytree';
import { withRouter } from 'react-router';
import { useHistory, useParams } from 'react-router-dom';
import 'jquery.fancytree/dist/modules/jquery.fancytree.filter';
import 'jquery.fancytree/dist/modules/jquery.fancytree.glyph';
import $ from 'jquery';
import kmapsSolrUtils from './solr-utils';
import './kmaps_relations_tree';
import 'jquery.fancytree/dist/skin-awesome/ui.fancytree.css';
import './FancyTree.css';

function FancyTree({
    domain,
    tree,
    descendants = true,
    directAncestors = false,
    displayPopup = false,
    perspective = 'tib.alpha',
    view = 'roman.scholar',
    sortBy = 'position_i+ASC',
    currentFeatureId: newFeatureId = '',
}) {
    const el = useRef(null);
    let history = useHistory();
    let params = useParams();
    var featureId = '';
    if (newFeatureId && newFeatureId.startsWith(domain)) {
        featureId = newFeatureId;
    }
    useEffect(() => {
        //Setup solr utils
        const ks_opts = {
            termIndex: process.env.REACT_APP_SOLR_KMTERMS,
            assetIndex: process.env.REACT_APP_SOLR_KMASSETS,
            featureId: featureId,
            domain: domain,
            perspective: perspective,
            view: view,
            tree: tree,
            featuresPath:
                process.env.REACT_APP_PUBLIC_URL + `/${domain}/%%ID%%`,
        };

        //console.log('FancyTree: tree=', tree, ' kmapSolrUtil opts = ', ks_opts);

        const solrUtils = kmapsSolrUtils.init(ks_opts);
        // To be replaceable on page change, Fancy Tree must be declared on a div that is added to the ref
        const elCopy = $('<div></div>'); // Create the div to use for Fancy Tree
        $(el.current).html(elCopy);
        const tree_opts = {
            domain: domain,
            featureId: featureId,
            featuresPath:
                process.env.REACT_APP_PUBLIC_URL + `/${domain}/%%ID%%`,
            perspective: perspective,
            tree: tree,
            termIndex: process.env.REACT_APP_SOLR_KMTERMS,
            assetIndex: process.env.REACT_APP_SOLR_KMASSETS,
            descendants: descendants,
            descendantsFullDetail: false,
            directAncestors: directAncestors,
            displayPopup: displayPopup,
            mandalaURL: process.env.REACT_APP_PUBLIC_URL + `/${domain}/%%ID%%`,
            solrUtils: solrUtils,
            view: view,
            sortBy: sortBy,
            initialScrollToActive: true,
            // extraFields: ['associated_subject_ids'],
            // nodeMarkerPredicates: [
            //     {
            //         field: 'associated_subject_ids',
            //         value: 9315,
            //         operation: '!includes',
            //         mark: 'nonInteractiveNode',
            //     },
            // ],
            history,
            params,
        };
        elCopy.kmapsRelationsTree(tree_opts);
        return () => {
            elCopy.fancytree('destroy');
        };
    }, [featureId]); //useEffect depending on feature ID so that tree changes
    return <div className="suiFancyTree view-wrap" ref={el}></div>;
}

export default FancyTree;
