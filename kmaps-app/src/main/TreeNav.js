import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { useLocation } from 'react-router-dom';
import { queryID } from '../views/common/utils';
import KmapTree from '../views/KmapTree/KmapTree';
const PlacesTree = React.lazy(() => import('./PlacesTree'));
const TermsTree = React.lazy(() => import('./TermsTree'));
const SubjectsTree = React.lazy(() => import('./SubjectsTree'));

const TreeNav = (props) => {
    const openclass = props.tree ? 'open' : 'closed';
    let domain = 'places';
    const domainfids = {
        places: 'false',
        subjects: 'false',
        terms: 'false',
    };
    let loc = useLocation();
    loc = loc.pathname.split('/');
    let found = false;

    if (loc.length > 2) {
        domain = loc[1];
        const kid = loc[2];
        if (Object.keys(domainfids).includes(domain)) {
            domainfids[domain] = queryID(domain, kid);
            found = true;
        }
    }
    if (!found) {
        domain = 'places';
        domainfids[domain] = queryID('places', 13735);
    }
    return (
        <aside
            id="l-column__search--treeNav"
            className={`l-column__search c-TreeNav--tabs ${openclass} overflow-auto`}
        >
            <div>
                <span
                    className={
                        'sacrifical-dummy-element-that-is-not-displayed-for-some-reason'
                    }
                ></span>
                <Tabs defaultActiveKey={domain} id="kmaps-tab">
                    <Tab eventKey="places" title="Places">
                        <KmapTree
                            elid="tab-tree-places"
                            domain="places"
                            isOpen={true}
                            selectedNode={domainfids['places']}
                        />
                    </Tab>
                    <Tab eventKey="subjects" title="Subjects">
                        <KmapTree
                            elid="tab-tree-subjects"
                            domain="subjects"
                            selectedNode={domainfids['subjects']}
                        />
                    </Tab>
                    <Tab eventKey="terms" title="Terms">
                        <KmapTree
                            elid="tab-tree-terms"
                            domain="terms"
                            selectedNode={domainfids['terms']}
                        />
                    </Tab>
                </Tabs>
            </div>
        </aside>
    );
};

export default TreeNav;
