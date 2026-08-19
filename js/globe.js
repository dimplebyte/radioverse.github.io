/* =========================================================
   RADIO GLOBE
   globe.js
   3D interactive globe
   Made by Dimple Khangarot
========================================================= */


/* =========================================================
   01. GLOBE STATE
========================================================= */

const GlobeState = {

    initialized: false,

    globe: null,

    container: null,

    stationMarkers: [],

    stars: [],

    currentZoom: 1,

    currentLatitude: 20,

    currentLongitude: 78,

    currentLevel: "world",

    animationFrame: null,

    autoRotate: true,

    isDragging: false,

    lastPointerX: 0,

    lastPointerY: 0

};


/* =========================================================
   02. INITIALIZE GLOBE
========================================================= */

function initializeGlobe() {

    if (GlobeState.initialized) {

        radioLog(
            "Globe already initialized."
        );

        return GlobeState.globe;

    }


    const container =
        document.querySelector(
            "#globe-container"
        ) ||
        document.querySelector(
            ".globe-container"
        );


    if (!container) {

        console.error(
            "Globe container not found."
        );

        return null;

    }


    GlobeState.container =
        container;


    /*
       We use a single visual globe.
       The exact rendering engine can be
       connected here without creating
       multiple Earth objects.
    */

    createGlobeCanvas();


    createStarField();


    createGlobeAtmosphere();


    setupGlobeInteraction();


    GlobeState.initialized =
        true;


    radioLog(
        "RADIO GLOBE initialized."
    );


    return GlobeState.globe;

}


/* =========================================================
   03. CREATE SINGLE GLOBE CANVAS
========================================================= */

function createGlobeCanvas() {

    const container =
        GlobeState.container;


    let canvas =
        container.querySelector(
            "canvas"
        );


    if (!canvas) {

        canvas =
            document.createElement(
                "canvas"
            );

        canvas.className =
            "radio-globe-canvas";

        container.appendChild(
            canvas
        );

    }


    const context =
        canvas.getContext(
            "2d"
        );


    GlobeState.globe = {

        canvas,

        context,

        radius: 0,

        centerX: 0,

        centerY: 0,

        rotationX: 20,

        rotationY: 0

    };


    resizeGlobe();


    window.addEventListener(
        "resize",
        resizeGlobe
    );


    drawGlobe();

}


/* =========================================================
   04. RESIZE GLOBE
========================================================= */

function resizeGlobe() {

    if (
        !GlobeState.globe ||
        !GlobeState.container
    ) {

        return;

    }


    const canvas =
        GlobeState.globe.canvas;


    const rect =
        GlobeState.container
            .getBoundingClientRect();


    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        rect.width * dpr;


    canvas.height =
        rect.height * dpr;


    canvas.style.width =
        `${rect.width}px`;


    canvas.style.height =
        `${rect.height}px`;


    const ctx =
        GlobeState.globe.context;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    GlobeState.globe.centerX =
        rect.width / 2;


    GlobeState.globe.centerY =
        rect.height / 2;


    GlobeState.globe.radius =
        Math.min(
            rect.width,
            rect.height
        ) * 0.32;


    drawGlobe();

}


/* =========================================================
   05. DRAW GLOBE
========================================================= */

function drawGlobe() {

    if (!GlobeState.globe) {
        return;
    }


    const globe =
        GlobeState.globe;


    const ctx =
        globe.context;


    const canvas =
        globe.canvas;


    const width =
        canvas.clientWidth;


    const height =
        canvas.clientHeight;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawStars(
        ctx,
        width,
        height
    );


    drawAtmosphere(
        ctx,
        globe.centerX,
        globe.centerY,
        globe.radius
    );


    drawEarthSphere(
        ctx,
        globe.centerX,
        globe.centerY,
        globe.radius
    );


    drawMapGrid(
        ctx,
        globe.centerX,
        globe.centerY,
        globe.radius
    );


    drawStationDots(
        ctx,
        globe.centerX,
        globe.centerY,
        globe.radius
    );


    drawGlobeGlow(
        ctx,
        globe.centerX,
        globe.centerY,
        globe.radius
    );

}


/* =========================================================
   06. EARTH SPHERE
========================================================= */

function drawEarthSphere(
    ctx,
    x,
    y,
    radius
) {

    const gradient =
        ctx.createRadialGradient(
            x - radius * 0.35,
            y - radius * 0.4,
            radius * 0.05,
            x,
            y,
            radius
        );


    gradient.addColorStop(
        0,
        "#173c73"
    );


    gradient.addColorStop(
        0.45,
        "#102c59"
    );


    gradient.addColorStop(
        0.78,
        "#071a38"
    );


    gradient.addColorStop(
        1,
        "#020816"
    );


    ctx.beginPath();


    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        gradient;


    ctx.fill();


    /*
       Outer edge
    */

    ctx.beginPath();


    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );


    ctx.strokeStyle =
        "rgba(160,220,255,.45)";


    ctx.lineWidth = 1.5;


    ctx.stroke();

}


/* =========================================================
   07. MAP GRID
========================================================= */

function drawMapGrid(
    ctx,
    x,
    y,
    radius
) {

    ctx.save();


    ctx.beginPath();


    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );


    ctx.clip();


    /*
       Latitude lines
    */

    for (
        let lat = -60;
        lat <= 60;
        lat += 20
    ) {

        const curve =
            Math.cos(
                lat *
                Math.PI /
                180
            );


        ctx.beginPath();


        ctx.ellipse(
            x,
            y,
            radius *
                Math.max(
                    curve,
                    0.12
                ),
            radius *
                0.18,
            0,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "rgba(130,205,255,.10)";


        ctx.lineWidth =
            0.7;


        ctx.stroke();

    }


    /*
       Longitude lines
    */

    for (
        let lon = -160;
        lon <= 160;
        lon += 20
    ) {

        const curve =
            Math.cos(
                lon *
                Math.PI /
                180
            );


        ctx.beginPath();


        ctx.ellipse(
            x,
            y,
            radius *
                Math.max(
                    Math.abs(curve),
                    0.08
                ),
            radius,
            0,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "rgba(130,205,255,.08)";


        ctx.lineWidth =
            0.7;


        ctx.stroke();

    }


    ctx.restore();

}


/* =========================================================
   08. ATMOSPHERE
========================================================= */

function drawAtmosphere(
    ctx,
    x,
    y,
    radius
) {

    const glow =
        ctx.createRadialGradient(
            x,
            y,
            radius * 0.82,
            x,
            y,
            radius * 1.18
        );


    glow.addColorStop(
        0,
        "rgba(90,190,255,0)"
    );


    glow.addColorStop(
        0.75,
        "rgba(90,190,255,.10)"
    );


    glow.addColorStop(
        1,
        "rgba(255,130,220,.32)"
    );


    ctx.beginPath();


    ctx.arc(
        x,
        y,
        radius * 1.15,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        glow;


    ctx.fill();

}


/* =========================================================
   09. GLOBE GLOW
========================================================= */

function drawGlobeGlow(
    ctx,
    x,
    y,
    radius
) {

    ctx.save();


    ctx.shadowBlur =
        35;


    ctx.shadowColor =
        "rgba(100,210,255,.35)";


    ctx.beginPath();


    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );


    ctx.strokeStyle =
        "rgba(160,225,255,.25)";


    ctx.lineWidth =
        2;


    ctx.stroke();


    ctx.restore();

}


/* =========================================================
   10. STAR FIELD
========================================================= */

function createStarField() {

    GlobeState.stars = [];


    const count =
        window.innerWidth < 600
            ? 90
            : 180;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        GlobeState.stars.push({

            x:
                Math.random(),

            y:
                Math.random(),

            size:
                Math.random() *
                1.8 +
                0.3,

            opacity:
                Math.random() *
                0.7 +
                0.2,

            phase:
                Math.random() *
                Math.PI *
                2

        });

    }

}


/* =========================================================
   11. DRAW STARS
========================================================= */

function drawStars(
    ctx,
    width,
    height
) {

    const time =
        Date.now() / 1000;


    GlobeState.stars.forEach(
        star => {

            const twinkle =
                (
                    Math.sin(
                        time * 1.5 +
                        star.phase
                    ) + 1
                ) / 2;


            ctx.beginPath();


            ctx.arc(
                star.x * width,
                star.y * height,
                star.size,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(255,255,255,${
                    star.opacity *
                    (0.55 + twinkle * 0.45)
                })`;


            ctx.fill();

        }
    );

}


/* =========================================================
   12. CREATE ATMOSPHERE LAYER
========================================================= */

function createGlobeAtmosphere() {

    if (
        !GlobeState.container
    ) {

        return;

    }


    GlobeState.container.classList.add(
        "globe-ready"
    );

}


/* =========================================================
   13. STATION DOTS
========================================================= */

function drawStationDots(
    ctx,
    centerX,
    centerY,
    radius
) {

    const stations =
        StationStore.currentResults
            .length
            ? StationStore.currentResults
            : StationStore.all;


    stations.forEach(
        station => {

            if (
                !Number.isFinite(
                    station.latitude
                ) ||
                !Number.isFinite(
                    station.longitude
                )
            ) {

                return;

            }


            const position =
                projectCoordinates(
                    station.latitude,
                    station.longitude,
                    centerX,
                    centerY,
                    radius
                );


            if (!position.visible) {
                return;
            }


            /*
               Outer glow
            */

            ctx.beginPath();


            ctx.arc(
                position.x,
                position.y,
                7,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "rgba(255,120,205,.08)";


            ctx.fill();


            /*
               Main glowing dot
            */

            ctx.beginPath();


            ctx.arc(
                position.x,
                position.y,
                2.4,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                isRajasthanStation(station)
                    ? "#ff82c8"
                    : "#7de7ff";


            ctx.shadowBlur =
                12;


            ctx.shadowColor =
                isRajasthanStation(station)
                    ? "#ff82c8"
                    : "#7de7ff";


            ctx.fill();


            ctx.shadowBlur =
                0;

        }
    );

}


/* =========================================================
   14. PROJECT LAT/LON
========================================================= */

function projectCoordinates(
    latitude,
    longitude,
    centerX,
    centerY,
    radius
) {

    const lat =
        latitude *
        Math.PI /
        180;


    const lon =
        longitude *
        Math.PI /
        180;


    /*
       Current globe rotation
    */

    const rotation =
        GlobeState.globe
            ? GlobeState.globe.rotationY
            : 0;


    const rotatedLon =
        lon +
        rotation;


    const x3d =
        Math.cos(lat) *
        Math.sin(rotatedLon);


    const y3d =
        Math.sin(lat);


    const z3d =
        Math.cos(lat) *
        Math.cos(rotatedLon);


    /*
       Only show the visible side
    */

    const visible =
        z3d > 0;


    return {

        x:
            centerX +
            radius *
            x3d,

        y:
            centerY -
            radius *
            y3d,

        visible

    };

}


/* =========================================================
   15. SET GLOBE LOCATION
========================================================= */

function setGlobeLocation(
    latitude,
    longitude,
    level = "country"
) {

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        return;

    }


    GlobeState.currentLatitude =
        latitude;


    GlobeState.currentLongitude =
        longitude;


    GlobeState.currentLevel =
        level;


    /*
       Rotate globe toward target.
    */

    if (
        GlobeState.globe
    ) {

        GlobeState.globe.rotationY =
            -longitude *
            Math.PI /
            180;

    }


    drawGlobe();


    dispatchRadioEvent(
        RADIO_EVENTS.locationChanged,
        {

            latitude,

            longitude,

            level

        }
    );

}


/* =========================================================
   16. FOCUS INDIA
========================================================= */

function focusIndia() {

    setGlobeLocation(
        22.5,
        78.9,
        "country"
    );

}


/* =========================================================
   17. FOCUS RAJASTHAN
========================================================= */

function focusRajasthan() {

    setGlobeLocation(
        27.0,
        74.2,
        "state"
    );

}


/* =========================================================
   18. FOCUS DISTRICT
========================================================= */

function focusDistrict(
    latitude,
    longitude
) {

    setGlobeLocation(
        latitude,
        longitude,
        "district"
    );

}


/* =========================================================
   19. ZOOM
========================================================= */

function zoomGlobe(
    amount
) {

    GlobeState.currentZoom =
        Math.max(
            RADIO_GLOBE_CONFIG.globe.minZoom,
            Math.min(
                RADIO_GLOBE_CONFIG.globe.maxZoom,
                GlobeState.currentZoom +
                amount
            )
        );


    if (
        GlobeState.globe
    ) {

        GlobeState.globe.radius =
            Math.min(
                GlobeState.container
                    .clientWidth,

                GlobeState.container
                    .clientHeight

            ) *
            0.32 *
            GlobeState.currentZoom;

    }


    drawGlobe();

}


/* =========================================================
   20. POINTER INTERACTION
========================================================= */

function setupGlobeInteraction() {

    const canvas =
        GlobeState.globe.canvas;


    canvas.addEventListener(
        "pointerdown",
        event => {

            GlobeState.isDragging =
                true;


            GlobeState.autoRotate =
                false;


            GlobeState.lastPointerX =
                event.clientX;


            GlobeState.lastPointerY =
                event.clientY;


            canvas.setPointerCapture(
                event.pointerId
            );

        }
    );


    canvas.addEventListener(
        "pointermove",
        event => {

            if (
                !GlobeState.isDragging
            ) {

                return;

            }


            const deltaX =
                event.clientX -
                GlobeState.lastPointerX;


            const deltaY =
                event.clientY -
                GlobeState.lastPointerY;


            GlobeState.lastPointerX =
                event.clientX;


            GlobeState.lastPointerY =
                event.clientY;


            if (
                GlobeState.globe
            ) {

                GlobeState.globe.rotationY +=
                    deltaX * 0.008;


                GlobeState.globe.rotationX +=
                    deltaY * 0.004;

            }


            drawGlobe();

        }
    );


    canvas.addEventListener(
        "pointerup",
        event => {

            GlobeState.isDragging =
                false;


            canvas.releasePointerCapture(
                event.pointerId
            );

        }
    );


    canvas.addEventListener(
        "pointercancel",
        () => {

            GlobeState.isDragging =
                false;

        }
    );


    canvas.addEventListener(
        "wheel",
        event => {

            event.preventDefault();


            zoomGlobe(
                event.deltaY > 0
                    ? -0.12
                    : 0.12
            );

        },
        {
            passive: false
        }
    );

}


/* =========================================================
   21. AUTO ROTATION
========================================================= */

function animateGlobe() {

    if (
        !GlobeState.globe
    ) {

        return;

    }


    if (
        GlobeState.autoRotate &&
        !GlobeState.isDragging
    ) {

        GlobeState.globe.rotationY +=
            RADIO_GLOBE_CONFIG
                .globe
                .rotationSpeed *
            0.001;

    }


    drawGlobe();


    GlobeState.animationFrame =
        requestAnimationFrame(
            animateGlobe
        );

}


/* =========================================================
   22. START ROTATION
========================================================= */

function startGlobeRotation() {

    GlobeState.autoRotate =
        true;


    if (
        !GlobeState.animationFrame
    ) {

        animateGlobe();

    }

}


/* =========================================================
   23. STOP ROTATION
===========================================
