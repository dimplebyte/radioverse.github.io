/* =========================================================
   RADIO GLOBE
   player.js
   Real radio stream player
   Made by Dimple Khangarot
========================================================= */


/* =========================================================
   01. PLAYER STATE
========================================================= */

const PlayerState = {

    audio: null,

    currentStation: null,

    currentIndex: -1,

    stations: [],

    isPlaying: false,

    volume:
        RADIO_GLOBE_CONFIG.player.defaultVolume,

    isLoading: false,

    error: null

};


/* =========================================================
   02. INITIALIZE PLAYER
========================================================= */

function initializePlayer() {

    if (PlayerState.audio) {

        return PlayerState.audio;

    }


    let audio =
        document.querySelector(
            "#radio-audio"
        );


    if (!audio) {

        audio =
            document.createElement(
                "audio"
            );

        audio.id =
            "radio-audio";

        audio.preload =
            "none";

        audio.crossOrigin =
            "anonymous";


        document.body.appendChild(
            audio
        );

    }


    PlayerState.audio =
        audio;


    restoreSavedVolume();


    setupAudioEvents();


    radioLog(
        "Real radio player initialized."
    );


    return audio;

}


/* =========================================================
   03. AUDIO EVENTS
========================================================= */

function setupAudioEvents() {

    const audio =
        PlayerState.audio;


    audio.addEventListener(
        "loadstart",
        () => {

            PlayerState.isLoading =
                true;


            notifyPlayer(
                "loading"
            );

        }
    );


    audio.addEventListener(
        "canplay",
        () => {

            PlayerState.isLoading =
                false;


            notifyPlayer(
                "ready"
            );

        }
    );


    audio.addEventListener(
        "playing",
        () => {

            PlayerState.isPlaying =
                true;

            PlayerState.isLoading =
                false;


            notifyPlayer(
                "playing"
            );


            dispatchRadioEvent(
                RADIO_EVENTS.stationPlaying,
                {
                    station:
                        PlayerState.currentStation
                }
            );

        }
    );


    audio.addEventListener(
        "pause",
        () => {

            PlayerState.isPlaying =
                false;


            notifyPlayer(
                "paused"
            );


            dispatchRadioEvent(
                RADIO_EVENTS.stationPaused,
                {
                    station:
                        PlayerState.currentStation
                }
            );

        }
    );


    audio.addEventListener(
        "waiting",
        () => {

            PlayerState.isLoading =
                true;


            notifyPlayer(
                "buffering"
            );

        }
    );


    audio.addEventListener(
        "error",
        () => {

            PlayerState.isPlaying =
                false;

            PlayerState.isLoading =
                false;


            const error =
                audio.error;


            PlayerState.error =
                error
                    ? error.code
                    : "unknown";


            notifyPlayer(
                "error"
            );


            dispatchRadioEvent(
                RADIO_EVENTS.stationError,
                {
                    station:
                        PlayerState.currentStation,

                    error:
                        PlayerState.error
                }
            );


            radioLog(
                "Radio stream error:",
                PlayerState.error
            );

        }
    );


    audio.addEventListener(
        "volumechange",
        () => {

            PlayerState.volume =
                audio.volume;


            saveVolume();

            notifyPlayer(
                "volume"
            );

        }
    );

}


/* =========================================================
   04. LOAD STATION
========================================================= */

function loadStation(
    station,
    autoPlay = false
) {

    if (!station) {

        return false;

    }


    if (
        !hasPlayableStream(
            station
        )
    ) {

        radioLog(
            "Station has no playable stream:",
            station.name
        );

        return false;

    }


    initializePlayer();


    const audio =
        PlayerState.audio;


    /*
       Stop previous stream
    */

    audio.pause();


    audio.removeAttribute(
        "src"
    );


    audio.load();


    PlayerState.currentStation =
        station;


    PlayerState.error =
        null;


    PlayerState.isPlaying =
        false;


    PlayerState.isLoading =
        true;


    /*
       Set real station stream
    */

    audio.src =
        station.streamUrl;


    /*
       Select station globally
    */

    selectStation(
        station
    );


    /*
       Remember station
    */

    saveLastStation(
        station
    );


    notifyPlayer(
        "station-loaded"
    );


    radioLog(
        "Loaded real station:",
        station.name,
        station.streamUrl
    );


    /*
       Optional autoplay
    */

    if (
        autoPlay
    ) {

        return playStation();

    }


    return true;

}


/* =========================================================
   05. PLAY
========================================================= */

async function playStation() {

    initializePlayer();


    const audio =
        PlayerState.audio;


    if (
        !PlayerState.currentStation
    ) {

        const available =
            getPlayerStations();


        if (
            available.length
        ) {

            loadStation(
                available[0],
                false
            );

        }

        else {

            radioLog(
                "No station selected."
            );

            return false;

        }

    }


    try {

        PlayerState.isLoading =
            true;


        notifyPlayer(
            "loading"
        );


        await audio.play();


        PlayerState.isPlaying =
            true;


        return true;

    }
    catch (error) {

        PlayerState.isPlaying =
            false;

        PlayerState.isLoading =
            false;


        PlayerState.error =
            error.message;


        console.error(
            "Unable to play station:",
            error
        );


        notifyPlayer(
            "error"
        );


        return false;

    }

}


/* =========================================================
   06. PAUSE
========================================================= */

function pauseStation() {

    if (
        !PlayerState.audio
    ) {

        return;

    }


    PlayerState.audio.pause();


    PlayerState.isPlaying =
        false;


    notifyPlayer(
        "paused"
    );

}


/* =========================================================
   07. TOGGLE PLAY / PAUSE
========================================================= */

async function togglePlayPause() {

    if (
        PlayerState.isPlaying
    ) {

        pauseStation();

        return false;

    }


    return await playStation();

}


/* =========================================================
   08. NEXT STATION
========================================================= */

async function nextStation() {

    const stations =
        getPlayerStations();


    if (
        !stations.length
    ) {

        return false;

    }


    let nextIndex =
        PlayerState.currentIndex +
        1;


    if (
        nextIndex >=
        stations.length
    ) {

        nextIndex = 0;

    }


    PlayerState.currentIndex =
        nextIndex;


    const station =
        stations[nextIndex];


    loadStation(
        station,
        true
    );


    return true;

}


/* =========================================================
   09. PREVIOUS STATION
========================================================= */

async function previousStation() {

    const stations =
        getPlayerStations();


    if (
        !stations.length
    ) {

        return false;

    }


    let previousIndex =
        PlayerState.currentIndex -
        1;


    if (
        previousIndex < 0
    ) {

        previousIndex =
            stations.length - 1;

    }


    PlayerState.currentIndex =
        previousIndex;


    const station =
        stations[previousIndex];


    loadStation(
        station,
        true
    );


    return true;

}


/* =========================================================
   10. SET VOLUME
========================================================= */

function setPlayerVolume(
    value
) {

    initializePlayer();


    const volume =
        Math.max(
            0,
            Math.min(
                1,
                Number(value)
            )
        );


    PlayerState.volume =
        volume;


    PlayerState.audio.volume =
        volume;


    saveVolume();


    notifyPlayer(
        "volume"
    );


    return volume;

}


/* =========================================================
   11. VOLUME UP
========================================================= */

function increaseVolume(
    amount = 0.1
) {

    return setPlayerVolume(
        PlayerState.volume +
        amount
    );

}


/* =========================================================
   12. VOLUME DOWN
========================================================= */

function decreaseVolume(
    amount = 0.1
) {

    return setPlayerVolume(
        PlayerState.volume -
        amount
    );

}


/* =========================================================
   13. MUTE
========================================================= */

function toggleMute() {

    initializePlayer();


    const audio =
        PlayerState.audio;


    audio.muted =
        !audio.muted;


    notifyPlayer(
        "mute"
    );


    return audio.muted;

}


/* =========================================================
   14. GET STATIONS FOR PLAYER
========================================================= */

function getPlayerStations() {

    /*
       Prefer currently filtered results.
    */

    if (
        StationStore.currentResults
            .length
    ) {

        PlayerState.stations =
            StationStore.currentResults;

    }

    else {

        PlayerState.stations =
            StationStore.all;

    }


    /*
       Keep only playable streams.
    */

    PlayerState.stations =
        PlayerState.stations.filter(
            station =>
                hasPlayableStream(
                    station
                )
        );


    /*
       Keep current index synchronized.
    */

    if (
        PlayerState.currentStation
    ) {

        const index =
            PlayerState.stations.findIndex(
                station =>
                    station.id ===
                    PlayerState
                        .currentStation
                        .id
            );


        if (
            index >= 0
        ) {

            PlayerState.currentIndex =
                index;

        }

    }


    return PlayerState.stations;

}


/* =========================================================
   15. SET PLAYER STATION LIST
========================================================= */

function setPlayerStations(
    stations
) {

    if (
        !Array.isArray(stations)
    ) {

        return;

    }


    PlayerState.stations =
        stations.filter(
            station =>
                hasPlayableStream(
                    station
                )
        );


    PlayerState.currentIndex =
        -1;

}


/* =========================================================
   16. SAVE VOLUME
========================================================= */

function saveVolume() {

    if (
        !RADIO_GLOBE_CONFIG
            .player
            .rememberVolume
    ) {

        return;

    }


    try {

        localStorage.setItem(
            STORAGE_KEYS.volume,
            String(
                PlayerState.volume
            )
        );

    }
    catch (error) {

        radioLog(
            "Could not save volume."
        );

    }

}


/* =========================================================
   17. RESTORE VOLUME
========================================================= */

function restoreSavedVolume() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.volume
            );


        if (
            saved !== null
        ) {

            const volume =
                Number(saved);


            if (
                Number.isFinite(volume)
            ) {

                PlayerState.volume =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            volume
                        )
                    );

            }

        }

    }
    catch (error) {

        radioLog(
            "Could not restore volume."
        );

    }


    if (
        PlayerState.audio
    ) {

        PlayerState.audio.volume =
            PlayerState.volume;

    }

}


/* =========================================================
   18. SAVE LAST STATION
========================================================= */

function saveLastStation(
    station
) {

    if (!station) {
        return;
    }


    try {

        localStorage.setItem(

            STORAGE_KEYS.lastStation,

            JSON.stringify({

                id:
                    station.id,

                uuid:
                    station.uuid,

                name:
                    station.name,

                streamUrl:
                    station.streamUrl,

                country:
                    station.country,

                state:
                    station.state,

                city:
                    station.city,

                latitude:
                    station.latitude,

                longitude:
                    station.longitude

            })

        );

    }
    catch (error) {

        radioLog(
            "Could not save last station."
        );

    }

}


/* =========================================================
   19. RESTORE LAST STATION
========================================================= */

function restoreLastStation() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.lastStation
            );


        if (!saved) {

            return null;

        }


        return JSON.parse(
            saved
        );

    }
    catch (error) {

        return null;

    }

}


/* =========================================================
   20. REPORT STATION CLICK
========================================================= */

async function reportCurrentStationClick() {

    if (
        !PlayerState.currentStation
    ) {

        return;

    }


    if (
        typeof RadioAPI !==
        "undefined" &&
        RadioAPI.reportClick
    ) {

        await RadioAPI.reportClick(
            PlayerState.currentStation
        );

    }

}


/* =========================================================
   21. PLAYER STATUS
========================================================= */

function getPlayerStatus() {

    return {

        isPlaying:
            PlayerState.isPlaying,

        isLoading:
            PlayerState.isLoading,

        currentStation:
            PlayerState.currentStation,

        currentIndex:
            PlayerState.currentIndex,

        volume:
            PlayerState.volume,

        error:
            PlayerState.error

    };

}


/* =========================================================
   22. UI NOTIFICATION
========================================================= */

function notifyPlayer(
    status
) {

    if (
        typeof window ===
        "undefined"
    ) {

        return;

    }


    window.dispatchEvent(

        new CustomEvent(
            "radio:player-status",
            {
                detail: {

                    status,

                    player:
                        getPlayerStatus()

                }
            }
        )

    );

}


/* =========================================================
   23. CLEANUP
========================================================= */

function destroyPlayer() {

    if (
        !PlayerState.audio
    ) {

        return;

    }


    PlayerState.audio.pause();


    PlayerState.audio.removeAttribute(
        "src"
    );


    PlayerState.audio.load();


    PlayerState.audio = null;

    PlayerState.currentStation =
        null;

    PlayerState.currentIndex =
        -1;

    PlayerState.isPlaying =
        false;


    radioLog(
        "Radio player destroyed."
    );

}


/* =========================================================
   24. PUBLIC PLAYER API
========================================================= */

window.RadioPlayer = {

    state:
        PlayerState,

    init:
        initializePlayer,

    load:
        loadStation,

    play:
        playStation,

    pause:
        pauseStation,

    toggle:
        togglePlayPause,

    next:
        nextStation,

    previous:
        previousStation,

    volume:
        setPlayerVolume,

    volumeUp:
        increaseVolume,

    volumeDown:
        decreaseVolume,

    mute:
        toggleMute,

    setStations:
        setPlayerStations,

    status:
        getPlayerStatus,

    restoreLast:
        restoreLastStation,

    reportClick:
        reportCurrentStationClick,

    destroy:
        destroyPlayer

};


/* =========================================================
   25. READY
========================================================= */

radioLog(
    "player.js loaded successfully."
);
