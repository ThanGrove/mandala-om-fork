import React from 'react';
import { OtherDefGroup } from './OtherDefGroup';

/**
 * getOtherDefs : returns the child documents of the kmaps Term that have passage fields in them.
 * Each such child doc may have multiple passages within it, e.g. related_definitions_passage_1_content_t, etc.
 * So the array returned does not represent the number of passages.
 *
 * @param kmapData
 */
export function getOtherDefs(kmapData) {
    let defs = [];
    const reldefs = kmapData?._childDocuments_?.filter((cd) => {
        return (
            cd?.block_child_type === 'related_definitions' &&
            cd?.related_definitions_content_s?.length > 0
        );
    });
    return defs;
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
export function OtherDefs({ kmapData }) {
    /* Find child documents for definitions with passages */
    let defs = getOtherDefs(kmapData);
    return (
        <div className="term-otherdefs">
            {defs.map((p, pi) => {
                return (
                    <OtherDefGroup
                        key={`term-otherdef-group-${kmapData?.uid}`}
                        data={p}
                    />
                );
            })}
        </div>
    );
}
