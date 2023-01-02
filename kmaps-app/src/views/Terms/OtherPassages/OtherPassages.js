import React, { useEffect, useState } from 'react';
import { getUniquePropIds } from '../../common/utils';
import { TermPassage } from './TermPassage';
import { TermCitation } from './TermCitation';

/**
 * getOtherDefs : returns the child documents of the kmaps Term that have passage fields in them.
 * Each such child doc may have multiple passages within it, e.g. related_definitions_passage_1_content_t, etc.
 * So the array returned does not represent the number of passages.
 *
 * @param kmapData
 */
export function getOtherPassages(kmapData) {
    let passages = [];
    const reldefs = kmapData?._childDocuments_?.filter((cd) => {
        const reldeflangs = getUniquePropIds(
            cd,
            /related_definitions_content_(\w+)/
        );
        return (
            cd?.block_child_type === 'related_definitions' &&
            reldeflangs?.length > 0
        );
    });

    for (var n = 0; n < reldefs?.length; n++) {
        let rd = reldefs[n];
        let rdkeys = Object.keys(rd).join('|');
        if (
            rdkeys.includes('related_definitions_passage_') ||
            rdkeys.includes('related_definitions_citation_')
        ) {
            passages.push(rd);
        }
    }
    let np = reldefs.filter((rd, rdi) => {
        let rdkeys = Object.keys(rd).join('|');
        return (
            rdkeys.includes('related_definitions_passage_') ||
            rdkeys.includes('related_definitions_citation_')
        );
    });
    return passages;
}

/**
 * Other Defs are other imported definitions in Kmaps Terms. These definitions have details information
 * as opposed to other dictionaries which are just a dump of terms. These have structured data similar to the
 * main defintions, but they are definitions from other people, e.g. Higgins, Hopkins, and other people whose last
 * name does not begin with H.
 *
 * @param kmapData
 * @param passnum
 * @param setPassnum
 * @returns {JSX.Element}
 * @constructor
 */
export function OtherPassages({ kmapData }) {
    /* Find child documents for definitions with passages */
    let defs = getOtherPassages(kmapData);
    return (
        <>
            {defs.map((p, pi) => {
                return (
                    <OtherPassageGroup
                        key={`term-otherdef-group-${kmapData?.uid}`}
                        data={p}
                    />
                );
            })}
        </>
    );
}

/**
 * Other Passage Group: The div that groups aspects of a definition external to Mandala terms.
 * Other Defs can have a defintion, passages, and/or notes.
 * If multiple of these exist, use tabs.
 *
 * @param data
 * @param passnum
 * @param setPassnum
 * @returns {JSX.Element}
 * @constructor
 */
export function OtherPassageGroup({ data }) {
    const [activeTab, setActiveTab] = useState(''); // Active Tab in Other Def group
    // Get all passage IDs from filtering data (solr doc) properties
    const passageIds = getUniquePropIds(
        data,
        /related_definitions_passage_(\d+)_content_t/
    );
    const translationCitations = getUniquePropIds(
        data,
        /related_definitions_passage_translation_(\d+)_citation_references_ss/
    );
    const citationIds = getUniquePropIds(
        data,
        /related_definitions_citation_(\d+)_reference_s/
    );

    // Tablist determines number of tabs and top one is set to active in useEffect
    let tablist =
        passageIds?.length + citationIds?.length > 0
            ? ['otherdefpassages']
            : [];
    useEffect(() => {
        if (tablist && tablist?.length > 0) {
            setActiveTab(tablist[0]);
        }
    }, [data]);

    const relsource = data?.related_definitions_in_house_source_s ? (
        <div className="passage-src">
            {data?.related_definitions_in_house_source_s}
        </div>
    ) : null;

    return (
        <div className="otherdef-group">
            <div className="otherdef-passages">
                {passageIds.map((pid, pind) => {
                    return (
                        <TermPassage
                            data={data}
                            pid={pid}
                            source={relsource}
                            key={`term-otherdef-passage-${pid}-${pind}`}
                        />
                    );
                })}
                {citationIds.map((cid, cind) => {
                    return (
                        <TermCitation
                            data={data}
                            cid={cid}
                            source={relsource}
                            key={`term-otherdef-citation-${cid}-${cind}`}
                        />
                    );
                })}
                {translationCitations.map((cid, cind) => {
                    return (
                        <TermCitation
                            data={data}
                            cid={cid}
                            source={relsource}
                            trans={true}
                            key={`term-otherdef-citation-${cid}-${cind}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
