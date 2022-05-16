import React, { useRef, useState, useEffect } from 'react';
import Badge from 'react-bootstrap/Badge';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/cjs/Nav';
import SearchViewer from '../views/History/SearchViewer';
import { BsArrowCounterclockwise } from 'react-icons/bs';
import { MdOutlineScreenSearchDesktop } from 'react-icons/md';
import * as PropTypes from 'prop-types';
import _ from 'lodash';
import { Type } from '../model/HistoryModel';
import { useHistory } from '../hooks/useHistory';
import { useRecentSearch } from '../hooks/useRecentSearch';

export function RecentSearch(props) {
    const inputEl = useRef(null);
    const sortFieldEl = useRef(null);
    const [sortField, setSortField] = useState('count');
    const sortDirectionEl = useRef(null);
    const [sortDirection, setSortDirection] = useState('desc');
    const pages = useHistory((state) => state.pages);
    const resetPages = useHistory((state) => state.resetPages);
    const searches = useRecentSearch((state) => state.searches);
    const resetSearchPages = useRecentSearch((state) => state.resetSearchPages);

    const [viewedSearches, setViewedSearches] = useState(searches);
    const [open, setOpen] = useState(false);
    let chosen_icon = props.icon;
    const facetType = props.facetType;
    const facets = props.facets;
    const chosenFacets = props.chosenFacets || [];

    // if the sortField or sortDirection change make sure the send handleNarrowFilter messages
    // useEffect(() => {
    //     handleNarrowFilters();
    // }, [sortField, sortDirection]);

    // useEffect(() => {
    //     inputEl.current.value = '';
    // }, [props.resetFlag]);

    // console.log("HistoryBox: props = ", props);

    useEffect(() => {
        setViewedSearches(searches);
    }, [searches, setViewedSearches]);

    function arrayToHash(array, keyField) {
        return array.reduce((collector, item) => {
            collector[item[keyField]] = item;
            return collector;
        }, {});
    }

    const chosenHash = arrayToHash(chosenFacets, 'id');

    const handleKey = (x) => {
        // submit on return
        // if (x.keyCode === 13) {
        //     handleNarrowFilters();
        // }
    };

    const handleChange = (event) => {
        const filteredSearches = searches.filter(
            (search) =>
                search.searchText.includes(event.target.value) ||
                event.target.value === ''
        );
        setViewedSearches(filteredSearches);
    };

    // console.log("chosen hash = ", chosenHash);
    const isChosen = (id) => (chosenHash[id] ? true : false);
    // console.log("HistoryBox (" + facetType + ") chosenHash: ", chosenHash );

    const ICON_MAP = {
        'audio-video': <span className={'icon u-icon__audio-video'} />,
        texts: <span className={'u-icon__texts icon'} />,
        'texts:pages': <span className={'u-icon__texts icon'} />,
        images: '\ue62a',
        sources: '\ue631',
        visuals: '\ue63b',
        places: '\ue62b',
        subjects: '\ue634',
        terms: '\ue635',
        collections: '\ue633',
        'recent-searches': '\ue62e',
        asset_type: '\ue60b',
        users: '\ue600',
        creator: '\ue600',
        languages: '\ue670',
        feature_types: <span className={'u-icon__explore icon'} />,
    };

    chosen_icon = chosen_icon || ICON_MAP[facetType];
    const icon = chosen_icon;
    const plus = <span className={'u-icon__plus icon'} />;
    const minus = <span className={'u-icon__minus icon'} />;
    const label = props.label || 'UNKNOWN LABEL';

    let historyLength = viewedSearches.length;

    const historyList = (
        <SearchViewer mode={'search'} searches={viewedSearches} />
    );

    const name = 'sort_' + props.id;

    const recentSearch = (
        <div className={'sui-advBox sui-advBox-' + props.id}>
            <div
                className={'sui-advHeader'}
                id={'sui-advHeader-A'}
                onClick={() => setOpen(!open)}
            >
                <span className={'icon'}>
                    {props.id === 'recent' ? (
                        <BsArrowCounterclockwise />
                    ) : (
                        <MdOutlineScreenSearchDesktop />
                    )}
                </span>
                <span className="app-name">{label}</span>
                <span id={'sui-advPlus-' + props.id} className={'sui-advPlus'}>
                    <Badge
                        pill
                        variant={historyLength ? 'primary' : 'secondary'}
                    >
                        {historyLength}
                    </Badge>{' '}
                    {open ? minus : plus}
                </span>
            </div>

            {/*<div className={'sui-advTerm'} id={'sui-advTerm-' + props.id}>*/}
            {/*    {chosenList}*/}
            {/*</div>*/}
            <div
                className={
                    'sui-advEdit c-FacetBox--expander ' +
                    (open ? 'open' : 'closed')
                }
                id={'sui-advEdit-' + props.id}
            >
                <Navbar>
                    <Nav.Item className={'sui-advEdit-facet-ctrls'}>
                        <input
                            type={'text'}
                            placeholder="Filter this list"
                            onChange={handleChange}
                            defaultValue={''}
                            onKeyDownCapture={handleKey}
                            ref={inputEl}
                        />
                    </Nav.Item>
                    <Navbar.Collapse className="justify-content-end">
                        <Nav.Link
                            eventKey="resetHistory"
                            onClick={resetSearchPages}
                        >
                            clear
                        </Nav.Link>
                    </Navbar.Collapse>
                </Navbar>

                <div className="sui-adv-facetlist sui-adv-facetlist-padding">
                    {historyLength ? historyList : 'Search History is empty.'}
                </div>
            </div>
        </div>
    );
    return recentSearch;
}

RecentSearch.propTypes = {
    label: PropTypes.string,
    chosenIcon: PropTypes.string,
    facetType: PropTypes.string,
    filters: PropTypes.array,
};
