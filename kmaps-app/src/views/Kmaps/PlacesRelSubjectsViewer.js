import React, { useEffect } from 'react';
import $ from 'jquery';
import { MandalaPopover } from '../common/MandalaPopover';
import { useParams } from 'react-router-dom';
import { useKmap } from '../../hooks/useKmap';
import { queryID } from '../common/utils';
import { PlacesSummary } from './PlacesInfo';

export default function PlacesRelSubjectsViewer() {
    let { id } = useParams();
    const baseType = 'places';

    const {
        isLoading: isKmapLoading,
        data: kmap,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(baseType, id), 'info');

    const kmapkids = kmap?._childDocuments_; // Child documents of this kmaps
    const relsubjs = kmapkids?.filter((child, n) => {
        return child.id.includes('_relatedSubject_');
    });

    useEffect(() => {
        $('main.l-column__main').addClass('places');
    }, [kmap]);

    if (kmap?.feature_type_ids.length === 0 && relsubjs?.length === 0) {
        return (
            <div>
                <p>{kmap.header} has no related subjects.</p>
            </div>
        );
    } else {
        return (
            <div>
                {kmap?.feature_type_ids.length > 0 && (
                    <>
                        <h3 className={'head-related'}>Feature Types</h3>
                        <ul>
                            {kmap.feature_type_ids.map((kid, cind) => {
                                return (
                                    <li key={kid + Math.random()}>
                                        <MandalaPopover
                                            domain={'subjects'}
                                            kid={kid}
                                            children={[
                                                kmap.feature_types[cind],
                                            ]}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
                {relsubjs?.length > 0 && (
                    <>
                        <h3 className={'head-related'}>Related Subjects</h3>
                        <ul>
                            {relsubjs.map((relsb, cind) => {
                                return (
                                    <li
                                        key={
                                            relsb?.related_subjects_display_string_s +
                                            '-' +
                                            cind
                                        }
                                    >
                                        {
                                            relsb?.related_subjects_display_string_s
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
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>
        );
    }
}
