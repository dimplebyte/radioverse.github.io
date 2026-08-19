/* =========================================
   RADIOVERSE — MAIN APPLICATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("RadioVerse starting...");

    /* -----------------------------------------
       ELEMENTS
    ----------------------------------------- */

    const app = document.getElementById("radio-app");
    const globe = document.getElementById("globe");
    const audioPlayer = document.getElementById("audio-player");

    const playButton = document.getElementById("play-button");
    const previousButton = document.getElementById("previous-station");
    const nextButton = document.getElementById("next-station");

    const volumeControl = document.getElementById("volume-control");

    const searchButton = document.getElementById("search-button");
    const favoritesButton = document.getElementById("favorites-button");

    const searchPanel = document.getElementById("search-panel");
    const favoritesPanel = document.getElementById("favorites-panel");

    const closeSearch = document.getElementById("close-search");
    const closeFavorites = document.getElementById("close-favorites");

    const currentLocation =
        document.getElementById("current-location");

    /* -----------------------------------------
       APPLICATION STATE
    ----------------------------------------- */

    const state = {
        stations: [],
        currentStation: null,
        currentStationIndex: -1,
        isPlaying: false,
        volume: 0.8
    };

    /* -----------------------------------------
       INITIALIZE
    ----------------------------------------- */

    function init() {

        if (app) {
            app.classList.add("loaded");
        }

        if (audioPlayer) {
            audioPlayer.volume = state.volume;
        }

        setupEvents();

        loadStations();

        console.log("RadioVerse initialized.");
    }

    /* -----------------------------------------
       LOAD STATIONS
    ----------------------------------------- */

    function loadStations() {

        /*
         * stations.js is expected to expose
         * the station data globally.
         */

        if (typeof window.radioStations !== "undefined") {

            state.stations = Array.isArray(window.radioStations)
                ? window.radioStations
                : [];

        } else if (typeof window.stations !== "undefined") {

            state.stations = Array.isArray(window.stations)
                ? window.stations
                : [];

        } else {

            state.stations = [];

        }

        console.log(
            `Loaded ${state.stations.length} radio stations.`
        );

        if (
            typeof window.initializeGlobe === "function"
        ) {
            window.initializeGlobe(state.stations);
        }
    }

    /* -----------------------------------------
       SET CURRENT STATION
    ----------------------------------------- */

    function selectStation(station) {

        if (!station) {
            return;
        }

        state.currentStation = station;

        state.currentStationIndex =
            state.stations.indexOf(station);

        updateStationUI(station);

        if (
            typeof window.showStation === "function"
        ) {
            window.showStation(station);
        }

        console.log(
            "Selected station:",
            station.name || station.title
        );
    }

    /* -----------------------------------------
       PLAY STATION
    ----------------------------------------- */

    function playStation(station = state.currentStation) {

        if (!station) {
            showToast("Select a radio station first.");
            return;
        }

        const streamUrl =
            station.stream ||
            station.streamUrl ||
            station.url ||
            station.audio;

        if (!streamUrl) {
            showToast("This station has no playable stream.");
            return;
        }

        if (!audioPlayer) {
            return;
        }

        audioPlayer.src = streamUrl;

        audioPlayer.volume = state.volume;

        audioPlayer.play()
            .then(() => {

                state.currentStation = station;
                state.isPlaying = true;

                updatePlayerButton();

                updateStationUI(station);

            })
            .catch(error => {

                console.error(
                    "Radio playback error:",
                    error
                );

                state.isPlaying = false;

                updatePlayerButton();

                showToast(
                    "Unable to play this station."
                );
            });
    }

    /* -----------------------------------------
       PAUSE STATION
    ----------------------------------------- */

    function pauseStation() {

        if (!audioPlayer) {
            return;
        }

        audioPlayer.pause();

        state.isPlaying = false;

        updatePlayerButton();
    }

    /* -----------------------------------------
       TOGGLE PLAY / PAUSE
    ----------------------------------------- */

    function togglePlayback() {

        if (!state.currentStation) {
            showToast("Choose a station first.");
            return;
        }

        if (state.isPlaying) {
            pauseStation();
        } else {
            playStation();
        }
    }

    /* -----------------------------------------
       NEXT STATION
    ----------------------------------------- */

    function nextStation() {

        if (!state.stations.length) {
            return;
        }

        let nextIndex =
            state.currentStationIndex + 1;

        if (nextIndex >= state.stations.length) {
            nextIndex = 0;
        }

        selectStation(
            state.stations[nextIndex]
        );
    }

    /* -----------------------------------------
       PREVIOUS STATION
    ----------------------------------------- */

    function previousStation() {

        if (!state.stations.length) {
            return;
        }

        let previousIndex =
            state.currentStationIndex - 1;

        if (previousIndex < 0) {
            previousIndex =
                state.stations.length - 1;
        }

        selectStation(
            state.stations[previousIndex]
        );
    }

    /* -----------------------------------------
       UPDATE PLAYER UI
    ----------------------------------------- */

    function updatePlayerButton() {

        if (!playButton) {
            return;
        }

        playButton.textContent =
            state.isPlaying ? "❚❚" : "▶";

        playButton.setAttribute(
            "aria-label",
            state.isPlaying ? "Pause" : "Play"
        );
    }

    /* -----------------------------------------
       UPDATE STATION UI
    ----------------------------------------- */

    function updateStationUI(station) {

        const name =
            station.name ||
            station.title ||
            "Unknown Station";

        const location =
            station.location ||
            station.city ||
            station.country ||
            "World";

        const nameElement =
            document.getElementById(
                "player-station-name"
            );

        const locationElement =
            document.getElementById(
                "player-station-location"
            );

        if (nameElement) {
            nameElement.textContent = name;
        }

        if (locationElement) {
            locationElement.textContent = location;
        }

        if (currentLocation) {
            currentLocation.textContent = location;
        }
    }

    /* -----------------------------------------
       SEARCH PANEL
    ----------------------------------------- */

    function openSearchPanel() {

        if (!searchPanel) {
            return;
        }

        searchPanel.setAttribute(
            "aria-hidden",
            "false"
        );

        searchPanel.classList.add("active");

        const input =
            document.getElementById(
                "station-search"
            );

        if (input) {
            setTimeout(() => {
                input.focus();
            }, 100);
        }
    }

    function closeSearchPanel() {

        if (!searchPanel) {
            return;
        }

        searchPanel.setAttribute(
            "aria-hidden",
            "true"
        );

        searchPanel.classList.remove("active");
    }

    /* -----------------------------------------
       FAVORITES PANEL
    ----------------------------------------- */

    function openFavoritesPanel() {

        if (!favoritesPanel) {
            return;
        }

        favoritesPanel.setAttribute(
            "aria-hidden",
            "false"
        );

        favoritesPanel.classList.add("active");

        if (
            typeof window.renderFavorites ===
            "function"
        ) {
            window.renderFavorites();
        }
    }

    function closeFavoritesPanel() {

        if (!favoritesPanel) {
            return;
        }

        favoritesPanel.setAttribute(
            "aria-hidden",
            "true"
        );

        favoritesPanel.classList.remove("active");
    }

    /* -----------------------------------------
       VOLUME
    ----------------------------------------- */

    function updateVolume() {

        if (!volumeControl || !audioPlayer) {
            return;
        }

        state.volume =
            Number(volumeControl.value);

        audioPlayer.volume =
            state.volume;
    }

    /* -----------------------------------------
       TOAST
    ----------------------------------------- */

    function showToast(message) {

        const toast =
            document.getElementById("toast");

        if (!toast) {
            return;
        }

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(
            showToast.timeout
        );

        showToast.timeout =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 2500);
    }

    /* -----------------------------------------
       EVENT LISTENERS
    ----------------------------------------- */

    function setupEvents() {

        if (playButton) {
            playButton.addEventListener(
                "click",
                togglePlayback
            );
        }

        if (nextButton) {
            nextButton.addEventListener(
                "click",
                nextStation
            );
        }

        if (previousButton) {
            previousButton.addEventListener(
                "click",
                previousStation
            );
        }

        if (volumeControl) {
            volumeControl.addEventListener(
                "input",
                updateVolume
            );
        }

        if (searchButton) {
            searchButton.addEventListener(
                "click",
                openSearchPanel
            );
        }

        if (closeSearch) {
            closeSearch.addEventListener(
                "click",
                closeSearchPanel
            );
        }

        if (favoritesButton) {
            favoritesButton.addEventListener(
                "click",
                openFavoritesPanel
            );
        }

        if (closeFavorites) {
            closeFavorites.addEventListener(
                "click",
                closeFavoritesPanel
            );
        }

        if (audioPlayer) {

            audioPlayer.addEventListener(
                "play",
                () => {

                    state.isPlaying = true;

                    updatePlayerButton();

                }
            );

            audioPlayer.addEventListener(
                "pause",
                () => {

                    state.isPlaying = false;

                    updatePlayerButton();

                }
            );

            audioPlayer.addEventListener(
                "ended",
                () => {

                    state.isPlaying = false;

                    updatePlayerButton();

                }
            );

            audioPlayer.addEventListener(
                "error",
                () => {

                    state.isPlaying = false;

                    updatePlayerButton();

                    showToast(
                        "Radio stream unavailable."
                    );

                }
            );
        }
    }

    /* -----------------------------------------
       GLOBAL FUNCTIONS
       Other JS files can use these.
    ----------------------------------------- */

    window.RadioVerse = {

        state,

        selectStation,

        playStation,

        pauseStation,

        togglePlayback,

        nextStation,

        previousStation,

        showToast

    };

    /* -----------------------------------------
       START APP
    ----------------------------------------- */

    init();

});
