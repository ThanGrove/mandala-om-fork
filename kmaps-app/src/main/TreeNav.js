import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { useRouteMatch } from 'react-router-dom';
import { getProject, queryID } from '../views/common/utils';
import KmapTree from '../views/KmapTree/KmapTree';
import { closeStore } from '../hooks/useCloseStore';

const TreeNav = (props) => {
    const openclass = props.tree ? 'open' : 'closed';
    let domain = 'places';
    const domainfids = {
        places: 'false',
        subjects: 'false',
        terms: 'false',
    };
    const match = useRouteMatch([
        '/:baseType/:id/related-:type/:definitionID/view/:relID',
        '/:baseType/:id/related-:type/:definitionID/:viewMode',
        '/:baseType/:id/related-:type',
        '/:baseType/:id',
    ]);

    // Get function to handle closeButton state.
    const handleCloseButton = closeStore((state) => state.changeButtonState);

    let found = false;
    if (match?.params?.baseType) {
        domain = match.params.baseType;
        if (['places', 'subjects', 'terms'].includes(domain)) {
            if (Object.keys(domainfids).includes(domain)) {
                domainfids[domain] = queryID(domain, match.params.id);
                found = true;
            }
        }
    }

    if (!found) {
        domain = 'places';
        domainfids[domain] = queryID('places', 13735);
    }
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
                    <h4 className="treeNav-header__title">Knowledge Maps</h4>
                    <button
                        onClick={handleCloseButton}
                        className="treeNav-header__closeButton"
                    >
                        <span className={'icon shanticon-cancel'}></span>
                    </button>
                </header>
                <Tabs
                    defaultActiveKey={domain}
                    id="kmaps-tab"
                    role="navigation"
                    className="treeNav-tabs__wrap justify-content-center"
                >
                    <Tab eventKey="places" title="Places">
                        <KmapTree
                            elid="tab-tree-places"
                            domain="places"
                            isOpen={true}
                            selectedNode={domainfids['places']}
                            project={getProject()}
                        />
                    </Tab>
                    <Tab eventKey="subjects" title="Subjects">
                        <KmapTree
                            elid="tab-tree-subjects"
                            domain="subjects"
                            level={1}
                            selectedNode={domainfids['subjects']}
                            project={getProject()}
                        />
                    </Tab>
                    <Tab eventKey="terms" title="Terms">
                        <KmapTree
                            elid="tab-tree-terms"
                            domain="terms"
                            level={1}
                            selectedNode={domainfids['terms']}
                            project={getProject()}
                        />
                    </Tab>
                </Tabs>
            </div>
        </aside>
    );
};

export default TreeNav;
