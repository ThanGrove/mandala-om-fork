import { HtmlCustom } from '../../common/MandalaMarkup';
import { MandalaPopover } from '../../common/MandalaPopover';
import { MandalaSourceNote } from '../../common/utilcomponents';
import React from 'react';

/**
 * TermTermRelations is just that relationships between the main terms and other terms.
 * These are found in childDocuments of the SOLR terms record under the type "related_terms"
 * This component displays those in lists headed by the type of relationship
 *
 * @param kmapData
 * @returns {JSX.Element}
 * @constructor
 */
export function TermTermRelations({ kmapData }) {
    // Get This term's name
    const termName = kmapData?.header;

    // Get All related terms
    const relatedTermData = kmapData._childDocuments_.filter((cd, cdi) => {
        return cd?.block_child_type === 'related_terms';
    });

    // Get the categories to group by (use Set to retrieve unique labels)
    let categories = new Set(
        relatedTermData
            .filter((rt, rti) => {
                // filter out "heads" relationship because that is for the tree only
                return rt?.related_terms_relation_code_s !== 'heads';
            })
            .map((rt, rti) => {
                return rt?.related_terms_relation_code_s;
            })
    );
    categories = Array.from(categories);

    // Categorize relations
    let totalRelatedTerms = 0;
    const relatedTerms = categories.map((cat) => {
        let catterms = relatedTermData.filter((rt, rti) => {
            return rt?.related_terms_relation_code_s === cat;
        });
        if (catterms?.length === 0)
            return { code: false, label: false, terms: false };

        // Eliminate duplicates (some related terms are listed twice)
        const relids = [];
        catterms = catterms.filter((ct, cti) => {
            if (!relids.includes(ct?.related_uid_s)) {
                relids.push(ct?.related_uid_s);
                return true;
            }
            return false;
        });

        totalRelatedTerms += catterms.length;
        return {
            code: cat,
            label: catterms[0].related_terms_relation_label_s,
            terms: catterms,
        };
    });

    return (
        <>
            <p className="mt-3">
                {termName} has {totalRelatedTerms} terms directly related to it,
                which are presented here.
            </p>
            <div className="mt-3">
                {relatedTerms?.map((rt, rti) => {
                    if (!rt?.label) {
                        return null;
                    }
                    return (
                        <div key={`${kmapData.uid}-relterms-${rti}`}>
                            <p>
                                <strong>
                                    {termName} {rt?.label}
                                </strong>
                            </p>
                            <ul>
                                {rt?.terms.map((rt2, rt2i) => {
                                    let [rdomain, rid] =
                                        rt2?.related_uid_s?.split('-');
                                    const reltermsources =
                                        rt2?.related_terms_relation_citation_references_ss?.map(
                                            (rts, rtsi) => {
                                                return (
                                                    <div className="mt-3">
                                                        <HtmlCustom
                                                            markup={rts}
                                                        />
                                                    </div>
                                                );
                                            }
                                        );
                                    return (
                                        <li
                                            key={`${kmapData.uid}-rel-term-${rt2i}`}
                                        >
                                            {rt2?.related_terms_header_s}
                                            <MandalaPopover
                                                domain={rdomain}
                                                kid={rid}
                                            />
                                            {reltermsources?.length > 0 && (
                                                <MandalaSourceNote
                                                    markup=""
                                                    children={reltermsources}
                                                />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
