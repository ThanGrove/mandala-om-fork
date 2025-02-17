import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';
import { Button, Jumbotron, Toast } from 'react-bootstrap';
import JSXExpressionContainerMock from 'eslint-plugin-jsx-a11y/__mocks__/JSXExpressionContainerMock';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { BsArrowRight } from 'react-icons/all';

export default function Home(props) {
    if (process?.env?.REACT_APP_STANDALONE === 'standalone') {
        return null;
    }
    document.title = 'Mandala Collections';
    return (
        <section className="l-content__main__wrap ">
            <Container>
                <Row className="justify-content-md-center">
                    <Col md="auto"></Col>
                    <Col>
                        <Jumbotron>
                            <h3>Work-in-Progress</h3>

                            <h4>University of Flourishing</h4>
                            <ul>
                                <li>
                                    <Link to={'/subjects/9319'}>
                                        U of F (Subject)
                                    </Link>
                                </li>

                                <li>
                                    <Link to={'/subjects/9336'}>
                                        Compassion(Subject)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/places/5414'}>
                                        Purwanchal (places)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/places/122774'}>
                                        Wādenswill (places)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/247722'}>
                                        Medicine Yoga (terms)
                                    </Link>
                                </li>
                            </ul>

                            <h4>
                                <Link to={'/terms/all/list'}>Terms</Link>
                            </h4>
                            <ul id="terms-list">
                                <li>
                                    <Link to={'/terms/260'}>
                                        ka dag (terms-260)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/2626'}>
                                        kun gzhi (terms-2626)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/4227'}>
                                        klu sgrub (terms-4227)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/12434'}>
                                        skyes pa ‘brus phyung ba (terms-12434)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/12587'}>
                                        skyes bu gsum (terms-12587)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/21124'}>
                                        khregs chod (terms-21124)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/45057'}>
                                        'gro ba/ (terms-45057)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/85193'}>
                                        thod rgal/: (terms-85193)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/247732'}>
                                        Yam (terms-247732)
                                    </Link>
                                </li>
                            </ul>
                            <h4>
                                <Link to={'/places/all/list'}>Places</Link>
                            </h4>
                            <ul>
                                <li>
                                    <Link to={'/places/134685'}>
                                        Sawtelle: (places-134685)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/places/16408'}>
                                        Potala Palace: (places-16408)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/places/637'}>
                                        Lhasa: (places-637)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/places/23332'}>
                                        Sera Gön: (places-23332 — has a note)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/places/427'}>
                                        Bhutan: (places-427)
                                    </Link>
                                </li>
                            </ul>
                            <h4>
                                <Link to={'/subjects/all/list'}>Subjects</Link>
                            </h4>
                            <ul>
                                <li>
                                    <Link to={'/subjects/3719'}>
                                        Whaling Station Test: (subjects-3719)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/subjects/20'}>
                                        Geographical Features: (subjects-20)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/subjects/8260'}>
                                        Bhutan Cultural Library: (subjects-8260)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/subjects/4102'}>
                                        Tibetan Contemporary Art:
                                        (subjects-4102)
                                    </Link>
                                </li>
                            </ul>
                            <h4>Other</h4>
                            <ul>
                                <li>
                                    <Link to={'/search'}>Search</Link>
                                </li>
                                <li>
                                    <Link to={'/advanced-search'}>
                                        Advanced Search
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/treetest'}>Tree Test</Link>
                                </li>
                                <li>
                                    <Link to={'/admin/devanagari'}>
                                        Translit. <BsArrowRight /> Devanagari
                                    </Link>
                                </li>
                            </ul>
                        </Jumbotron>
                    </Col>
                    <Col>
                        <Jumbotron>
                            <h4>
                                <Link to={'/collections/all/list'}>
                                    Collections
                                </Link>
                            </h4>
                            <ul>
                                <li>
                                    <Link to={'/mandala/collection/236/deck'}>
                                        Mandala Mixed Collection
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/audio-video/collection/3'}>
                                        Audio-Video Collection: THL
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/images/collection/45316'}>
                                        Image Collection: Central Tibet
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/sources/collection/23541'}>
                                        Source Collection: Yogācāra Example
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/texts/collection/48596'}>
                                        Text Collection: University of
                                        Flourishing
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/visuals/collection/5786'}>
                                        Visual Collection: University of
                                        Flourishing
                                    </Link>
                                </li>
                            </ul>

                            <h4>
                                <Link to={'/audio-video/all/list'}>
                                    Audio-Video
                                </Link>
                            </h4>
                            <ul>
                                <li>
                                    <Link to={'/audio-video/825'}>
                                        Video: Carpenter of Lhagya Ri Palace
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/audio-video/306'}>
                                        Video: Dawa and Pudrön Flirt
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/audio-video/9246'}>
                                        Video: Riddle of the Terma Vase
                                    </Link>{' '}
                                    (Many Agents, Transcript, Tibetan and
                                    Chinese text)
                                </li>
                            </ul>

                            <h4>
                                <Link to={'/images/all/list'}>Images</Link>
                            </h4>
                            <ul>
                                <li>
                                    <Link to={'/images/1421596'}>
                                        Image: Dudul Dorjay Festival Photo
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/images/160186'}>
                                        Image: High Tibet Chu ser
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/images/1243906'}>
                                        Image: Lhasa Mural Painting
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/images/45806'}>
                                        Image: Woman on Basum Island
                                    </Link>
                                </li>
                            </ul>

                            <h4>
                                <Link to={'/sources/all/list'}>Sources</Link>
                            </h4>
                            <ul>
                                <li>
                                    <Link to={'/sources/36896'}>
                                        Source: Emulsifying Properties of Dried
                                        Soy-Whey
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/sources/87826'}>
                                        Source: 100% Renewable Energy Systems
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/sources/87476'}>
                                        Source: Accounting for Nat. Resources
                                        &amp; Env. Sustainability
                                    </Link>
                                </li>
                            </ul>

                            <h4>
                                <Link to={'/texts/all/list'}>Texts</Link>
                            </h4>
                            <ul>
                                <li>
                                    <Link to={'/texts/16230'}>
                                        Text: Introduction to Drepung Colleges
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/texts/46641'}>
                                        Text: Veronoica’s Test
                                    </Link>{' '}
                                    has embedded video etc.
                                </li>
                                <li>
                                    <Link to={'/texts/50751'}>
                                        Text: Hagar of The Pawn-Shop
                                    </Link>{' '}
                                    has Hagar... and a Pawn Shop.
                                </li>
                            </ul>

                            <h4>
                                <Link to={'/visuals/all/list'}>Visuals</Link>
                            </h4>
                            <ul>
                                <li>
                                    <Link to={'/visuals/4451'}>
                                        Visuals: Bloodtype Pie Chart
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/visuals/5821'}>
                                        Visuals: Vimeo Video
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/visuals/1806'}>
                                        Visuals: Graph Indo-European Languages
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/visuals/5266'}>
                                        Visuals: Timeline DH Chronology
                                    </Link>
                                </li>
                            </ul>

                            <h4>References</h4>
                            <ul>
                                <li>
                                    <a
                                        href={
                                            'https://www.viseyes.org/ksolr/#s=text:lhasa=assets:All:all:AND'
                                        }
                                    >
                                        KSolr search on Lhasa
                                    </a>
                                </li>
                                <li>
                                    <Link to={'/poptest/places/637'}>
                                        Kmaps Popover Test Page
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href={
                                            'https://mandala.shanti.virginia.edu/'
                                        }
                                        target={'_blank'}
                                    >
                                        Mandala Home
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={
                                            'https://subjects.kmaps.virginia.edu/'
                                        }
                                        target={'_blank'}
                                    >
                                        Subjects Editing Home
                                    </a>
                                </li>
                            </ul>
                        </Jumbotron>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}
