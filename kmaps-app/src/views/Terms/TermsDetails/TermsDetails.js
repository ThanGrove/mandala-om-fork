import React, { useEffect, useState } from 'react';
import './TermsDetails.css';
import TermAudioPlayer from '../TermAudioPlayer';
import TermEtymology from '../TermEtymology';
import TermDefinitions from '../TermDefinitions';
import _ from 'lodash';
import TermDictionaries from '../TermDictionaries';
import { Tab, Tabs } from 'react-bootstrap';
import { getOtherDefNotes, OtherDefNotes } from '../OtherDefs/OtherDefs';
import { getPropsContaining, getUniquePropIds } from '../../common/utils';
import { getOtherPassages, OtherPassages } from '../TermPassages/OtherPassages';
import { TermTermRelations } from './TermTermRelations';
import { TermTranslations } from './TermTranslations';
import { TermPassages } from '../TermPassages/TermPassages';

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

    //console.log("term details", kmapData);

    /** Passages **/
    /* Find passages associated with the main definitions of a term */
    let passageIds = getUniquePropIds(kmapData, /passage_(\d+)_content_t/);
    let totalpassnum = passageIds?.length || 0;
    /* Find child documents for related definitions with passages */
    const defnum = definitions['main_defs']
        ? Object.keys(definitions['main_defs'])?.length
        : 0;
    const showdefs = defnum > 0;

    const otherDefNum = Object.keys(otherDefinitions)?.length; // Custom dictionaries not Passages // did have otherDefs?.length +
    const showother = otherDefNum > 0;

    let otherpass = getOtherPassages(kmapData);
    otherpass.forEach((op, opi) => {
        let uids = getUniquePropIds(op, /related_definitions_passage_(\d+)_/);
        if (uids?.length > 0) {
            totalpassnum += uids?.length;
        }
        uids = getUniquePropIds(
            op,
            /related_definitions_passage_translation_(\d+)_citation_references_ss/
        );
        if (uids?.length > 0) {
            totalpassnum += uids?.length;
        }
        uids = getUniquePropIds(op, /related_definitions_citation_(\d+)_/);
        if (uids?.length > 0) {
            totalpassnum += uids?.length;
        }
    });

    let showpass = totalpassnum > 0;
    const showetym = kmapData?.etymologies_ss;
    const transequivs = getTranslationEquivalents(kmapData);
    const showtrans = transequivs?.length > 0;
    const otherNotes = getOtherDefNotes(kmapData);
    const showOtherNotes = Object.keys(otherNotes)?.length > 0;
    // To count related terms must remove duplicates. See terms-2626 for an example
    const reltermlist = [];
    const relatedTerms = kmapData._childDocuments_.filter((cd, cdi) => {
        const rtkey =
            cd?.related_terms_relation_code_s + '|' + cd?.related_uid_s;
        if (
            cd?.block_child_type === 'related_terms' &&
            cd?.related_terms_relation_code_s !== 'heads' &&
            !reltermlist.includes(rtkey)
        ) {
            reltermlist.push(rtkey);
            return true;
        }
        return false;
    });
    const relatedTermCount = relatedTerms?.length;

    useEffect(() => {
        let atval = 'details';
        if (showpass) {
            atval = 'passages';
        }
        if (showetym) {
            atval = 'etymology';
        }
        if (showother) {
            atval = 'other';
        }
        if (showdefs) {
            atval = 'defs';
        }
        setActiveTab(atval);
    }, []);

    return (
        <div className="term-details">
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
                    <Tab
                        eventKey="other"
                        title={`Dictionaries (${otherDefNum})`}
                    >
                        <div className="sui-termDicts__wrapper">
                            {!_.isEmpty(otherDefinitions) && (
                                <TermDictionaries
                                    definitions={otherDefinitions}
                                    kmapData={kmapData}
                                />
                            )}
                        </div>
                    </Tab>
                )}

                {showpass && (
                    <Tab
                        eventKey="passages"
                        title={`Passages (${totalpassnum})`}
                    >
                        <div className="passage-group">
                            <TermPassages kmapData={kmapData} />
                            <OtherPassages kmapData={kmapData} />
                        </div>
                    </Tab>
                )}

                {showOtherNotes && (
                    <Tab
                        eventKey="notes"
                        title={`Notes (${Object.keys(otherNotes)?.length})`}
                    >
                        <OtherDefNotes data={otherNotes} />
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

                {relatedTermCount > 0 && (
                    <Tab
                        eventKey="details"
                        title={`Relationships (${relatedTermCount})`}
                    >
                        <div className="sui-termsDetails__wrapper">
                            <TermTermRelations kmapData={kmapData} />
                        </div>
                    </Tab>
                )}
            </Tabs>
        </div>
    );
};

export default TermsDetails;
