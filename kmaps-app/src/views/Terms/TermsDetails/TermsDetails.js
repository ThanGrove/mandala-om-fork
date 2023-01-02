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
import {
    getOtherDefs,
    OtherDefs,
    getOtherDefNotes,
    OtherDefNotes,
} from '../OtherDefs/OtherDefs';
import {
    convertLangCode,
    getPropsContaining,
    getUniquePropIds,
} from '../../common/utils';
import GenericPopover from '../../common/GenericPopover';
// import { getOtherDefNotes, OtherDefNotes } from '../OtherDefs/OtherDefNotes';
import { MandalaSourceNote } from '../../common/utilcomponents';
import {
    getOtherPassages,
    OtherPassages,
} from '../OtherPassages/OtherPassages';
import { TermTermRelations } from './TermTermRelations';
import { TermTranslations } from './TermTranslations';

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

    // console.log(kmapData);

    /** Passages **/
    /* Find child documents for definitions with passages */
    const defnum = definitions['main_defs']
        ? Object.keys(definitions['main_defs'])?.length
        : 0;
    const showdefs = defnum > 0;
    const otherDefs = getOtherDefs(kmapData);

    const otherDefNum =
        otherDefs?.length + Object.keys(otherDefinitions)?.length; // Custom dictionaries not Passages
    const showother = otherDefNum > 0;
    let otherpassnum = 0;
    let othercitenum = 0;

    getOtherPassages(kmapData).forEach((op, opi) => {
        let uids = getUniquePropIds(op, /related_definitions_passage_(\d+)_/);
        if (uids?.length > 0) {
            otherpassnum += uids?.length;
        }
        uids = getUniquePropIds(
            op,
            /related_definitions_passage_translation_(\d+)_citation_references_ss/
        );
        if (uids?.length > 0) {
            othercitenum += uids?.length;
        }
        uids = getUniquePropIds(op, /related_definitions_citation_(\d+)_/);
        if (uids?.length > 0) {
            othercitenum += uids?.length;
        }
    });
    const showpass = otherpassnum + othercitenum > 0;
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
                    <Tab
                        eventKey="passages"
                        title={`Passages (${otherpassnum + othercitenum})`}
                    >
                        <OtherPassages kmapData={kmapData} />
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
