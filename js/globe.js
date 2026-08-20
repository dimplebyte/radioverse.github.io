/* =========================================================
   RADIOVERSE — INTERACTIVE 3D RADIO GLOBE
   FINAL GLOBE ENGINE
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const CONFIG = {
        globeLibrary:
            "https://cdn.jsdelivr.net/npm/globe.gl@2.45.5/dist/globe.gl.min.js",

        topoJson:
            "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",

        topoJsonLibrary:
            "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js",

        backgroundColor: "rgba(0,0,0,0)"
    };


    /* =====================================================
       STATE
    ===================================================== */

    let globe = null;

    let globeContainer = null;

    let stations = [];

    let countryFeatures = [];

    let dependenciesLoaded = false;


    /* =====================================================
       LOAD EXTERNAL SCRIPT
    ===================================================== */

    function loadScript(src) {

        return new Promise((resolve, reject) => {

            const existing =
                document.querySelector(
                    `script[src="${src}"]`
                );

            if (existing) {

                if (
                    existing.dataset.loaded === "true"
                ) {
                    resolve();
                    return;
                }

                existing.addEventListener(
                    "load",
                    resolve,
                    { once: true }
                );

                existing.addEventListener(
                    "error",
                    reject,
                    { once: true }
                );

                return;
            }

            const script =
                document.createElement("script");

            script.src = src;

            script.async = true;

            script.onload = () => {

                script.dataset.loaded = "true";

                resolve();
            };

            script.onerror = () => {

                reject(
                    new Error(
                        `Unable to load ${src}`
                    )
                );
            };

            document.head.appendChild(
                script
            );

        });

    }


    /* =====================================================
       LOAD GLOBE DEPENDENCIES
    ===================================================== */

    async function loadDependencies() {

        if (dependenciesLoaded) {
            return true;
        }

        try {

            await loadScript(
                CONFIG.topoJsonLibrary
            );

            await loadScript(
                CONFIG.globeLibrary
            );

            dependenciesLoaded = true;

            return true;

        } catch (error) {

            console.error(
                "Globe dependencies failed:",
                error
            );

            showGlobeError(
                "Unable to load the 3D globe."
            );

            return false;
        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initializeGlobe(
        stationData = []
    ) {

        globeContainer =
            document.getElementById("globe");

        if (!globeContainer) {

            console.warn(
                "RadioVerse globe container not found."
            );

            return;
        }

        stations =
            Array.isArray(stationData)
                ? stationData
                : [];

        showLoading();

        const loaded =
            await loadDependencies();

        if (!loaded) {
            return;
        }

        try {

            await loadCountryData();

            createGlobe();

            renderStations();

            setupGlobeControls();

            hideLoading();

            console.log(
                `RadioVerse globe loaded with ${stations.length} stations.`
            );

        } catch (error) {

            console.error(
                "Globe initialization error:",
                error
            );

            showGlobeError(
                "The globe could not be initialized."
            );

        }

    }


    /* =====================================================
       COUNTRY DATA
    ===================================================== */

    async function loadCountryData() {

        if (
            !window.topojson ||
            typeof window.topojson.feature !==
                "function"
        ) {

            throw new Error(
                "TopoJSON library unavailable."
            );
        }

        const response =
            await fetch(
                CONFIG.topoJson
            );

        if (!response.ok) {

            throw new Error(
                `World map request failed: ${response.status}`
            );
        }

        const world =
            await response.json();

        countryFeatures =
            window.topojson.feature(
                world,
                world.objects.countries
            ).features;

    }


    /* =====================================================
       CREATE GLOBE
    ===================================================== */

    function createGlobe() {

        if (!window.Globe) {

            throw new Error(
                "Globe.gl is unavailable."
            );
        }

        globeContainer.innerHTML = "";

        const width =
            globeContainer.clientWidth ||
            window.innerWidth;

        const height =
            globeContainer.clientHeight ||
            Math.min(
                window.innerHeight * 0.65,
                700
            );


        globe =
            window.Globe()(globeContainer)

                /* -----------------------------------------
                   SIZE
                ----------------------------------------- */

                .width(width)

                .height(height)

                /* -----------------------------------------
                   BACKGROUND
                ----------------------------------------- */

                .backgroundColor(
                    CONFIG.backgroundColor
                )

                /* -----------------------------------------
                   EARTH
                ----------------------------------------- */

                .globeImageUrl(
                    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                )

                .bumpImageUrl(
                    "https://unpkg.com/three-globe/example/img/earth-topology.png"
                )

                .showAtmosphere(true)

                .atmosphereColor(
                    "#45cfff"
                )

                .atmosphereAltitude(
                    0.16
                )

                /* -----------------------------------------
                   COUNTRY BORDERS
                ----------------------------------------- */

                .polygonsData(
                    countryFeatures
                )

                .polygonCapColor(
                    () => "rgba(15, 80, 160, 0.05)"
                )

                .polygonSideColor(
                    () => "rgba(50, 180, 255, 0.12)"
                )

                .polygonStrokeColor(
                    () => "rgba(100, 220, 255, 0.65)"
                )

                .polygonAltitude(
                    0.006
                )

                .polygonLabel(
                    feature => {

                        const name =
                            feature.properties &&
                            (
                                feature.properties.name ||
                                feature.properties.NAME
                            );

                        return `
                            <div class="country-tooltip">
                                ${name || "Country"}
                            </div>
                        `;
                    }
                )

                /* -----------------------------------------
                   STATION POINTS
                ----------------------------------------- */

                .pointsData(
                    stationsWithCoordinates()
                )

                .pointLat(
                    station =>
                        Number(station.latitude)
                )

                .pointLng(
                    station =>
                        Number(station.longitude)
                )

                .pointAltitude(
                    0.025
                )

                .pointRadius(
                    0.32
                )

                .pointColor(
                    () => "#66e8ff"
                )

                .pointResolution(
                    12
                )

                .pointLabel(
                    station => {

                        const name =
                            escapeHtml(
                                station.name ||
                                "Radio Station"
                            );

                        const city =
                            escapeHtml(
                                station.city ||
                                ""
                            );

                        const country =
                            escapeHtml(
                                station.country ||
                                ""
                            );

                        return `
                            <div class="station-tooltip">
                                <strong>${name}</strong>
                                <span>
                                    ${city}
                                    ${city && country ? ", " : ""}
                                    ${country}
                                </span>
                            </div>
                        `;
                    }
                )

                /* -----------------------------------------
                   STATION CLICK
                ----------------------------------------- */

                .onPointClick(
                    station => {

                        selectStation(
                            station
                        );

                    }
                );


        /* =================================================
           INITIAL CAMERA
        ================================================= */

        globe.pointOfView(
            {
                lat: 20,
                lng: 75,
                altitude: 2.15
            },
            1200
        );


        /* =================================================
           CONTROLS
        ================================================= */

        const controls =
            globe.controls();

        if (controls) {

            controls.enableZoom =
                true;

            controls.enablePan =
                false;

            controls.minDistance =
                180;

            controls.maxDistance =
                600;

            controls.autoRotate =
                true;

            controls.autoRotateSpeed =
                0.35;

            controls.enableDamping =
                true;

            controls.dampingFactor =
                0.08;

        }


        /* =================================================
           RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            resizeGlobe
        );

    }


    /* =====================================================
       STATIONS WITH VALID COORDINATES
    ===================================================== */

    function stationsWithCoordinates() {

        return stations.filter(
            station => {

                const lat =
                    Number(
                        station.latitude
                    );

                const lng =
                    Number(
                        station.longitude
                    );

                return (
                    Number.isFinite(lat) &&
                    Number.isFinite(lng) &&
                    lat >= -90 &&
                    lat <= 90 &&
                    lng >= -180 &&
                    lng <= 180
                );

            }
        );

    }


    /* =====================================================
       RENDER / UPDATE STATIONS
    ===================================================== */

    function renderStations() {

        if (!globe) {
            return;
        }

        globe.pointsData(
            stationsWithCoordinates()
        );

    }


    /* =====================================================
       UPDATE STATIONS FROM API
    ===================================================== */

    function updateGlobeStations(
        stationData = []
    ) {

        stations =
            Array.isArray(stationData)
                ? stationData
                : [];

        renderStations();

    }


    /* =====================================================
       SELECT STATION
    ===================================================== */

    function selectStation(station) {

        if (!station) {
            return;
        }

        if (
            window.RadioVerse &&
            typeof window.RadioVerse
                .selectStation === "function"
        ) {

            window.RadioVerse.selectStation(
                station
            );

            return;
        }

        console.log(
            "Selected station:",
            station
        );

    }


    /* =====================================================
       ZOOM IN
    ===================================================== */

    function zoomIn() {

        if (!globe) {
            return;
        }

        const camera =
            globe.camera();

        const current =
            globe.pointOfView();

        const nextAltitude =
            Math.max(
                current.altitude * 0.75,
                0.8
            );

        globe.pointOfView(
            {
                lat: current.lat,
                lng: current.lng,
                altitude: nextAltitude
            },
            500
        );

    }


    /* =====================================================
       ZOOM OUT
    ===================================================== */

    function zoomOut() {

        if (!globe) {
            return;
        }

        const current =
            globe.pointOfView();

        const nextAltitude =
            Math.min(
                current.altitude * 1.3,
                4.5
            );

        globe.pointOfView(
            {
                lat: current.lat,
                lng: current.lng,
                altitude: nextAltitude
            },
            500
        );

    }


    /* =====================================================
       RESET
    ===================================================== */

    function resetGlobe() {

        if (!globe) {
            return;
        }

        globe.pointOfView(
            {
                lat: 20,
                lng: 75,
                altitude: 2.15
            },
            1000
        );

    }


    /* =====================================================
       SETUP BUTTONS
    ===================================================== */

    function setupGlobeControls() {

        const zoomInButton =
            document.getElementById(
                "zoom-in"
            );

        const zoomOutButton =
            document.getElementById(
                "zoom-out"
            );

        const resetButton =
            document.getElementById(
                "reset-globe"
            );


        if (zoomInButton) {

            zoomInButton.onclick =
                zoomIn;

        }


        if (zoomOutButton) {

            zoomOutButton.onclick =
                zoomOut;

        }


        if (resetButton) {

            resetButton.onclick =
                resetGlobe;

        }

    }


    /* =====================================================
       RESIZE
    ===================================================== */

    function resizeGlobe() {

        if (!globe || !globeContainer) {
            return;
        }

        const width =
            globeContainer.clientWidth;

        const height =
            globeContainer.clientHeight;

        if (width > 0) {
            globe.width(width);
        }

        if (height > 0) {
            globe.height(height);
        }

    }


    /* =====================================================
       LOADING
    ===================================================== */

    function showLoading() {

        if (!globeContainer) {
            return;
        }

        globeContainer.innerHTML = `
            <div class="globe-loading">
                <div class="globe-loader"></div>
                <p>Loading World Radio...</p>
            </div>
        `;

    }


    function hideLoading() {

        const loading =
            globeContainer &&
            globeContainer.querySelector(
                ".globe-loading"
            );

        if (loading) {
            loading.remove();
        }

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showGlobeError(message) {

        if (!globeContainer) {
            return;
        }

        globeContainer.innerHTML = `
            <div class="globe-error">
                <div class="globe-error-icon">🌍</div>
                <strong>Globe unavailable</strong>
                <span>${escapeHtml(message)}</span>
            </div>
        `;

    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHtml(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       GLOBAL API
    ===================================================== */

    window.initializeGlobe =
        initializeGlobe;

    window.updateGlobeStations =
        updateGlobeStations;

    window.resetRadioGlobe =
        resetGlobe;


})();
