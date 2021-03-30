class MapContainer extends React.Component {
    state = {
        showRadiusCircle: false,
    };

    componentDidUpdate(prevProps) {
        if (prevProps.lat !== this.props.lat || prevProps.lon !== this.props.lon
            || (prevProps.isStaleMap !== this.props.isStaleMap && this.props.isStaleMap)
        ) {
            if (!RESULT_MAP) {
                console.log("New map");
                RESULT_MAP = buildMap(this.props.lat, this.props.lon, this.props.zoom);
                RESULT_MAP.on('zoomend', () => this.mapChanged());
                RESULT_MAP.on('dragend', () => this.mapChanged());
            }
            RESULT_MAP.panTo(new L.LatLng(this.props.lat, this.props.lon));
            if (this.props.currentPage === 0) {
                cleanMarkers();
            }
        }

        if (this.props.filterRadius) {
            this.showOrHideRadiusCicle();
            RESULT_MAP.panTo(new L.LatLng(this.props.filterLat, this.props.filterLon));
        }

        if (prevProps.newHotels !== this.props.newHotels) {
            this.props.newHotels.forEach(h => {
                const { ty_id, coordinates } = h;
                if (coordinates) {
                    addMarker(ty_id, h.match.match_score, coordinates[0], coordinates[1], this.getMarkerPopup(h));
                }
            });
        }

        // Change map center
        if (prevProps.centerLat !== this.props.centerLat || prevProps.centerLon !== this.props.centerLon) {
            // Open marker
            RESULT_MAP_MARKERS[this.props.selectedHotelId] && RESULT_MAP_MARKERS[this.props.selectedHotelId].openPopup();
            // Center map to hotel
            RESULT_MAP.panTo(new L.LatLng(this.props.centerLat, this.props.centerLon));
        }
    }

    mapChanged = () => {
        var coordinates = {
            lat: RESULT_MAP.getCenter().lat,
            lon: RESULT_MAP.getCenter().lng,
            radius: zoomToRadius(RESULT_MAP.getZoom()),
            zoom: RESULT_MAP.getZoom(),
        };
        this.props.onMapMoved(coordinates);
    }

    getMarkerPopup(hotel) {
        const { name, score, score_description} = hotel;
        return `<b>${name}</b>
            <div class="trustscore score-marker">
            <div class="score">${score}</div>
            <div class="details">
              <div class="label">${score_description}</div>
            </div>
          </div>
        `;
    }

    showOrHideRadiusCicle = () => {
        if (this.state.showRadiusCircle) {
            addCenterMarker(this.props.filterLat, this.props.filterLon, this.props.filterRadius);
        } else {
            removeCenterMarker();
        }
    }

    handleRadiusCicleChange = (e) => {
        console.log(e);
        this.setState({
            showRadiusCircle: !this.state.showRadiusCircle,
        }, () => {
            this.showOrHideRadiusCicle();
        });
    }

    render() {
        return (
            <div className={this.props.isMapFloating ? 'map-container-float' : 'map-container'}>
                <section className="search-map" id="search-map"></section>
                <div className="score-gradient">
                Preference match: <img src="img/score-gradient.png" />
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            defaultChecked={this.state.showRadiusCircle}
                            onClick={this.handleRadiusCicleChange}
                        /> Show radius circle
                    </label>
                </div>
            </div>
        )
    }
}
