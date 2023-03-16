import React, { useEffect, useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { useRouteMatch, useLocation } from 'react-router-dom';
import { getProject, queryID } from '../views/common/utils';
import KmapTree from '../views/KmapTree/KmapTree';
import { treeStore, openTabStore } from '../hooks/useCloseStore';

const TreeNav = (props) => {
    const openTab = openTabStore((state) => state.openTab);
    const tree = treeStore((state) => state.tree);
    const setTree = treeStore((state) => state.setTree);
    const [currSel, setCurrSel] = useState(0);
    let openclass = openTab === 2 ? 'open' : 'closed';

    let domain = 'places';

    const location = useLocation();

    const match = useRouteMatch([
        '/:baseType/:id/related-:type/:definitionID/view/:relID',
        '/:baseType/:id/related-:type/:definitionID/:viewMode',
        '/:baseType/:id/related-:type',
        '/:baseType/:id',
    ]);

    // Get function to handle closeButton state.
    //const handleCloseButton = closeStore((state) => state.changeButtonState);

    const changeTab = openTabStore((state) => state.changeButtonState);
    // On page load set active tab based on any matched domain in location path of standalone
    useEffect(() => {
        if (process.env.REACT_APP_STANDALONE === 'standalone') {
            const path_parts = window.location.pathname.split('/');
            const matches = ['places', 'subjects', 'terms'].filter((val) =>
                path_parts.includes(val)
            );
            if (matches.length > 0) {
                setTree(matches[0]);
            }
        }
    }, []);

    useEffect(() => {
        if (match) {
            let cs = match.params.id * 1;
            setCurrSel(cs);
        }
    }, [match]);

    // Whenever the React location changes, update the tab based on any domain in the React Route
    useEffect(() => {
        // Look for Domain in React Route
        if (match?.params?.baseType) {
            domain = match.params.baseType;
            if (['places', 'subjects', 'terms'].includes(domain)) {
                setTree(domain);
            }
        }
    }, [location]);

    const handleCloseButton = () => {
        changeTab(0);
    };

    return (
        <aside
            id="l-column__search--treeNav"
            className={`l-column__search c-TreeNav--tabs ${openclass}`}
        >
            <div>
                <span
                    className={
                        'sacrifical-dummy-element-that-is-not-displayed-for-some-reason'
                    }
                ></span>
                <header className="treeNav-header">
                    <h4 className="treeNav-header__title">Browse</h4>
                    <button
                        onClick={handleCloseButton}
                        className="treeNav-header__closeButton"
                    >
                        <span className={'icon shanticon-cancel'}></span>
                    </button>
                </header>
                <Tabs
                    // defaultActiveKey={domain}
                    activeKey={tree}
                    onSelect={(k) => {
                        setTree(k);
                    }}
                    id="kmaps-tab"
                    role="navigation"
                    className="treeNav-tabs__wrap justify-content-center"
                >
                    <Tab eventKey="places" title="Places">
                        {tree === 'places' && (
                            <KmapTree
                                elid="tab-tree-places"
                                domain="places"
                                level={1}
                                isOpen={true}
                                project={getProject()}
                            />
                        )}
                    </Tab>
                    <Tab eventKey="subjects" title="Subjects">
                        {tree === 'subjects' && (
                            <KmapTree
                                elid="tab-tree-subjects"
                                domain="subjects"
                                level={1}
                                project={getProject()}
                            />
                        )}
                    </Tab>
                    <Tab eventKey="terms" title="Terms">
                        {tree === 'terms' && (
                            <KmapTree
                                elid="tab-tree-terms"
                                domain="terms"
                                level={1}
                                project={getProject()}
                            />
                        )}
                    </Tab>
                </Tabs>
            </div>
        </aside>
    );
};

export default TreeNav;
