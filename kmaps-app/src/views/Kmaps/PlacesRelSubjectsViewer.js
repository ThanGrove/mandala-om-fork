import React, { useEffect } from 'react';
import $ from 'jquery';
import { MandalaPopover } from '../common/MandalaPopover';
import { useParams } from 'react-router-dom';
import { useKmap } from '../../hooks/useKmap';
import { getSolrCitation, queryID } from '../common/utils';
import GenericPopover from '../common/GenericPopover';
import MandalaSkeleton from '../common/MandalaSkeleton';

export default function PlacesRelSubjectsViewer() {
    let { id } = useParams();
    const baseType = 'places';

    const {
        isLoading: isKmapLoading,
        data: kmap,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(baseType, id), 'info');

    useEffect(() => {
        $('main.l-column__main').addClass('places');
    }, [kmap]);
    if (isKmapLoading) {
        return <MandalaSkeleton />;
    }
    return (
        <div>
            <PlacesFeatureTypes parent={kmap} />
            <PlacesRelSubjects children={kmap?._childDocuments_} />
        </div>
    );
}

export function PlacesFeatureTypes({ parent }) {
    if (!parent?.feature_type_ids?.length > 0) {
        return null;
    }
    let ftcites = {};
    let ftdates = {};
    parent._childDocuments_
        .filter((cld) => {
            return cld.block_child_type === 'feature_types';
        })
        .forEach((cld, n) => {
            ftcites[cld.feature_type_id_i] =
                cld?.feature_type_citation_references_ss &&
                cld?.feature_type_citation_references_ss.length > 0
                    ? cld
                    : false;
            ftdates[cld.feature_type_id_i] =
                cld?.feature_type_time_units_ss &&
                cld?.feature_type_time_units_ss.length > 0
                    ? `(${cld?.feature_type_time_units_ss[0]})`
                    : null;
        });
    const ftnote = getFeatureTypeNotes(parent);
    return (
        <>
            <h3 className={'head-related'}>Feature Types</h3>
            <ul>
                {parent.feature_type_ids.map((kid, cind) => {
                    const citation = getSolrCitation(
                        ftcites[kid],
                        'Citation',
                        'feature_type_citation_references_ss'
                    );
                    return (
                        <li key={kid + Math.random()}>
                            <MandalaPopover
                                domain={'subjects'}
                                kid={kid}
                                children={[parent.feature_types[cind]]}
                            />
                            {citation}
                            {ftnote && (
                                <GenericPopover
                                    title="Note on Feature Types"
                                    content={ftnote['content']}
                                />
                            )}
                            {ftdates[kid]}
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

export function PlacesRelSubjects({ children }) {
    if (!children || !children?.length || children.length === 0) {
        return null;
    }

    const relsubjs = children.filter((child, n) => {
        return child.id.includes('_relatedSubject_');
    });

    if (relsubjs.length === 0) {
        return null;
    }

    return (
        <>
            <h3 className={'head-related'}>Related Subjects</h3>
            <ul>
                {relsubjs.map((relsb, cind) => {
                    const source = getSolrCitation(
                        relsb,
                        'Citation',
                        'related_subjects_citation_references_ss'
                    );
                    let notes = getRelatedSubjNotes(relsb);
                    if (notes) {
                        notes = (
                            <GenericPopover
                                title={notes['title']}
                                content={notes['content']}
                            />
                        );
                    }
                    return (
                        <li
                            key={
                                relsb?.related_subjects_display_string_s +
                                '-' +
                                cind
                            }
                        >
                            {
                                <MandalaPopover
                                    domain={'subjects'}
                                    kid={relsb?.related_subjects_id_i}
                                    children={[
                                        relsb?.related_subjects_display_string_s,
                                    ]}
                                />
                            }
                            {relsb?.related_subjects_time_units_t && (
                                <>
                                    {' '}
                                    <span>
                                        (
                                        {relsb?.related_subjects_time_units_t.join(
                                            ', '
                                        )}
                                        {' CE)'}
                                    </span>{' '}
                                </>
                            )}
                            {source}
                            {notes}
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

function getFeatureTypeNotes(kmap) {
    let note = false;
    kmap.feature_type_ids.forEach((ftid) => {
        const ftypes = kmap?._childDocuments_?.filter((cld) => {
            return cld['feature_type_id_i'] === ftid;
        });
        for (let fti = 0; fti < ftypes.length; fti++) {
            let ftdoc = ftypes[fti];
            note = getRelatedSubjNotes(ftdoc);
            if (note) {
                break;
            }
        }
    });
    return note;
}

function getRelatedSubjNotes(rsb) {
    let notes = [];
    let authors = false;
    let title = false;

    const notekeys = Object.keys(rsb).filter((rsbk) => {
        return rsbk.includes('_note_');
    });
    notekeys.forEach((nk) => {
        if (nk.includes('_title_s')) {
            title = rsb[nk];
        } else if (nk.includes('_authors_ss')) {
            authors = rsb[nk];
        } else {
            notes.push(rsb[nk]);
        }
    });
    if (notes.length === 0) {
        return false;
    }
    if (!title) {
        title = 'Note on Related Subject';
    }
    let content = notes.join(', ');
    if (authors) {
        authors = [...new Set(authors)].join(', '); // convert list to set and back to list to remove duplicates
        content += ` (${authors})`;
    }
    return {
        title: title,
        content: content,
    };
}
