import React, { useEffect, useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import ReactHtmlParser from 'react-html-parser';
import _ from 'lodash';
import { IconContext } from 'react-icons';
import { TiArrowUnsorted } from 'react-icons/ti';
import TermDefinitionsDetails from './TermDefinitionsDetails';
import TermDefinitionsPassages from './TermDefinitionsPassages';
import TermDefinitionsResources from './TermDefinitionsResources';
import './TermDefinitions.css';
import { Button } from 'react-bootstrap';
import Collapse from 'react-bootstrap/Collapse';
import { getUniquePropIds } from '../../common/utils';

//Function to aggregate TermDetails data
const aggregateDetails = _.memoize((def) => {
    let details = _.reduce(
        def,
        (accum, value, key) => {
            const matches = key.match(
                /^related_definitions_branch_subjects-(\d+)_(\w+)/
            );
            if (matches?.length > 0) {
                accum[matches[1]] = accum[matches[1]] || {};
                switch (matches[2]) {
                    case 'header_s':
                        accum[matches[1]]['header_title'] = value;
                        break;
                    case 'subjects_headers_t':
                        accum[matches[1]]['header_text'] = value;
                        break;
                    case 'subjects_uids_t':
                        accum[matches[1]]['header_uids'] = value;
                        break;
                    default:
                        break;
                }
            }
            return accum;
        },
        {}
    );
    // Remove Language detail because it is displayed through SOLR field: def.related_definitions_language_s
    // Could be used in future to link to Kmap subject for that language
    Object.keys(details).forEach((ky, kyi) => {
        if (details[ky]['header_title'] === 'Language') {
            delete details[ky];
        }
    });
    return details;
});

const TermDefinitions = (props) => {
    //Get Resources keyed by definition-id
    let mainDefs = props.mainDefs;
    const relatedDocs = props.kmRelated.assets?.all?.docs || [];
    const uid = props.kmRelated.uid;
    const re = new RegExp(`${uid}_definitions-\\d+`);
    const resourceCounts = {};
    for (const doc of relatedDocs) {
        for (const kmapid of doc.kmapid) {
            if (re.test(kmapid)) {
                resourceCounts[kmapid] = resourceCounts[kmapid] ?? {};
                resourceCounts[kmapid][doc.asset_type] =
                    resourceCounts[kmapid][doc.asset_type] + 1 || 1;
                resourceCounts[kmapid]['all'] =
                    resourceCounts[kmapid]['all'] + 1 || 1;
            }
        }
    }
    // Get MainDefs and reorganize into Ordered Defs with subdefs as children of their parent def
    mainDefs = _.orderBy(mainDefs, (val) => val.order, 'asc').filter(
        // filter out empty definitions (higgins for now)
        (def) => {
            const fnms = getUniquePropIds(
                def,
                /related_definitions_content_(\w+)/
            );
            if (fnms.length === 0) {
                return false;
            }
            return def['related_definitions_content_' + fnms[0]]?.length > 0;
        }
    );
    let orderedDefs = {};
    // Go through each main def and check the level
    mainDefs.forEach((def, di) => {
        // First level defs go in orderedDefs with key of its ID
        if (def?.related_definitions_level_i === 1) {
            def.children = []; // Add an empty children array to each main def
            orderedDefs[def.related_definitions_path_s] = def;
        } else if (def?.related_definitions_level_i === 2) {
            // Second level defs go in their parent's child array
            const defpath = def?.related_definitions_path_s.split('/');
            if (defpath.length > 1) {
                const parent = defpath[0];
                if (Object.keys(orderedDefs).includes(parent)) {
                    orderedDefs[parent].children.push(def);
                }
            } else {
                // If path of level 2 has less than 2 ids, something is wrong
                console.warn('Definition path for level 2 contains only 1 id');
            }
        } else {
            // This code only accounts for 2 levels, if there is a third or more, display warning
            console.warn(
                'Definition level unaccounted for: ',
                def?.related_definitions_level_i
            );
        }
    });
    const odkeys = Object.keys(orderedDefs);
    return (
        <div className="sui-termDefinitions_wrapper">
            <div className="sui-termDefinitions__content">
                {odkeys.map((odkey, order) => {
                    let def = orderedDefs[odkey];
                    return (
                        <TermDefinition
                            key={`term-def-${odkey}-${order}`}
                            def={def}
                            defnumber={order + 1}
                            deflevel={1}
                            resourceCounts={resourceCounts}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TermDefinitions;

function TermDefinition({ def, defnumber, deflevel, resourceCounts }) {
    const defid = 'def-' + def.id.split('-').pop(); // simplified def.id
    const defclass =
        defid == window.location.hash.substring(1)
            ? `selected deflvl${deflevel}`
            : `deflvl${deflevel}`;

    const [open, setOpen] = useState(false);
    const toggle_id = `${defid}-details`;
    const toggle_icon = open ? (
        <span className="u-icon__minus"> </span>
    ) : (
        <span className="u-icon__plus"> </span>
    );

    const subdefs = def?.children?.map((child, ci) => {
        const subdefnum = ci + 1;
        const defnum = `${defnumber}.${subdefnum}`;

        return (
            <>
                <TermDefinition
                    def={child}
                    defnumber={defnum}
                    deflevel={2}
                    resourceCounts={resourceCounts}
                />
            </>
        );
    });
    //console.log('Aggregate Details', aggregateDetails(def));
    let deflang = getUniquePropIds(def, /related_definitions_content_(\w+)/);
    deflang = deflang?.length > 0 ? deflang[0] : 't';
    const fnm = 'related_definitions_content_' + deflang;
    return (
        <>
            <div key={defid} id={defid} className={`definition ${defclass}`}>
                <div className="term-defcnt">
                    <div>
                        <span className="l-defnum">{defnumber}.</span>
                        {ReactHtmlParser(def[fnm])}
                    </div>
                    {!_.isEmpty(aggregateDetails(def)) && (
                        <div className="details-ref">
                            <Button
                                onClick={() => setOpen(!open)}
                                aria-controls={toggle_id}
                                aria-expanded={open}
                                variant={'link'}
                                title="More details"
                            >
                                {toggle_icon}
                            </Button>
                        </div>
                    )}
                </div>
                <div className="term-def-info">
                    <div className="sui-termDefResource__wrapper">
                        {parseInt(resourceCounts[def.id]?.all || 0) > 0 && (
                            <TermDefinitionsResources
                                defID={def.id}
                                resCounts={resourceCounts}
                            />
                        )}
                    </div>
                    {/* Both author and language */}
                    {def.related_definitions_author_s &&
                        def.related_definitions_language_s && (
                            <div className="sui-termDefinitions__extra">
                                <span className="sui-termDefinitions__extra-author">
                                    Author:
                                </span>{' '}
                                <span className="sui-termDefinitions__extra-author-text">
                                    {def.related_definitions_author_s}
                                </span>{' '}
                                |{' '}
                                <span className="sui-termDefinitions__extra-lang">
                                    Language:
                                </span>{' '}
                                <span className="sui-termDefinitions__extra-lang-text">
                                    {def.related_definitions_language_s}
                                </span>
                            </div>
                        )}
                    {/* Just author  */}
                    {def.related_definitions_author_s &&
                        !def.related_definitions_language_s && (
                            <div className="sui-termDefinitions__extra">
                                <span className="sui-termDefinitions__extra-author">
                                    Author:
                                </span>{' '}
                                <span className="sui-termDefinitions__extra-author-text">
                                    {def.related_definitions_author_s}
                                </span>{' '}
                            </div>
                        )}
                    {/* Just language */}
                    {!def.related_definitions_author_s &&
                        def.related_definitions_language_s && (
                            <div className="sui-termDefinitions__extra">
                                <span className="sui-termDefinitions__extra-lang">
                                    Language:
                                </span>{' '}
                                <span className="sui-termDefinitions__extra-lang-text">
                                    {def.related_definitions_language_s}
                                </span>
                            </div>
                        )}
                </div>
                {!_.isEmpty(aggregateDetails(def)) && (
                    <Collapse in={open}>
                        <div id={toggle_id} className="term-def-details">
                            <TermDefinitionsDetails
                                details={aggregateDetails(def)}
                                defid={defid}
                            />
                        </div>
                    </Collapse>
                )}
            </div>
            {subdefs}
        </>
    );
}
