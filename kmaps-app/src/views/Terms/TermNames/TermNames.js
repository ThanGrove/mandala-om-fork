import { buildNestedDocs, getSolrCitation } from '../../common/utils';
import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import _ from 'lodash';
import './NameEntry.css';
import { TermSubjectFacets } from '../TermsSubjectFacets';

export default function TermNames(props) {
    // console.log("calling buildNestedDocs");

    // TODO: Refactor so that Redux delivers the rebuilt nested docs instead of leaving it up to the Components.
    const namesTree = buildNestedDocs(
        props.kmap?._childDocuments_,
        'related_names'
    );
    return (
        <div className="sui-nameEntry__wrapper">
            <span className="term_id float-right p-2">
                ID: T{props?.kmap?.id?.replace('terms-', '')}
            </span>
            <ul className="sui-nameEntry first-entry">
                <NameEntry names={namesTree} />
            </ul>

            <TermSubjectFacets kmAsset={props?.kmAsset} />
        </div>
    );
}

/* NameEntry recursively draws the Name Tree
 *   expects: props.names = tree built by buildNestedDocs()
 *
 * Perhaps this should parameterized...?
 *
 */
export function NameEntry(props) {
    let outlist = [];
    Object.entries(props.names).map(([id, entry]) => {
        const headerclass =
            entry.related_names_language_s === 'Tibetan' &&
            entry.related_names_relationship_s === 'Original'
                ? 'sui-nameEntry-header bo'
                : 'sui-nameEntry-header';
        const citation = getSolrCitation(
            entry,
            'Citation',
            'related_names_citation_references_ss'
        );
        outlist.push(
            <li id={id} key={id} className="sui-nameEntry">
                <span className={headerclass}>
                    {entry.related_names_header_s}
                </span>
                <span className="sui-nameEntry-meta">
                    <span className="sui-nameEntry-language">
                        {entry.related_names_language_s}
                    </span>
                    <span className="sui-nameEntry-relationship">
                        {entry.related_names_relationship_s}
                    </span>
                    <span className="sui-nameEntry-writing-system">
                        {entry.related_names_writing_system_s}
                    </span>
                    {citation}
                </span>
                <span className="sui-nameEntry-etymology">
                    {ReactHtmlParser(entry.related_names_etymology_s)}
                </span>
                {!_.isEmpty(entry._nested_) && (
                    <ul>
                        <NameEntry names={entry._nested_} />
                    </ul>
                )}
            </li>
        );
        return true;
    });
    const output = <React.Fragment>{outlist}</React.Fragment>;
    return output;
}
