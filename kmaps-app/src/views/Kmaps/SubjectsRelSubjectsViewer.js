import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { MandalaPopover } from '../common/MandalaPopover';
import { Tab, Tabs } from 'react-bootstrap';
import FancyTree from '../FancyTree';
import { useKmap } from '../../hooks/useKmap';
import { queryID } from '../common/utils';
import MandalaSkeleton from '../common/MandalaSkeleton';
import KmapTree from '../KmapTree/KmapTree';

export function SubjectsRelSubjectsViewer({ id }) {
    const baseType = 'subjects';
    const {
        isLoading: isKmapLoading,
        data: kmap,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(baseType, id), 'info');

    const [tabKey, setTabKey] = useState('context'); // For showing the two tabs

    const kmaphead = kmap?.header;
    const domain = baseType;
    const kmtype = 'Subjects';
    const uid = kmap?.uid;
    const kid = uid?.split('-')[1] * 1;
    const base_path = window.location.pathname.split(domain)[0] + domain;

    const ancestor_count = kmap?.ancestors_gen?.length
        ? kmap.ancestors_gen.length - 1
        : 0;
    let child_count = 0;
    if (kmap?._childDocuments_?.length > 0) {
        const filtered_children = $.map(
            kmap._childDocuments_,
            function (child) {
                if (child.block_child_type === 'related_subjects') {
                    return child;
                } else {
                    return null;
                }
            }
        );
        child_count = filtered_children.length - 1; // seems to include self
    }

    const ispartof = [];
    const hasaspart = [];
    $.each(kmap?._childDocuments_, function (cdn, cd) {
        // console.log("cd",cd);
        const relsub = cd?.related_uid_s?.split('-');
        if (!relsub || relsub.length !== 2) {
            return;
        }
        const relcode = cd?.related_subjects_relation_code_s;
        if (relcode === 'is.part.of') {
            const rsrtu = cd?.related_subjects_relation_time_units_ss
                ? ` (${cd?.related_subjects_relation_time_units_ss} CE)`
                : null;
            ispartof.push(
                <>
                    <MandalaPopover
                        domain={relsub[0]}
                        kid={relsub[1]}
                        children={[cd.related_subjects_header_s]}
                    />
                    {rsrtu}
                </>
            );
        }
        if (relcode === 'has.as.a.part') {
            hasaspart.push(
                <MandalaPopover
                    domain={relsub[0]}
                    kid={relsub[1]}
                    children={[cd.related_subjects_header_s]}
                />
            );
        }
    });

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmap]);

    if (isKmapLoading) {
        return <MandalaSkeleton />;
    }

    return (
        <Tabs
            id="kmaps-relateds-tabs"
            className={'kmaps-related-viewer subjects'}
            activeKey={tabKey}
            onSelect={(k) => setTabKey(k)}
        >
            <Tab eventKey="context" title={`${kmtype} Context`}>
                <div className={'kmap-context'}>
                    <p>
                        <strong>{kmaphead}</strong> has {ancestor_count}{' '}
                        superordinate {kmtype.toLowerCase()} and {child_count}{' '}
                        subordinate {kmtype.toLowerCase()}. You can browse these
                        subordinate {kmtype.toLowerCase()} as well as its
                        superordinate categories with the tree below. See the
                        RELATED {kmtype.toUpperCase()} tab if you instead prefer
                        to view only its immediately subordinate{' '}
                        {kmtype.toLowerCase()} grouped together in useful ways,
                        as well as {kmtype.toLowerCase()} non-hierarchically
                        related to it.
                    </p>

                    <KmapTree
                        elid={`subject-context-tree-${kid}`}
                        className="l-subject-context-tree"
                        domain={domain}
                        level={1}
                        selectedNode={`${domain}-${kid}`}
                        startNode={`${domain}-${kid}`}
                        showAncestors={true}
                    />

                    {/*
                    <FancyTree
                        domain={domain}
                        tree={domain}
                        currentFeatureId={`${domain}-${kid}`}
                        featuresPath={
                            base_path + '/%%ID%%/related-subjects/deck'
                        }
                        descendants={true}
                        directAncestors={true}
                        displayPopup={true}
                        perspective={'gen'}
                        sortBy={'related_subjects_header_s+ASC'}
                    />

                    */}
                    {/*
                        <pre>
                            {
                                JSON.stringify(kmap, null, 4)
                            }
                        </pre>
                    */}
                </div>
            </Tab>
            <Tab eventKey="related" title={`Related ${kmtype}`}>
                <div className={'kmap-related'}>
                    <p>
                        <strong>{kmaphead}</strong> has{' '}
                        {hasaspart.length + ispartof.length} other subject
                        {hasaspart.length + ispartof.length > 1 && 's'} directly
                        related to it, presented here. See the{' '}
                        {kmtype.toUpperCase()} CONTEXT tab if you instead prefer
                        to browse all subordinate and superordinate categories
                        for {kmaphead}.
                        {ispartof.length > 0 && (
                            <>
                                <h3>{kmaphead} Is a Part Of These Types</h3>
                                <ul>
                                    {$.map(ispartof, function (pt, pn) {
                                        return (
                                            <li key={`km-parent-${pn}`}>
                                                {pt}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                        {hasaspart.length > 0 && (
                            <>
                                <h3>{kmaphead} Has These Types</h3>
                                <ul>
                                    {$.map(hasaspart, function (pt, pn) {
                                        return (
                                            <li key={`km-part-${pn}`}>{pt}</li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </p>
                </div>
            </Tab>
        </Tabs>
    );
}
