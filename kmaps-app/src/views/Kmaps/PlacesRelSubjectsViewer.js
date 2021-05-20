import React, { useEffect } from 'react';
import $ from 'jquery';
import { MandalaPopover } from '../common/MandalaPopover';
import { useParams } from 'react-router-dom';
import { useKmap } from '../../hooks/useKmap';
import { queryID } from '../common/utils';
import { PlacesSummary } from './PlacesInfo';
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
    // TODO: Make this go through each feature type and look for distinctive notes for that feature

    const ftnote = getFeatureTypeNotes(parent);
    return (
        <>
            <h3 className={'head-related'}>Feature Types</h3>
            <ul>
                {parent.feature_type_ids.map((kid, cind) => {
                    return (
                        <li key={kid + Math.random()}>
                            <MandalaPopover
                                domain={'subjects'}
                                kid={kid}
                                children={[parent.feature_types[cind]]}
                            />
                            {ftnote && (
                                <GenericPopover
                                    title="Note on Feature Types"
                                    content={ftnote['content']}
                                />
                            )}
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
                    const notes = getRelatedSubjNotes(relsb);
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
                                        {
                                            relsb
                                                ?.related_subjects_time_units_t[0]
                                        }
                                        )
                                    </span>{' '}
                                </>
                            )}
                            {notes && (
                                <GenericPopover
                                    title={notes['title']}
                                    content={notes['content']}
                                />
                            )}
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
        console.log(note);
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
