import React, { useContext, useState } from 'react';

import './HistoryViewer.css';

import { HistoryContext } from './HistoryContext';
import { Link } from 'react-router-dom';
import { capitalAsset } from '../common/utils';
import { useHistory } from '../../hooks/useHistory';

export function HistoryViewer(props) {
    //const history = useContext(HistoryContext);
    //const [pages, setPages] = useState(Array.from(history.pages));
    const pages = useHistory((state) => Array.from(state.pages));
    const removePage = useHistory((state) => state.removePage);
    return (
        <div className="c-HistoryViewer">
            {pages &&
                pages?.map((pgdata, pdi) => {
                    let [pgicon, pgtitle, pgpath] = pgdata.split('::');
                    let asset_type = '';
                    const isCollection = pgicon.includes('collections-');
                    if (isCollection) {
                        asset_type = pgicon.split('-')[1];
                        pgicon = 'collections';
                    } else {
                        asset_type = pgicon;
                    }
                    if (typeof pgtitle === 'undefined') {
                        return;
                    }
                    const linkTitle = isCollection
                        ? capitalAsset(asset_type) + ' Collection'
                        : capitalAsset(asset_type);
                    return (
                        <div
                            className="c-HistoryViewer__relatedRecentItem"
                            data-path={pgpath}
                            key={pdi + pgpath.replace(/\//g, '-')}
                        >
                            <span className="c-HistoryViewer__title">
                                <span
                                    className={
                                        'facetItem icon u-icon__' + pgicon
                                    }
                                    title={linkTitle}
                                >
                                    {' '}
                                </span>
                                <Link to={pgpath} title={linkTitle}>
                                    {pgtitle}
                                </Link>
                            </span>
                            <span
                                className="c-HistoryViewer__removeItem u-icon__cancel-circle icon"
                                alt="Remove from list"
                                aria-label="Remove from list"
                                data-listid={pdi}
                                onClick={(event) => {
                                    /*history.removePage(
                                        event.target.getAttribute('data-listid')
                                    );
                                    setPages(Array.from(history.pages));*/
                                    console.log(
                                        'Need to update remove page to use zustand'
                                    );
                                    event.stopPropagation();
                                }}
                            >
                                {' '}
                            </span>
                        </div>
                    );
                })}
        </div>
    );
}

export default HistoryViewer;
