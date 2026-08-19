/* =========================================================
   RADIO GLOBE
   config.js
   Global configuration
   Made by Dimple Khangarot
========================================================= */


/* =========================================================
   01. APP CONFIG
========================================================= */

const RADIO_GLOBE_CONFIG = {

    /* Website information */

    appName: "RADIO GLOBE",

    author: "Dimple Khangarot",

    version: "1.0.0",


    /* =====================================================
       Globe settings
    ===================================================== */

    globe: {

        autoRotate: true,

        rotationSpeed: 0.15,

        enableZoom: true,

        enableDrag: true,

        enableTouch: true,

        minZoom: 0.75,

        maxZoom: 4.5

    },


    /* =====================================================
       Map levels
    ===================================================== */

    mapLevels: {

        world: "world",

        country: "country",

        state: "state",

        district: "district"

    },


    /* =====================================================
       Default location
    ===================================================== */

    defaultLocation: {

        country: "World",

        countryCode: "",

        state: "",

        district: ""

    },


    /* =====================================================
       Special Rajasthan mode
    ===================================================== */

    rajasthan: {

        enabled: true,

        country: "India",

        state: "Rajasthan",

        highlight: true,

        showDistricts: true,

        showStationDots: true

    },


    /* =====================================================
       Radio API
       
       IMPORTANT:
       API endpoints will be connected later.
       Do NOT put private API keys here.
    ===================================================== */

    radio: {

        provider: "Radio Browser",

        apiBase:

            "https://de1.api.radio-browser.info/json",

        stationSearchEndpoint:

            "/stations/search",

        stationByCountryEndpoint:

            "/stations/bycountry",

        stationByStateEndpoint:

            "/stations/bystate",

        stationByLanguageEndpoint:

            "/stations/bylanguage",

        stationByTagEndpoint:

            "/stations/bytag",

        stationByNameEndpoint:

            "/stations/byname",


        /* Maximum stations loaded at once */

        limit: 100

    },


    /* =====================================================
       Player settings
    ===================================================== */

    player: {

        autoplay: false,

        defaultVolume: 0.75,

        rememberVolume: true,

        enableLike: true,

        enablePreviousNext: true,

        enablePreview: true

    },


    /* =====================================================
       Search settings
    ===================================================== */

    search: {

        enabled: true,

        minimumCharacters: 2,

        maximumResults: 25,

        searchDelay: 350

    },


    /* =====================================================
       Favorites
    ===================================================== */

    favorites: {

        enabled: true,

        storageKey:
            "radioGlobeFavorites"

    },


    /* =====================================================
       Intro animation
    ===================================================== */

    intro: {

        enabled: true,

        duration: 4200,

        allowSkip: true

    },


    /* =====================================================
       UI
    ===================================================== */

    ui: {

        theme: "cosmic-pink",

        showStars: true,

        showGlowDots: true,

        showStationLabels: true,

        showCountryNames: true,

        showStateNames: true,

        showDistrictNames: true

    }

};


/* =========================================================
   02. FREE GLOBAL CONSTANTS
========================================================= */

const RADIO_GLOBE = RADIO_GLOBE_CONFIG;


/* =========================================================
   03. LOCAL STORAGE KEYS
========================================================= */

const STORAGE_KEYS = {

    favorites:
        "radioGlobeFavorites",

    volume:
        "radioGlobeVolume",

    lastStation:
        "radioGlobeLastStation",

    introSeen:
        "radioGlobeIntroSeen"

};


/* =========================================================
   04. DEFAULT PLAYER STATE
========================================================= */

const DEFAULT_PLAYER_STATE = {

    isPlaying: false,

    currentStation: null,

    currentIndex: -1,

    volume:
        RADIO_GLOBE_CONFIG.player.defaultVolume,

    liked: false

};


/* =========================================================
   05. APP EVENTS
========================================================= */

const RADIO_EVENTS = {

    stationSelected:
        "radio:station-selected",

    stationPlaying:
        "radio:station-playing",

    stationPaused:
        "radio:station-paused",

    stationError:
        "radio:station-error",

    favoritesChanged:
        "radio:favorites-changed",

    locationChanged:
        "radio:location-changed"

};


/* =========================================================
   06. DEBUG MODE
========================================================= */

const DEBUG_MODE = true;


/* =========================================================
   07. DEBUG HELPER
========================================================= */

function radioLog(...messages) {

    if (!DEBUG_MODE) return;

    console.log(
        "%c[RADIO GLOBE]",
        "color:#ffacd4;font-weight:bold;",
        ...messages
    );

}


/* =========================================================
   08. CONFIG READY
========================================================= */

radioLog(
    "Configuration loaded successfully."
);

radioLog(
    "Version:",
    RADIO_GLOBE_CONFIG.version
);

radioLog(
    "Radio provider:",
    RADIO_GLOBE_CONFIG.radio.provider
);
