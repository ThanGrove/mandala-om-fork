import React from 'react';
// Start OpenLayers imports
import { Feature, Map, View } from 'ol';
import { GeoJSON } from 'ol/format';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import {
    defaults as DefaultInteractions,
    DragRotateAndZoom,
} from 'ol/interaction';
import { defaults as DefaultControls, ScaleLine, ZoomSlider } from 'ol/control';
import {
    Stroke as StrokeStyle,
    Fill as FillStyle,
    Text as TextStyle,
    Style,
} from 'ol/style';

import { get as getProjection, transformExtent } from 'ol/proj';

// End OpenLayers imports
import GoogleLayer from 'olgm/layer/Google.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import axios from 'axios';

class KmapsMap extends React.Component {
    constructor(props) {
        super(props);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.state = {
            height: props.height || 400,
            width: props.width || 400,
            fid: props.fid,
            language_layer: props.languageLayer || 'roman_popular',
            zoom: props.zoom || 7,
            map: null,
            boundaryLayer: props.boundaryLayer,
            boundaryLayerError: props.boundaryLayerError,
            locationLayer: props.locationLayer,
            locationLayerError: props.locationLayerError,
        };
        this.inset_map_ref = React.createRef();
    }

    updateDimensions() {
        // When shrinking window, grandparent doesn't shrink because map element has width/height set in style.
        if (
            window.pastInnerWidth &&
            window.innerWidth < window.pastInnerWidth
        ) {
            // Reset element width and height when shrinking
            this.state.element.setAttribute('style', '');
            window.pastInnerWidth = window.innerWidth;
        } else {
            window.pastInnerWidth = window.innerWidth;
        }

        // Get grandparent container (if available) to calculate new height and width for map.
        const mapdiv = this.state.element.parentNode.parentNode
            ? this.state.element.parentNode.parentNode
            : this.state.element;
        const h = mapdiv.clientHeight;
        const w = mapdiv.clientWidth;
        this.setState({ height: h, width: w });
    }

    componentDidUpdate(nextProps) {
        const { fid } = this.props;
        if (this.state.fid !== fid) {
            this.state.map.setTarget(null);
            this.setState({
                fid: nextProps.fid,
                width: nextProps.width,
                height: nextProps.height,
            });

            this.buildMap(nextProps.fid);
        }
    }

    componentWillMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    componentDidMount() {
        this.buildMap();
    }

    buildMap(forcedId = null) {
        this.setState({ element: this.inset_map_ref.current });
        this.createMap(forcedId);
        this.zoomToFeature(forcedId);
    }

    addBoundaryLayer(map) {
        const { boundaryLayer, boundaryLayerError } = this.state;
        if (boundaryLayerError) {
            this.handleBuildMapFailure();
        }

        if (boundaryLayer && map) {
            const document = boundaryLayer.docs[0];
            const geometryDataStr = document['geometry_rptgeom'];
            const geometryDataJson = JSON.parse(geometryDataStr);
            const geometryData = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: geometryDataJson,
                    },
                ],
            };

            const vectorLayer = new VectorLayer({
                source: new VectorSource({
                    features: new GeoJSON({
                        featureProjection: 'EPSG:3857',
                    }).readFeatures(geometryData),
                }),
                style: new Style({
                    stroke: new StrokeStyle({
                        color: '#000000',
                        width: 5,
                    }),
                    fill: new FillStyle({
                        color: 'rgba(0,0,0,0)',
                    }),
                }),
            });

            map.addLayer(vectorLayer);
        }
    }

    addLocationLayer(map) {
        const { locationLayer, locationLayerError } = this.state;
        if (locationLayerError) {
            this.handleBuildMapFailure();
        }

        if (locationLayer && map) {
            const document = locationLayer.docs[0];

            const geometryDataStr = document['shapes_centroid_grptgeom'];
            const geometryDataJson = JSON.parse(geometryDataStr);

            const name = document['name_roman.popular'][0];

            // create a vector source from the GeoJSON data
            const features = new GeoJSON({
                featureProjection: 'EPSG:3857',
            }).readFeatures(geometryDataJson);

            // create the label style for the features
            const labelStyle = new Style({
                text: new TextStyle({
                    text: name,
                    font: 'bold 16px/1 sans-serif',
                    fill: new FillStyle({ color: 'white' }),
                    stroke: new StrokeStyle({ color: 'black', width: 3 }),
                }),
            });

            // add the label style to feature
            features[0].setStyle(labelStyle);

            // create a vector layer for the labels
            const vectorLayer = new VectorLayer({
                source: new VectorSource({
                    features: features,
                }),
            });

            map.addLayer(vectorLayer);
        }
    }

    createMap(forcedId = null) {
        const googleLayer = new GoogleLayer({
            mapTypeId: 'satellite',
        });

        let map;
        if (this.state.map != null) {
            this.inset_map_ref.current.innerHTML = '';
        }
        map = new Map({
            interactions: DefaultInteractions().extend([
                new DragRotateAndZoom(),
            ]),
            target: this.inset_map_ref.current,
            layers: [googleLayer],
            controls: DefaultControls().extend([
                new ZoomSlider(),
                new ScaleLine(),
            ]),
            view: new View({
                projection: 'EPSG:900913',
                zoom: this.state.zoom,
            }),
        });

        let olGM = new OLGoogleMaps({ map }); // map is the ol.Map instance
        olGM.activate();

        this.addBoundaryLayer(map);
        this.addLocationLayer(map);

        this.setState({ map });
    }

    zoomToFeature(forcedId = null) {
        const fid = forcedId == null ? this.state.fid : forcedId;
        const cql_filter = `fid=${fid}`;
        const geoserverUrl = process.env.REACT_APP_GOSERVER_URL;
        const serverUrl = `${geoserverUrl}/wfs?service=wfs&version=1.1.0&request=GetFeature&typename=thl:bbox&cql_filter=${cql_filter}&projection=EPSG:4326&SRS=EPSG:4326&outputFormat=json`;

        fetch(serverUrl)
            .then((res) => res.json())
            .then((result) => {
                if (
                    typeof result.bbox === 'undefined' ||
                    result.bbox.length < 4
                ) {
                    console.warn(
                        `No or improper bounding box data from geoserver: \n${serverUrl}`
                    );
                    return;
                    // TODO: Display a "Can't load map" message if this works
                }

                //because we are using WFS V1.1 we need to flip the coordinates
                const bbox = [
                    result.bbox[1],
                    result.bbox[0],
                    result.bbox[3],
                    result.bbox[2],
                ];
                let ext = transformExtent(
                    bbox,
                    getProjection('EPSG:4326'),
                    getProjection('EPSG:900913')
                );
                const { map } = this.state;
                map.getView().fit(ext, {
                    size: [this.state.height, this.state.width],
                    padding: [1, 1, 1, 1],
                    constraintResolution: false,
                });
                this.setState({ map });
            })
            .catch((err) => {
                console.trace('Map loading error: ' + err);
                this.handleBuildMapFailure();
            });
    }

    handleBuildMapFailure() {
        const container = document.getElementById('places-map-container');
        if (container) {
            container.classList.remove('map');
            container.classList.add('nomap');
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        return (
            <div id="places-map-container" className="map">
                <div id="places-map-error">
                    The map for this location could not be loaded!
                </div>
                <div
                    id="places-map-div"
                    tabIndex="1"
                    ref={this.inset_map_ref}
                ></div>
            </div>
        );
    }
}

export default KmapsMap;
