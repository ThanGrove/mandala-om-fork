/*
Test element to show all 3 types of trees on a page. Used currently in ContentMain for testing. remove when done.
 */
import { Col, Container, Row } from 'react-bootstrap';
import { getProject } from '../common/utils';
import React from 'react';
import KmapTree from './KmapTree';

export function TreeTest2(props) {
    return (
        <Container className="tree-test">
            <Row>
                {/*
                <Col sm={4}>
                    <KmapTree
                        domain="places"
                        elid="places-tree-1"
                        isOpen={true}
                        project={getProject()}
                    />
                </Col>
                <Col sm={4}>
                    <KmapTree
                        domain="subjects"
                        level="1"
                        elid="subjects-tree-1"
                        project={getProject()}
                    />
                </Col>
                */}
                <Col sm={4}>
                    <KmapTree
                        domain="terms"
                        level="1"
                        elid="terms-tree-1"
                        perspective="tib.alpha"
                        noRootLinks={true}
                    />
                </Col>
            </Row>
            {/*
            <Row>
                <Col sm={4}>
                    <KmapTree
                        domain="places"
                        elid="places-tree-2"
                        isOpen={true}
                    />
                </Col>
                <Col sm={4}>
                    <KmapTree
                        domain="subjects"
                        level="1"
                        elid="subjects-tree-2"
                    />
                </Col>
                <Col sm={4}>
                     Adding another terms tree interferes with filtered one. TODO: figure out why!
                    <KmapTree
                        domain="terms"
                        level="1"
                        elid="terms-tree-2"
                        perspective="tib.alpha"
                        noRootLinks={true}
                    />
                </Col>
            </Row>
                    */}
        </Container>
    );
}
