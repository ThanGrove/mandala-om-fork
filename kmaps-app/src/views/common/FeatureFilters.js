import React from 'react';
import { FacetChoice } from '../../search/FacetChoice';
import { CSSTransition, TransitionGroup } from 'react-transition-group'; // ES6
import { useQueryParams, StringParam, withDefault } from 'use-query-params';
import { ArrayOfObjectsParam } from '../../hooks/utils';

export function FeatureFilters(props) {
    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    const { searchText: search, filters } = query;

    function handleFacetClick(command) {
        if (command.action === 'remove') {
            const newFilters = filters.filter(
                (filter) => !(filter.id === command.value)
            );
            setQuery(
                {
                    searchText: search,
                    filters: newFilters,
                },
                'push'
            );
        }
    }

    const removeIconClass = 'sui-advTermRem u-icon__cancel-circle icon';

    const entries =
        filters?.map((entry) => {
            return (
                <CSSTransition key={entry.id} timeout={1000} classNames="item">
                    {/*<Badge*/}
                    {/*    key={entry.id}*/}
                    {/*    pill*/}
                    {/*    variant={'secondary'}*/}
                    {/*    className={'m-2 p-2 pr-3'}*/}
                    {/*>*/}
                    <FacetChoice
                        mode={'remove'}
                        operator={'AND'}
                        key={`Remove ${entry.id}`}
                        className={removeIconClass}
                        value={entry.id}
                        labelText={entry.label}
                        label={entry.label}
                        facetType={entry.field}
                        onFacetClick={(msg) => {
                            handleFacetClick({ ...msg, action: 'remove' });
                        }}
                    />
                    {/*</Badge>*/}
                </CSSTransition>
            );
        }) || [];

    if (entries.length) {
        entries.unshift(
            <CSSTransition key="label" timeout={1000} classNames="item">
                <span>Applied Filters: </span>
            </CSSTransition>
        );
    }

    return (
        <span>
            <TransitionGroup className={'sui-facetList-horiz'}>
                {entries}
            </TransitionGroup>
        </span>
    );
}
