/* =========================================================
   RADIO GLOBE
   station-api.js
   REAL RADIO STATION API CONNECTION
   Made by Dimple Khangarot
========================================================= */


/* =========================================================
   01. API CONFIGURATION
========================================================= */

const RADIO_API = {

    baseURL:
        RADIO_GLOBE_CONFIG.radio.apiBase,

    endpoints: {

        search:
            RADIO_GLOBE_CONFIG.radio.stationSearchEndpoint,

        country:
            RADIO_GLOBE_CONFIG.radio.stationByCountryEndpoint,

        state:
            RADIO_GLOBE_CONFIG.radio.stationByStateEndpoint,

        language:
            RADIO_GLOBE_CONFIG.radio.stationByLanguageEndpoint,

        tag:
            RADIO_GLOBE_CONFIG.radio.stationByTagEndpoint,

        name:
            RADIO_GLOBE_CONFIG.radio.stationByNameEndpoint

    }

};


/* =========================================================
   02. API REQUEST HELPER
========================================================= */

async function radioApiRequest(
    endpoint,
    params = {}
) {

    const url =
        new URL(
            RADIO_API.baseURL + endpoint
        );


    Object.entries(params).forEach(
        ([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                url.searchParams.set(
                    key,
                    value
                );

            }

        }
    );


    radioLog(
        "API request:",
        url.toString()
    );


    const response =
        await fetch(
            url.toString(),
            {
                method: "GET",

                headers: {

                    "Accept":
                        "application/json"

                },

                cache: "no-store"

            }
        );


    if (!response.ok) {

        throw new Error(
            `Radio API error: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (!Array.isArray(data)) {

        throw new Error(
            "Invalid station API response."
        );

    }


    return data;

}


/* =========================================================
   03. CLEAN API RESULTS
========================================================= */

function processApiStations(
    stations
) {

    if (
        !Array.isArray(stations)
    ) {

        return [];

    }


    return stations

        .filter(
            station =>
                station &&
                (
                    station.url_resolved ||
                    station.url
                )
        )

        .map(
            station =>
                normalizeStation(
                    station
                )
        )

        .filter(
            station =>
                station &&
                hasPlayableStream(
                    station
                )
        );

}


/* =========================================================
   04. SEARCH WORLD STATIONS
========================================================= */

async function searchWorldStations(
    query,
    options = {}
) {

    const params = {

        name:
            query,

        limit:
            options.limit ||
            RADIO_GLOBE_CONFIG.search.maximumResults,

        hidebroken:
            1,

        order:
            "votes",

        reverse:
            true

    };


    const data =
        await radioApiRequest(
            RADIO_API.endpoints.search,
            params
        );


    return processApiStations(
        data
    );

}


/* =========================================================
   05. GET STATIONS BY COUNTRY
========================================================= */

async function getStationsByCountry(
    country,
    options = {}
) {

    const params = {

        limit:
            options.limit ||
            RADIO_GLOBE_CONFIG.radio.limit,

        hidebroken:
            1,

        order:
            "votes",

        reverse:
            true

    };


    const endpoint =
        RADIO_API.endpoints.country +
        "/" +
        encodeURIComponent(
            country
        );


    const data =
        await radioApiRequest(
            endpoint,
            params
        );


    return processApiStations(
        data
    );

}


/* =========================================================
   06. GET INDIA STATIONS
========================================================= */

async function getIndiaRadioStations(
    options = {}
) {

    const stations =
        await getStationsByCountry(
            "India",
            options
        );


    const india =
        stations.filter(
            station =>
                isIndiaStation(
                    station
                )
        );


    return india;

}


/* =========================================================
   07. GET STATIONS BY STATE
========================================================= */

async function getStationsByState(
    state,
    options = {}
) {

    const params = {

        limit:
            options.limit ||
            RADIO_GLOBE_CONFIG.radio.limit,

        hidebroken:
            1,

        order:
            "votes",

        reverse:
            true

    };


    const endpoint =
        RADIO_API.endpoints.state +
        "/" +
        encodeURIComponent(
            state
        );


    const data =
        await radioApiRequest(
            endpoint,
            params
        );


    return processApiStations(
        data
    );

}


/* =========================================================
   08. GET RAJASTHAN STATIONS
========================================================= */

async function getRajasthanRadioStations(
    options = {}
) {

    /*
       Radio Browser may not always provide
       Rajasthan as a clean state value.

       Therefore we use several discovery methods.
    */


    const results = [];


    /* -----------------------------------------
       METHOD 1
       Search Rajasthan by station name/state
    ----------------------------------------- */

    try {

        const stateStations =
            await getStationsByState(
                "Rajasthan",
                options
            );


        results.push(
            ...stateStations
        );

    }
    catch (error) {

        radioLog(
            "Rajasthan state endpoint unavailable:",
            error.message
        );

    }


    /* -----------------------------------------
       METHOD 2
       Search major Rajasthan cities
    ----------------------------------------- */

    const cities = [

        "Jaipur",
        "Ajmer",
        "Jodhpur",
        "Udaipur",
        "Kota",
        "Bikaner",
        "Alwar",
        "Sikar",
        "Bhilwara",
        "Sri Ganganagar"

    ];


    for (
        const city of cities
    ) {

        try {

            const cityStations =
                await searchWorldStations(
                    city,
                    {
                        limit: 25
                    }
                );


            const rajasthanStations =
                cityStations.filter(
                    station =>
                        isRajasthanStation(
                            station
                        )
                );


            results.push(
                ...rajasthanStations
            );

        }
        catch (error) {

            radioLog(
                `City search failed: ${city}`,
                error.message
            );

        }

    }


    /* -----------------------------------------
       REMOVE DUPLICATES
    ----------------------------------------- */

    const unique =
        removeDuplicateStations(
            results
        );


    radioLog(
        "Rajasthan stations discovered:",
        unique.length
    );


    return unique;

}


/* =========================================================
   09. DISCOVER INDIA + RAJASTHAN
========================================================= */

async function discoverIndiaStations() {

    try {

        const india =
            await getIndiaRadioStations(
                {
                    limit: 200
                }
            );


        const rajasthan =
            india.filter(
                station =>
                    isRajasthanStation(
                        station
                    )
            );


        setStations(
            [
                ...india,
                ...rajasthan
            ]
        );


        return {

            india,

            rajasthan

        };

    }
    catch (error) {

        console.error(
            "India station discovery failed:",
            error
        );


        return {

            india: [],

            rajasthan: []

        };

    }

}


/* =========================================================
   10. DISCOVER POPULAR WORLD STATIONS
========================================================= */

async function discoverWorldStations(
    options = {}
) {

    const limit =
        options.limit ||
        RADIO_GLOBE_CONFIG.radio.limit;


    const popularQueries = [

        "Radio",

        "FM",

        "Music",

        "Pop",

        "News",

        "Rock",

        "Jazz"

    ];


    const results = [];


    for (
        const query of popularQueries
    ) {

        try {

            const stations =
                await searchWorldStations(
                    query,
                    {
                        limit:
                            Math.ceil(
                                limit /
                                popularQueries.length
                            )
                    }
                );


            results.push(
                ...stations
            );

        }
        catch (error) {

            radioLog(
                "World discovery failed:",
                query,
                error.message
            );

        }

    }


    return removeDuplicateStations(
        results
    );

}


/* =========================================================
   11. LOAD INITIAL STATIONS
========================================================= */

async function loadInitialStations() {

    radioLog(
        "Loading real radio stations..."
    );


    try {

        /*
           First load India because
           Rajasthan is our special focus.
        */

        const india =
            await getIndiaRadioStations(
                {
                    limit: 200
                }
            );


        /*
           Then discover Rajasthan
           separately.
        */

        const rajasthan =
            await getRajasthanRadioStations(
                {
                    limit: 50
                }
            );


        /*
           Add both to store.
        */

        const combined =
            removeDuplicateStations(
                [
                    ...india,
                    ...rajasthan
                ]
            );


        setStations(
            combined
        );


        radioLog(
            "Initial stations loaded:",
            combined.length
        );


        return combined;

    }
    catch (error) {

        console.error(
            "Initial radio station loading failed:",
            error
        );


        return [];

    }

}


/* =========================================================
   12. SEARCH WITH API FALLBACK
========================================================= */

async function searchRadioStations(
    query,
    options = {}
) {

    const text =
        String(
            query || ""
        ).trim();


    if (
        text.length <
        RADIO_GLOBE_CONFIG.search.minimumCharacters
    ) {

        return [];

    }


    /*
       First search stations already
       loaded in the browser.
    */

    let localResults =
        searchStations(
            text,
            {
                filter:
                    options.filter ||
                    "world",

                limit:
                    options.limit ||
                    25
            }
        );


    /*
       If local results are not enough,
       ask the real API.
    */

    if (
        localResults.length <
        5
    ) {

        try {

            const apiResults =
                await searchWorldStations(
                    text,
                    {
                        limit:
                            options.limit ||
                            25
                    }
                );


            const combined =
                removeDuplicateStations(
                    [
                        ...localResults,
                        ...apiResults
                    ]
                );


            localResults =
                combined.slice(
                    0,
                    options.limit || 25
                );

        }
        catch (error) {

            radioLog(
                "API search fallback failed:",
                error.message
            );

        }

    }


    return localResults;

}


/* =========================================================
   13. SEARCH RAJASTHAN
========================================================= */

async function searchRajasthanStations(
    query
) {

    const text =
        String(
            query || ""
        ).trim();


    if (!text) {

        return getRajasthanStations();

    }


    /*
       Local Rajasthan search
    */

    let results =
        searchStations(
            text,
            {
                filter:
                    "rajasthan",

                limit:
                    25
            }
        );


    /*
       Real API search
    */

    try {

        const apiResults =
            await searchWorldStations(
                text,
                {
                    limit: 50
                }
            );


        const rajasthanResults =
            apiResults.filter(
                station =>
                    isRajasthanStation(
                        station
                    )
            );


        results =
            removeDuplicateStations(
                [
                    ...results,
                    ...rajasthanResults
                ]
            );

    }
    catch (error) {

        radioLog(
            "Rajasthan search failed:",
            error.message
        );

    }


    return results.slice(
        0,
        25
    );

}


/* =========================================================
   14. FIND STATIONS NEAR LOCATION
========================================================= */

async function findStationsNear(
    latitude,
    longitude,
    radius = 50
) {

    const url =
        new URL(
            RADIO_API.baseURL +
            "/stations/nearby"
        );


    url.searchParams.set(
        "lat",
        latitude
    );


    url.searchParams.set(
        "lon",
        longitude
    );


    url.searchParams.set(
        "distance",
        radius
    );


    url.searchParams.set(
        "limit",
        100
    );


    url.searchParams.set(
        "hidebroken",
        1
    );


    try {

        const response =
            await fetch(
                url.toString()
            );


        if (!response.ok) {

            throw new Error(
                `Nearby API error: ${response.status}`
            );

        }


        const data =
            await response.json();


        return processApiStations(
            data
        );

    }
    catch (error) {

        radioLog(
            "Nearby station search failed:",
            error.message
        );


        return [];

    }

}


/* =========================================================
   15. REPORT STATION CLICK
========================================================= */

async function reportStationClick(
    station
) {

    if (
        !station ||
        !station.uuid
    ) {

        return false;

    }


    try {

        const endpoint =
            RADIO_API.baseURL +
            "/url/" +
            encodeURIComponent(
                station.uuid
            );


        await fetch(
            endpoint,
            {
                method: "GET",
                mode: "cors"
            }
        );


        return true;

    }
    catch (error) {

        radioLog(
            "Station click reporting failed:",
            error.message
        );


        return false;

    }

}


/* =========================================================
   16. CHECK API CONNECTION
========================================================= */

async function checkRadioApi() {

    try {

        const endpoint =
            RADIO_API.baseURL +
            "/stations/count";


        const response =
            await fetch(
                endpoint
            );


        if (!response.ok) {

            return false;

        }


        const count =
            await response.json();


        radioLog(
            "Radio Browser station count:",
            count
        );


        return true;

    }
    catch (error) {

        console.error(
            "Radio API connection failed:",
            error
        );


        return false;

    }

}


/* =========================================================
   17. PUBLIC API
========================================================= */

window.RadioAPI = {

    request:
        radioApiRequest,

    search:
        searchRadioStations,

    world:
        discoverWorldStations,

    country:
        getStationsByCountry,

    india:
        getIndiaRadioStations,

    state:
        getStationsByState,

    rajasthan:
        getRajasthanRadioStations,

    indiaDiscovery:
        discoverIndiaStations,

    initialLoad:
        loadInitialStations,

    nearby:
        findStationsNear,

    reportClick:
        reportStationClick,

    checkConnection:
        checkRadioApi

};


/* =========================================================
   18. READY
========================================================= */

radioLog(
    "station-api.js loaded successfully."
);
