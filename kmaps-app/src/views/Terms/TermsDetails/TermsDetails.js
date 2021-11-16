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
import { getOtherDefs, OtherDefs } from '../OtherDefs/OtherDefs';
import { convertLangCode, getPropsContaining } from '../../common/utils';
import GenericPopover from '../../common/GenericPopover';
import { OtherDefNotes } from '../OtherDefs/OtherDefNotes';
import { MandalaSourceNote } from '../../common/utilcomponents';
import {
    getOtherPassages,
    OtherPassages,
} from '../OtherPassages/OtherPassages';

function getTranslationEquivalents(kmapData) {
    const transprops = getPropsContaining(kmapData, 'translation_equivalent');
    let transkeys = [];
    for (let tpk in transprops) {
        let tp = transprops[tpk];
        let mtch = tp.match(/translation_equivalent_(\d+)_/);
        if (mtch && !transkeys.includes(mtch[1])) {
            transkeys.push(mtch[1]);
        }
    }
    transkeys.sort();
    return transkeys.map((tk) => {
        const cntkey = `translation_equivalent_${tk}_content_s`;
        const langkey = `translation_equivalent_${tk}_language_s`;
        const langcodekey = `translation_equivalent_${tk}_language_code_s`;
        const citekey = `translation_equivalent_${tk}_citation_references_ss`;
        return {
            content: cntkey in kmapData ? kmapData[cntkey] : false,
            lang: langkey in kmapData ? kmapData[langkey] : false,
            langcode: langcodekey in kmapData ? kmapData[langcodekey] : false,
            citations:
                citekey in kmapData
                    ? kmapData[citekey]
                          ?.map((cite) => {
                              return `<p class="bibref">${cite}</p>`;
                          })
                          .join(' ')
                    : false,
        };
    });
}

const TermsDetails = ({
    kmAsset,
    kmapData,
    definitions,
    otherDefinitions,
    kmapsRelated,
}) => {
    const [passnum, setPassnum] = useState(0);
    const [activeTab, setActiveTab] = useState('details');

    /** Passages **/
    /* Find child documents for definitions with passages */
    const defnum = Object.keys(definitions['main_defs']).length;
    const showdefs = defnum > 0;
    const otherDefs = getOtherDefs(kmapData);
    const otherDefNum =
        otherDefs?.length + Object.keys(otherDefinitions)?.length; // Custom dictionaries not Passages
    const showother = otherDefNum > 0;
    const showpass = getOtherPassages(kmapData)?.length > 0;
    const showetym = kmapData?.etymologies_ss;
    const transequivs = getTranslationEquivalents(kmapData);
    const showtrans = transequivs?.length > 0;

    useEffect(() => {
        let atval = 'details';
        if (showetym) {
            atval = 'etymology';
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
                id="term-info-tabs"
                className="mb-3"
            >
                {showdefs && (
                    <Tab eventKey="defs" title={`Definitions (${defnum})`}>
                        <TermDefinitions
                            mainDefs={definitions['main_defs']}
                            kmRelated={kmapsRelated}
                        />
                    </Tab>
                )}
                {showother && (
                    <Tab eventKey="other" title={`Other (${otherDefNum})`}>
                        <div className="sui-termDicts__wrapper">
                            <OtherDefs
                                kmapData={kmapData}
                                passnum={passnum}
                                setPassnum={setPassnum}
                            />
                            {!_.isEmpty(otherDefinitions) && (
                                <TermDictionaries
                                    definitions={otherDefinitions}
                                />
                            )}
                        </div>
                    </Tab>
                )}

                {showpass && (
                    <Tab eventKey="passages" title="Passages">
                        <OtherPassages kmapData={kmapData} />
                    </Tab>
                )}

                {showetym && (
                    <Tab eventKey="etymology" title="Etymology">
                        <TermEtymology kmap={kmapData} />
                    </Tab>
                )}

                {showtrans && (
                    <Tab
                        eventKey="translations"
                        title={`Translations (${transequivs?.length})`}
                    >
                        <div className="sui-termsDetails__wrapper">
                            <TermTranslations translations={transequivs} />
                        </div>
                    </Tab>
                )}

                <Tab eventKey="details" title="Classification">
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

function TermTranslations({ translations }) {
    return (
        <div className="translations">
            <p>There are {translations?.length} translation equivalents: </p>
            <ul>
                {translations.map((tr, tri) => {
                    return (
                        <li key={`transequiv-${tri}`}>
                            <TermTranslation data={tr} />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function TermTranslation({ data }) {
    const lngcode = data?.langcode; // convertLangCode(data.langcode);
    const srcicon = <span className="u-icon__sources"> </span>; //u-icon__file-text-o
    return (
        <>
            <span className="langname text-uppercase">{data?.lang}</span>:{' '}
            <span className={lngcode}>{data?.content}</span>{' '}
            {data?.citations?.length > 0 && (
                <GenericPopover
                    title="Citations"
                    content={data?.citations}
                    icon={srcicon}
                />
            )}
        </>
    );
}
