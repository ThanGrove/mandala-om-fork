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
                                    title="Related Subject Note"
                                    content={notes}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

function getRelatedSubjNotes(rsb) {
    const notes = [];
    const notekeys = Object.keys(rsb).filter((rsbk) => {
        return rsbk.includes('_note_');
    });
    notekeys.forEach((nk) => {
        notes.push(rsb[nk]);
    });
    return notes.length > 0 ? notes.join(', ') : false;
}
