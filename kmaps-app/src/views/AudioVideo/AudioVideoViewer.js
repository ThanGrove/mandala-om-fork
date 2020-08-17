import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsonpAdapter from '../../logic/axios-jsonp';
import { Tabs, Tab } from 'react-bootstrap';
import '../css/AVViewer.css';
import $ from 'jquery';
import ReactHtmlParser from 'react-html-parser';

export function AudioVideoViewer(props) {
    const id = props.id;
    const kmasset = props.mdlasset;
    const sui = props.sui;
    const mapp = 'images';
    useEffect(() => {
        $('body').on('click', 'a.sui-avMore2', function () {
            $('#sui-avlang').toggle();
            this.text = this.text == 'SHOW MORE' ? 'SHOW LESS' : 'SHOW MORE';
        });
        $('#sui-main').addClass('av');
    }, []);

    return (
        <div id={'av-viewer'}>
            <AudioVideoPlayer id={id} asset={kmasset} sui={sui} />
            <AudioVideoMeta id={id} asset={kmasset} sui={sui} />
        </div>
    );
}

function AudioVideoPlayer(props) {
    const kmasset = props.asset;
    const sui = props.sui;
    sui.av.DrawPlayer(kmasset, 'sui-av');
    return <div id={'sui-av'}>Loading ...</div>;
}

function AudioVideoMeta(props) {
    const kmasset = props.asset;
    const sui = props.sui;
    const [mlt, setMlt] = useState([]);
    // Effect gets the More Like This list
    useEffect(() => {
        axios({
            url:
                process.env.REACT_APP_DRUPAL_AUDIO_VIDEO +
                '/services/mlt/256?wt=json', // TODO: Update that url
            adapter: jsonpAdapter,
        })
            .then(function (response) {
                // handle success
                console.log(response);
                // setMlt(response.data);
                //$('#meta-mlt').html(response.data);
                setMlt(response.data);
            })
            .catch(function (error) {
                // handle error
                console.error(error);
            });
    }, []);
    sui.av.DrawMetaNew(kmasset, 'meta-details');
    return (
        <div id="av-meta-row">
            <Tabs defaultActiveKey="details" id="av-meta-tabs">
                <Tab eventKey="details" title="DETAILS ">
                    <div id={'meta-details'}>Loading ...</div>
                </Tab>
                <Tab eventKey="related" title="RELATED ">
                    <div id={'meta-mlt'}>
                        {mlt.map((tile, n) => {
                            return <AudioVideoMltTile markup={tile} />;
                        })}
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}

function AudioVideoMltTile(props) {
    const mu = props.markup;
    const $mu = $(mu);
    const nid = $mu.data('nid');
    // Replace the video link with an in-standalone link
    $mu.find('.shanti-field-video a.shanti-thumbnail-link')[0].href =
        '/mandala-om/audio-video/' + nid;
    // Remove the link to the collection for now.
    const lnktxt = $mu.find(
        '.shanti-field-group-audience a.shanti-thumbnail-link'
    )[0].text;
    $($mu.find('.shanti-field-group-audience .shanti-field-content')[0]).html(
        lnktxt
    );
    const options = { decodeEntities: true };
    return <>{ReactHtmlParser($mu.html(), options)}</>;
}
