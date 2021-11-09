import React, { useEffect, useState } from 'react';
import { MandalaPopover } from '../../common/MandalaPopover';
import './TermsDetails.css';
import TermAudioPlayer from '../TermAudioPlayer';
import TermEtymology from '../TermEtymology';
import TermDefinitions from '../TermDefinitions';
import _ from 'lodash';
import TermDictionaries from '../TermDictionaries';
import { Tab, Tabs } from 'react-bootstrap';
import { HtmlCustom } from '../../common/MandalaMarkup';
import { TermPassages } from '../TermsPassages/TermsPassages';

const TermsDetails = ({
    kmAsset,
    kmapData,
    definitions,
    otherDefinitions,
    kmapsRelated,
}) => {
    const [passnum, setPassnum] = useState(0);
    const [defnum, setDefnum] = useState(0);
    const [activeTab, setActiveTab] = useState('details');

    /* Find child documents for definitions with passages */
    let passages = [];
    const showpass = true; // passages.length > 0;
    const showetym = kmapData?.etymologies_ss;
    const showdefs =
        !_.isEmpty(definitions['main_defs']) || !_.isEmpty(otherDefinitions);

    useEffect(() => {
        let atval = 'details';
        if (showetym) {
            atval = 'etymology';
        }
        if (showpass) {
            atval = 'passages';
        }
        if (showdefs) {
            atval = 'defs';
        }
        setActiveTab(atval);
    }, []);
    return (
        <>
            <TermAudioPlayer kmap={kmapData} />
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                id="uncontrolled-tab-example"
                className="mb-3"
            >
                {showdefs && (
                    <Tab eventKey="defs" title={`Definitions (${defnum})`}>
                        <TermDefinitions
                            mainDefs={definitions['main_defs']}
                            kmRelated={kmapsRelated}
                            defnum={defnum}
                            setDefnum={setDefnum}
                        />
                        {!_.isEmpty(otherDefinitions) && (
                            <TermDictionaries
                                definitions={otherDefinitions}
                                defnum={defnum}
                                setDefnum={setDefnum}
                            />
                        )}
                    </Tab>
                )}

                {showetym && (
                    <Tab eventKey="etymology" title="Etymology">
                        <TermEtymology kmap={kmapData} />
                    </Tab>
                )}

                {showpass && (
                    <Tab eventKey="passages" title={`Passages (${passnum})`}>
                        <div className="sui-termDicts__wrapper">
                            <TermPassages
                                uid={kmapData?.uid}
                                passages={passages}
                                passnum={passnum}
                                setPassnum={setPassnum}
                            />
                        </div>
                    </Tab>
                )}

                <Tab eventKey="details" title="Details">
                    <div className="sui-termsDetails__wrapper">
                        <TermSubjectFacets kmAsset={kmAsset} />
                        <TermTermRelations kmapData={kmapData} />
                    </div>
                </Tab>
            </Tabs>
        </>
    );
};

export default TermsDetails;

function TermSubjectFacets({ kmAsset }) {
    return (
        <ul className="sui-termsDetails__list">
            {kmAsset?.associated_subject_map_idfacet?.map((asset) => {
                const assetSplit = asset.split('|');
                const assocSubject = assetSplit[1].split('=');
                const subID = assocSubject[1].split('-');
                return (
                    <li className="sui-termsDetails__list-item" key={asset}>
                        {assetSplit[0].split('=')[0].toUpperCase()}
                        :&nbsp; {` `}
                        <MandalaPopover domain={subID[0]} kid={subID[1]}>
                            <span className="sui-termsDetails__li-subjects">
                                {assocSubject[0]}
                            </span>
                        </MandalaPopover>
                    </li>
                );
            })}
        </ul>
    );
}

function TermTermRelations({ kmapData }) {
    // Get This term's name
    const termName = kmapData?.header;

    // Get All related terms
    const relatedTermData = kmapData._childDocuments_.filter((cd, cdi) => {
        return cd?.block_child_type === 'related_terms';
    });

    // Get the categories to group by (use Set to retrieve unique labels)
    let categories = new Set(
        relatedTermData.map((rt, rti) => {
            return rt?.related_terms_relation_code_s;
        })
    );
    categories = Array.from(categories);

    // Categorize relations
    let totalRelatedTerms = 0;
    const relatedTerms = categories.map((cat) => {
        const catterms = relatedTermData.filter((rt, rti) => {
            return (
                rt?.related_terms_relation_code_s === cat &&
                !rt?.id.includes('__')
            );
        });
        if (catterms?.length === 0) return;
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
                                    return (
                                        <li
                                            key={`${kmapData.uid}-rel-term-${rt2i}`}
                                        >
                                            {rt2?.related_terms_header_s}
                                            <MandalaPopover
                                                domain={rdomain}
                                                kid={rid}
                                            />
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
