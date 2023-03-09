import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { Row } from 'react-bootstrap';
import { RelatedPlacesFeature } from '../Kmaps/PlacesRelPlacesViewer';
import React from 'react';

export function RelatedChildren({ settings, domain, kid }) {
    const rows = 0;
    const quid = `related-children-${domain}-${kid}`;
    const query = {
        index: 'terms',
        params: {
            q: `block_type:child AND block_child_type:related_${domain} AND related_${domain}_path_s:*/${kid}/*`,
            fq: `origin_uid_s:${domain}-${kid}`,
            'json.facet': `{"feature_type": {"type":"terms", "field":"related_${domain}_feature_type_s"}}`,
            rows: rows,
            fl: '*',
        },
    };
    const {
        isLoading: isChildrenLoading,
        data: childrenData,
        isError: isChildrenError,
        error: childrenError,
    } = useSolr(quid, query);

    if (isChildrenLoading) {
        return <MandalaSkeleton />;
    }
    const children =
        !isChildrenLoading && childrenData?.numFound > 0
            ? childrenData.docs
            : [];

    /*
    if (childrenData?.numFound > 0) {
        console.log('query', query);
        console.log('related children query results', childrenData);
    }

    const headernm = `related_places_header_s`;
    children.sort((a, b) => {
        if (a[headernm] > b[headernm]) {
            return 1;
        }
        if (a[headernm] < b[headernm]) {
            return -1;
        }
        return 0;
    });
*/
    const facets = childrenData?.facets;
    // if (!facets || facets === undefined) { return null; }
    return (
        <div className={settings?.childrenClass}>
            {Object.keys(facets).map((facet_name, i) => {
                if (facets[facet_name]?.buckets.length == 1) {
                    return (
                        <Row>
                            {facets[facet_name]?.buckets.map((b, bi) => {
                                return (
                                    <RelatedBucket
                                        domain={domain}
                                        kid={kid}
                                        facet={facet_name}
                                        val={b?.val}
                                        isSolo={true}
                                    />
                                );
                            })}
                        </Row>
                    );
                }
                return (
                    <fieldset className="related-features facet-group">
                        <legend>Feature Types</legend>
                        <Row>
                            {facets[facet_name]?.buckets.map((b, bi) => {
                                return (
                                    <RelatedBucket
                                        domain={domain}
                                        kid={kid}
                                        facet={facet_name}
                                        val={b?.val}
                                    />
                                );
                            })}
                        </Row>
                    </fieldset>
                );
            })}
        </div>
    );
}

function RelatedBucket({ domain, kid, facet, val, isSolo = false }) {
    const quid = ['related-buckets', domain, kid, facet, val];
    facet = `related_${domain}_${facet}_s`;
    //console.log('facet is', facet);
    const query = {
        index: 'terms',
        params: {
            q: `related_${domain}_path_s:*/${kid}/*`,
            fq: [
                `origin_uid_s:${domain}-${kid}`,
                `block_type:child`,
                `block_child_type:related_${domain}`,
                `${facet}:"${val}"`,
            ],
            rows: 5000,
            fl: '*',
        },
    };
    // console.log('bucket query', query);

    const {
        isLoading: isBucketLoading,
        data: bucketItems,
        isError: isBucketError,
        error: bucketError,
    } = useSolr(quid, query);

    if (isBucketLoading) {
        return <MandalaSkeleton />;
    }
    const cols = isSolo ? 12 : 4;
    // return <div>There are {bucketItems?.numFound} items here. {facet} : {val}</div>;
    return (
        <RelatedPlacesFeature
            label={val}
            features={bucketItems?.docs}
            colsize={cols}
            isSolo={isSolo}
        />
    );
    /*

                const lckey = `treeleaf-${child['id'].replace(
                    '-',
                    '.'
                )}-children-related-places-${i}`;
                const [domain, kid] = child['related_places_id_s'].split('-');
                const leafhead = child[headernm];
                let divclass = 'c-kmapleaf leafend';
                if (level) { divclass += ` lvl-${level}`; }

                return (
                    <div className={divclass} key={lckey}>
                        <span
                            className={settings.spanClass}
                            data-domain={domain}
                            data-id={kid}
                        >
                            <span className={settings.iconClass}>-</span>
                            <span className={settings.headerClass}>
                                <Link to={`/${domain}/${kid}`}>{leafhead}</Link>
                                &nbsp;
                                <span className="addinfo text-capitalize">
                                    ({child['related_places_feature_type_s']})
                                </span>
                            </span>
                            <MandalaPopover
                                key={lckey + 'pop'}
                                domain={domain}
                                kid={kid}
                            />
                        </span>
                    </div>
                );
     */
}
