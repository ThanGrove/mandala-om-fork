import React from 'react';
// Start Openlayers imports
import { Map, View } from 'ol';
import { KML, GeoJSON, XYZ } from 'ol/format';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import {
    Vector as VectorSource,
    OSM as OSMSource,
    XYZ as XYZSource,
    TileWMS as TileWMSSource,
} from 'ol/source';
import {
    Select as SelectInteraction,
    defaults as DefaultInteractions,
    DragAndDrop,
    DragRotateAndZoom,
    MouseWheelZoom,
} from 'ol/interaction';
import {
    Attribution,
    ScaleLine,
    ZoomSlider,
    Zoom,
    Rotate,
    MousePosition,
    OverviewMap,
    defaults as DefaultControls,
} from 'ol/control';
import {
    Style,
    Fill as FillStyle,
    RegularShape as RegularShapeStyle,
    Stroke as StrokeStyle,
} from 'ol/style';

import {
    Projection,
    get as getProjection,
    transformExtent,
    Extent,
} from 'ol/proj';

// End Openlayers imports
import GoogleLayer from 'olgm/layer/Google.js';
import { defaults } from 'olgm/interaction.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';

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
            var map = this.buildMap(nextProps.fid);
            this.zoomToFeature(map, nextProps.fid);
        }
    }

    componentWillMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    buildMap(forcedId = null) {
        this.setState({ element: this.inset_map_ref.current });
        const geoserverUrl = process.env.REACT_APP_GOSERVER_URL;
        var map = this.createMap(forcedId);
        return map;
    }

    componentDidMount() {
        var map = this.buildMap();
        this.zoomToFeature(map);
    }

    createMap(forcedId = null) {
        const googleLayer = new GoogleLayer({
            mapTypeId: 'satellite',
        });
        const layer_name = this.state.language_layer;
        const fid = forcedId == null ? this.state.fid : forcedId;
        const geoserverUrl = process.env.REACT_APP_GOSERVER_URL;
        const featureLayer = new TileLayer({
            source: new TileWMSSource({
                url: `${geoserverUrl}/wms`,
                params: {
                    LAYERS:
                        'thl:' +
                        layer_name +
                        '_poly,thl:' +
                        layer_name +
                        '_pt,thl:' +
                        layer_name +
                        '_line',
                    STYLES: 'thl_noscale,thl_noscale,thl_noscale',
                    TILED: true,
                    CQL_FILTER: `fid=${fid};fid=${fid};fid=${fid}`,
                },
                projection: 'EPSG:900913',
            }),
        });
        var map = this.state.map;
        if (this.state.map != null) {
            this.inset_map_ref.current.innerHTML = '';
        }
        map = new Map({
            interactions: DefaultInteractions().extend([
                new DragRotateAndZoom(),
            ]),
            target: this.inset_map_ref.current,
            layers: [googleLayer, featureLayer],
            controls: DefaultControls().extend([
                new ZoomSlider(),
                new ScaleLine(),
            ]),
            view: new View({
                projection: 'EPSG:900913',
                zoom: this.state.zoom,
            }),
        });
        var olGM = new OLGoogleMaps({ map: map }); // map is the ol.Map instance
        olGM.activate();
        this.setState({ map: map });
        return map;
    }

    zoomToFeature(map, forcedId = null) {
        const fid = forcedId == null ? this.state.fid : forcedId;
        const cql_filter = `fid=${fid}`;
        const geoserverUrl = process.env.REACT_APP_GOSERVER_URL;
        const serverUrl =
            geoserverUrl +
            '/wfs?service=wfs&version=1.1.0&request=GetFeature&typename=thl:bbox&cql_filter=' +
            cql_filter +
            '&projection=EPSG:4326&SRS=EPSG:4326&outputFormat=json';
        fetch(serverUrl)
            .then((res) => res.json())
            .then((result) => {
                if (
                    typeof result.bbox === 'undefined' ||
                    result.bbox.length < 4
                ) {
                    console.warn(
                        'No or improper bounding box data from geoserver: \n' +
                            serverUrl
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
                var ext = transformExtent(
                    bbox,
                    getProjection('EPSG:4326'),
                    getProjection('EPSG:900913')
                );
                map.getView().fit(ext, {
                    size: [this.state.height, this.state.width],
                    padding: [1, 1, 1, 1],
                    constraintResolution: false,
                });
            })
            .catch((myerr) => {
                console.log('Map data did not load!', myerr);
                const errel = document.getElementById('places-map-error');
                errel.style.display = 'block';
                const mapel = document.getElementById('places-map-div');
                mapel.style.display = 'none';
            });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        const style = {
            width: '100%',
            height: '80vh',
            backgroundColor: '#cccccc',
        };
        const errStyle = {
            display: 'none',
            width: '100%',
            height: '70vh',
            backgroundColor: 'lightgray',
            color: 'red',
            fontWeight: 'bold',
            paddingTop: '25%',
            textAlign: 'center',
        };
        return (
            <div>
                <div id="places-map-error" style={errStyle}>
                    Map could not be loaded!
                </div>
                <div
                    id="places-map-div"
                    tabIndex="1"
                    style={style}
                    ref={this.inset_map_ref}
                ></div>
            </div>
        );
    }
}

export default KmapsMap;
