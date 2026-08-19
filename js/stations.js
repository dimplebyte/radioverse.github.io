/* =========================================================
   RADIO GLOBE
   stations.js
   Station data + filtering + sorting
   Made by Dimple Khangarot
========================================================= */


/* =========================================================
   01. STATION STORE
========================================================= */

const StationStore = {

    all: [],

    world: [],

    india: [],

    rajasthan: [],

    currentResults: [],

    currentQuery: "",

    currentFilter: "world",

    selected: null

};


/* =========================================================
   02. NORMALIZE STATION
========================================================= */

function normalizeStation(station) {

    if (!station || typeof station !== "object") {
        return null;
    }

    const latitude =
        Number(
            station.geo_lat ??
            station.latitude ??
            station.lat
        );

    const longitude =
        Number(
            station.geo_long ??
            station.longitude ??
            station.lon
        );


    return {

        /* Basic identity */

        id:
            station.stationuuid ||
            station.stationId ||
            station.id ||
            createStationId(station),

        uuid:
            station.stationuuid ||
            "",


        /* Station information */

        name:
            cleanStationText(
                station.name ||
                station.stationName ||
                "Unknown Station"
            ),

        country:
            cleanStationText(
                station.country ||
                ""
            ),

        countryCode:
            String(
                station.countrycode ||
                station.countryCode ||
                ""
            ).toUpperCase(),

        state:
            cleanStationText(
                station.state ||
                ""
            ),

        city:
            cleanStationText(
                station.city ||
                ""
            ),

        district:
            cleanStationText(
                station.district ||
                ""
            ),


        /* Radio information */

        streamUrl:
            station.url_resolved ||
            station.url ||
            station.streamUrl ||
            "",

        homepage:
            station.homepage ||
            "",

        favicon:
            station.favicon ||
            "",

        codec:
            station.codec ||
            "",

        bitrate:
            Number(station.bitrate || 0),

        sampleRate:
            Number(station.samplerate || 0),


        /* Categories */

        tags:
            normalizeTags(station.tags),

        language:
            station.language ||
            "",


        /* Location */

        latitude:
            Number.isFinite(latitude)
                ? latitude
                : null,

        longitude:
            Number.isFinite(longitude)
                ? longitude
                : null,


        /* Popularity */

        votes:
            Number(station.votes || 0),

        clickCount:
            Number(
                station.clickcount ||
                station.clickCount ||
                0
            ),


        /* Status */

        isOnline:
            station.lastcheckok === 1 ||
            station.lastcheckok === true,

        lastCheckOk:
            station.lastcheckok === 1 ||
            station.lastcheckok === true

    };

}


/* =========================================================
   03. CREATE FALLBACK ID
========================================================= */

function createStationId(station) {

    const raw = [

        station.name,
        station.country,
        station.state,
        station.city,
        station.url ||
        station.url_resolved

    ].join("|");

    return (

        "station-" +

        raw
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")

    );

}


/* =========================================================
   04. CLEAN TEXT
========================================================= */

function cleanStationText(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/\s+/g, " ")
        .trim();

}


/* =========================================================
   05. NORMALIZE TAGS
========================================================= */

function normalizeTags(tags) {

    if (!tags) {
        return [];
    }

    if (Array.isArray(tags)) {

        return tags
            .map(tag => cleanStationText(tag))
            .filter(Boolean);

    }

    return String(tags)
        .split(",")
        .map(tag => cleanStationText(tag))
        .filter(Boolean);

}


/* =========================================================
   06. NORMALIZE MANY STATIONS
========================================================= */

function normalizeStations(stations) {

    if (!Array.isArray(stations)) {
        return [];
    }

    return stations

        .map(normalizeStation)

        .filter(Boolean)

        .filter(station =>
            station.name &&
            station.streamUrl
        );

}


/* =========================================================
   07. REMOVE DUPLICATES
========================================================= */

function removeDuplicateStations(stations) {

    const unique = new Map();

    stations.forEach(station => {

        const key =
            station.uuid ||
            station.streamUrl ||
            station.id;

        if (!key) {
            return;
        }

        if (!unique.has(key)) {

            unique.set(
                key,
                station
            );

        }

    });

    return Array.from(
        unique.values()
    );

}


/* =========================================================
   08. SET STATIONS
========================================================= */

function setStations(stations) {

    const normalized =
        normalizeStations(stations);

    const unique =
        removeDuplicateStations(normalized);


    StationStore.all = unique;


    /* World */

    StationStore.world =
        unique;
