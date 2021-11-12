import { HtmlCustom } from '../../common/MandalaMarkup';
import React, { useEffect, useState } from 'react';
import { TermPassage } from './TermPassage';
import { Tab, Tabs } from 'react-bootstrap';
import { OtherDefNotes } from './OtherDefNotes';
import { getUniquePropIds } from '../../common/utils';

/**
 * OtherDefGroup: The div that groups aspects of a definition external to Mandala terms.
 * Other Defs can have a defintion, passages, and/or notes.
 * If multiple of these exist, use tabs.
 *
 * @param data
 * @param passnum
 * @param setPassnum
 * @returns {JSX.Element}
 * @constructor
 */
export function OtherDefGroup({ data }) {
    const [activeTab, setActiveTab] = useState(''); // Active Tab in Other Def group

    // Get all passage IDs from filtering data (solr doc) properties
    const passageIds = getUniquePropIds(
        data,
        /related_definitions_passage_(\d+)_content_s/
    );
    // Tablist determines number of tabs and top one is set to active in useEffect
    let tablist = passageIds?.length > 0 ? ['otherdefpassages'] : [];
    useEffect(() => {
        if (tablist && tablist?.length > 0) {
            setActiveTab(tablist[0]);
        }
    }, [data]);

    // Header for other dictionary source
    const header = data?.related_definitions_in_house_source_s ? (
        <div className="sui-termDicts__title">
            {data?.related_definitions_in_house_source_s}
        </div>
    ) : null;

    // Definition from Other Source if it exists
    const def =
        data?.related_definitions_content_s?.length > 0 ? (
            <div className="otherdef-cnt">
                <HtmlCustom markup={data?.related_definitions_content_s} />
            </div>
        ) : null;
    if (def) {
        tablist.shift('otherdef');
    }

    // Notes from Other Def
    const defnoteids = getUniquePropIds(
        data,
        /related_definitions_note_(\d+)_/
    );
    if (defnoteids?.length > 0) {
        tablist.push('otherdefnotes');
    }

    // Two different returns based on whether to use tabs (i.e. if there is more than one section)
    if (tablist?.length > 1) {
        return (
            <div className="otherdef-group">
                {header}
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    id="other-def-sections"
                    className="mb-3"
                >
                    {def && (
                        <Tab eventKey="otherdef" title="Definition">
                            {def}
                        </Tab>
                    )}
                    {passageIds?.length > 0 && (
                        <Tab
                            eventKey="otherdefpassages"
                            title={`Passages (${passageIds?.length})`}
                        >
                            <div className="otherdef-passages">
                                {passageIds.map((pid, pind) => {
                                    return (
                                        <TermPassage
                                            data={data}
                                            pid={pid}
                                            key={`term-otherdef-passage-${pid}-${pind}`}
                                        />
                                    );
                                })}
                            </div>
                        </Tab>
                    )}
                    {defnoteids?.length > 0 && (
                        <Tab
                            eventKey="otherdefnotes"
                            title={`Notes (${defnoteids?.length})`}
                        >
                            <div className="otherdef-notes">
                                <OtherDefNotes
                                    data={data}
                                    noteids={defnoteids}
                                />
                            </div>
                        </Tab>
                    )}
                </Tabs>
            </div>
        );
    } else {
        return (
            <div className="otherdef-group">
                {header}
                {def}
                {passageIds?.length > 0 && (
                    <div className="otherdef-passages">
                        {passageIds.map((pid, pind) => {
                            return (
                                <TermPassage
                                    data={data}
                                    pid={pid}
                                    key={`term-otherdef-passage-${pid}-${pind}`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
}
