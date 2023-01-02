import React, { useEffect, useState } from 'react';
import { TermPassage } from '../OtherPassages/TermPassage';
import { getUniquePropIds } from '../../common/utils';
import { TermCitation } from './TermCitation';

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
        /related_definitions_passage_(\d+)_content_s/
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
