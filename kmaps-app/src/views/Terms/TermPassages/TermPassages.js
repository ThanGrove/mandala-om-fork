import React, { useEffect, useState } from 'react';
import { getUniquePropIds } from '../../common/utils';
import { HtmlCustom } from '../../common/MandalaMarkup';

/**
 *
 * @param data
 * @returns {JSX.Element}
 * @constructor
 */
export function TermPassages({ kmapData }) {
    // Get all passage IDs from filtering data (solr doc) properties
    let passageIds = getUniquePropIds(kmapData, /passage_(\d+)_content_t/);

    return (
        <div className="main-passages">
            {passageIds.map((pid, pind) => {
                const passcont = kmapData[`passage_${pid}_content_t`][0];
                return (
                    <div>
                        <h3>Passage {pind + 1}</h3>
                        <HtmlCustom markup={passcont} />
                    </div>
                );
            })}
            {/*
                To expand what is shown here, see code in OtherPassages.js and adapt here.
                The difference is that these passages are actually part of the kmapsData Term record from
                kmterms, whereas the "other passages" are part of "other definitions" that are child documents.
                See https://uvaissues.atlassian.net/browse/MANU-7300
            */}
        </div>
    );
}
