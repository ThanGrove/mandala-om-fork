import React from 'react';
import { FeatureCard } from './FeatureCard/FeatureCard';
import CardDeck from 'react-bootstrap/CardDeck';
import { FeaturePager } from './FeaturePager/FeaturePager';
import Spinner from 'react-bootstrap/Spinner';
import { Button } from 'react-bootstrap';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';
import { ArrayOfObjectsParam } from '../../hooks/utils';
import { useLocation } from 'react-router-dom';

// The length of the Rows at each Break Point
// const BP_SIZES = {
//    sm: 2,
//    md: 3,
//    lg: 4,
//    xl: 6,
// };

// utility function to insert breakpoints
/*
function insertBreakPoints(i, BP_SIZES, ret) {
    if (i !== 0) {
        if (i % BP_SIZES.sm === 0) {
            ret.push(
                <div
                    className="w-100 d-none d-sm-block d-md-none"
                    key={'sm' + i}
                ></div>
            );
        }
        if (i % BP_SIZES.md === 0) {
            ret.push(
                <div
                    className="w-100 d-none d-md-block d-lg-none"
                    key={'md' + i}
                ></div>
            );
        }
        if (i % BP_SIZES.lg === 0) {
            ret.push(
                <div
                    className="w-100 d-none d-lg-block d-xl-none"
                    key={'lq' + i}
                ></div>
            );
        }
        if (i % BP_SIZES.xl === 0) {
            ret.push(
                <div className="w-100 d-none d-xl-block" key={'xl' + i}></div>
            );
        }
    }
}
*/
/**
 * Feature Deck : Returns a list of Feature Cards for creating galleries etc. Takes the following properties:
 *      docs : a list of solr asset records
 *      inline : boolean (meaning? render inline?)
 *      pager : a FeaturePager component or false for no pager
 *      loadingState : boolean (are we loading?)
 *      title : the title for the deck/gallery
 *
 * @param props : {object}
 * @returns {JSX.Element}
 * @constructor
 *
 * @author ys2n
 */
export function FeatureDeck(props) {
    const shouldInline = (doc) => {
        let inline = true;

        if (props.inline === false) {
            return false;
        }
        switch (doc.asset_type) {
            case 'subjects':
            case 'terms':
            case 'places':
                break;
            default:
                inline = true;
        }
        return inline;
    };

    const docs = props.docs;
    const isResults = docs?.length > 0;
    let deckcontent = null;
    if (props?.isLoading) {
        deckcontent = (
            <div className="text-center">
                <span className="font-weight-bold fs-2">Loading...</span>
            </div>
        );
    } else if (isResults) {
        // console.log("FeatureDeck: looking at ", docs);
        const cards = docs?.map((doc, i) => {
            let ret = [];
            const featureCard = (
                <FeatureCard doc={doc} key={i} inline={shouldInline(doc)} />
            );

            // Insert breakpoints for various window sizes
            //        insertBreakPoints(i, BP_SIZES, ret);
            ret.push(featureCard);
            return ret;
        });
        deckcontent = <CardDeck className={'c-card__grid'}>{cards}</CardDeck>;
    } else {
        deckcontent = <NoResults />;
    }

    const output = (
        <div className={'c-view'}>
            {isResults && <FeaturePager {...props} />}
            {deckcontent}
            {isResults && <FeaturePager {...props} />}
        </div>
    );
    return <div className={'c-view__wrapper deck'}>{output}</div>;
}

/* utility function to fill the remaining spaces in the last row
function rowFiller(length, bp_sizes) {
    let remainderCards = [];
    const maxLength = bp_sizes.xl;
    const remainVisible = 'invisible';
    for (let i = 0; i < maxLength; i++) {
        let remClasses = ['m-1', 'p-2', 'd-none'];
        for (let [type, size] of Object.entries(bp_sizes)) {
            // console.log(`${type}: ${size}`);
            if (length % size !== 0 && i < size - (length % size)) {
                remClasses.push(`d-${type}-block ${remainVisible}`);
            } else {
                remClasses.push(`d-${type}-none`);
            }
        }
        const remainderCard = (
            <Card className={remClasses.join(' ')} key={'fill' + i}>
            //    { for debugging}
                <Card.Body>
                    <pre>{remClasses.join('\n')}</pre>
                </Card.Body>
            </Card>
        );
        remainderCards.push(remainderCard);
    }
    return remainderCards;
}
*/

export function NoResults(props) {
    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    const loc = useLocation();
    let pgtype = loc?.pathname?.includes('search') ? 'search' : 'general';
    if (loc?.pathname?.includes('collection')) {
        pgtype = 'collection';
    }
    const goback = () => {
        window.history.back();
    };
    const ss = window.location.search;
    const qrysum =
        query.searchText?.length > 0 ? ` — “${query.searchText}” — ` : '';
    return (
        <div className={'u-search__noresults__wrap'}>
            <div className={'u-search__noresults'}>
                {pgtype === 'search' && (
                    <>
                        <h2 className={'u-search__noresults__header'}>
                            No Results
                        </h2>
                        <p>
                            Your query {qrysum}
                            yielded no results.
                        </p>
                    </>
                )}
                {pgtype === 'collection' && (
                    <>
                        <h2 className={'u-search__noresults__header'}>
                            Under Construction
                        </h2>
                        <p>
                            We're currently building this collection. Watch this
                            space!
                        </p>
                    </>
                )}
                {pgtype === 'general' && (
                    <>
                        <h2 className={'u-search__noresults__header'}>
                            Nothing to Show!
                        </h2>
                        <p>
                            There is nothing here at the moment. Please check
                            back soon!
                        </p>
                    </>
                )}

                <p>
                    <button onClick={goback}>Go back</button>
                </p>
            </div>
        </div>
    );
}
