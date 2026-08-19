/* =========================================================
   RADIO GLOBE
   favorites.js
   Favorite / Like station manager
   Made by Dimple Khangarot
========================================================= */


/* =========================================================
   01. FAVORITES STATE
========================================================= */

const FavoritesState = {

    stations: [],

    initialized: false

};


/* =========================================================
   02. INITIALIZE FAVORITES
========================================================= */

function initializeFavorites() {

    if (
        FavoritesState.initialized
    ) {

        return FavoritesState.stations;

    }


    loadFavorites();


    FavoritesState.initialized =
        true;


    radioLog(
        "Favorites initialized:",
        FavoritesState.stations.length
    );


    return FavoritesState.stations;

}


/* =========================================================
   03. LOAD FAVORITES
========================================================= */

function loadFavorites() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.favorites
            );


        if (!saved) {

            FavoritesState.stations =
                [];

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (
            Array.isArray(parsed)
        ) {

            FavoritesState.stations =
                parsed;

        }
        else {

            FavoritesState.stations =
                [];

        }

    }
    catch (error) {

        console.error(
            "Unable to load favorites:",
            error
        );


        FavoritesState.stations =
            [];

    }

}


/* =========================================================
   04. SAVE FAVORITES
========================================================= */

function saveFavorites() {

    try {

        localStorage.setItem(

            STORAGE_KEYS.favorites,

            JSON.stringify(
                FavoritesState.stations
            )

        );

    }
    catch (error) {

        console.error(
            "Unable to save favorites:",
            error
        );

    }

}


/* =========================================================
   05. ADD FAVORITE
========================================================= */

function addFavorite(
    station
) {

    if (!station) {

        return false;

    }


    initializeFavorites();


    if (
        isFavorite(
            station.id
        )
    ) {

        return true;

    }


    const favorite = {

        id:
            station.id,

        uuid:
            station.uuid || "",

        name:
            station.name || "Unknown Radio",

        streamUrl:
            station.streamUrl || "",

        logo:
            station.logo || "",

        country:
            station.country || "",

        countryCode:
            station.countryCode || "",

        state:
            station.state || "",

        city:
            station.city || "",

        latitude:
            station.latitude,

        longitude:
            station.longitude,

        homepage:
            station.homepage || "",

        tags:
            station.tags || "",

        addedAt:
            new Date().toISOString()

    };


    FavoritesState.stations.push(
        favorite
    );


    saveFavorites();


    updateFavoritesUI();


    dispatchRadioEvent(
        RADIO_EVENTS.favoriteChanged,
        {

            action:
                "added",

            station:
                favorite

        }
    );


    showFavoriteMessage(
        "Added to favorites ♥"
    );


    return true;

}


/* =========================================================
   06. REMOVE FAVORITE
========================================================= */

function removeFavorite(
    stationId
) {

    initializeFavorites();


    const oldLength =
        FavoritesState.stations.length;


    FavoritesState.stations =
        FavoritesState.stations.filter(
            station =>
                station.id !==
                stationId
        );


    const removed =
        FavoritesState.stations.length !==
        oldLength;


    if (removed) {

        saveFavorites();


        updateFavoritesUI();


        dispatchRadioEvent(
            RADIO_EVENTS.favoriteChanged,
            {

                action:
                    "removed",

                stationId

            }
        );


        showFavoriteMessage(
            "Removed from favorites"
        );

    }


    return removed;

}


/* =========================================================
   07. TOGGLE FAVORITE
========================================================= */

function toggleFavorite(
    station
) {

    if (!station) {

        return false;

    }


    initializeFavorites();


    if (
        isFavorite(
            station.id
        )
    ) {

        removeFavorite(
            station.id
        );


        return false;

    }


    addFavorite(
        station
    );


    return true;

}


/* =========================================================
   08. CHECK FAVORITE
========================================================= */

function isFavorite(
    stationId
) {

    initializeFavorites();


    return FavoritesState.stations.some(
        station =>
            station.id ===
            stationId
    );

}


/* =========================================================
   09. GET ALL FAVORITES
========================================================= */

function getFavorites() {

    initializeFavorites();


    return [
        ...FavoritesState.stations
    ];

}


/* =========================================================
   10. GET FAVORITE COUNT
========================================================= */

function getFavoriteCount() {

    initializeFavorites();


    return FavoritesState.stations.length;

}


/* =========================================================
   11. CLEAR FAVORITES
========================================================= */

function clearFavorites() {

    FavoritesState.stations =
        [];


    saveFavorites();


    updateFavoritesUI();


    dispatchRadioEvent(
        RADIO_EVENTS.favoriteChanged,
        {

            action:
                "cleared"

        }
    );


    showFavoriteMessage(
        "Favorites cleared"
    );

}


/* =========================================================
   12. FIND FAVORITE
========================================================= */

function findFavorite(
    stationId
) {

    initializeFavorites();


    return FavoritesState.stations.find(
        station =>
            station.id ===
            stationId
    ) || null;

}


/* =========================================================
   13. RENDER FAVORITES
========================================================= */

function renderFavorites() {

    const container =
        document.querySelector(
            "#favorites-list"
        ) ||
        document.querySelector(
            ".favorites-list"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const favorites =
        getFavorites();


    if (
        !favorites.length
    ) {

        container.innerHTML = `

            <div class="favorites-empty">

                <div class="favorites-empty-icon">
                    ♡
                </div>

                <strong>
                    No favorite stations yet
                </strong>

                <span>
                    Tap the heart on a station
                    to save it here.
                </span>

            </div>

        `;


        return;

    }


    favorites.forEach(
        (
            station,
            index
        ) => {

            const item =
                createFavoriteItem(
                    station,
                    index
                );


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   14. CREATE FAVORITE ITEM
========================================================= */

function createFavoriteItem(
    station,
    index
) {

    const item =
        document.createElement(
            "button"
        );


    item.type =
        "button";


    item.className =
        "favorite-station";


    item.dataset.stationId =
        station.id;


    item.innerHTML = `

        <span class="favorite-station-icon">
            ♥
        </span>

        <span class="favorite-station-info">

            <strong>
                ${escapeFavoriteHTML(
                    station.name
                )}
            </strong>

            <small>
                ${escapeFavoriteHTML(
                    [
                        station.city,
                        station.state,
                        station.country
                    ]
                    .filter(Boolean)
                    .join(" • ")
                )}
            </small>

        </span>

        <span class="favorite-station-play">
            ▶
        </span>

    `;


    item.addEventListener(
        "click",
        () => {

            playFavoriteStation(
                station
            );

        }
    );


    return item;

}


/* =========================================================
   15. PLAY FAVORITE STATION
========================================================= */

function playFavoriteStation(
    station
) {

    if (!station) {

        return;

    }


    if (
        window.RadioGlobe &&
        RadioGlobe.focusStation
    ) {

        RadioGlobe.focusStation(
            station
        );

    }


    if (
        window.RadioPlayer &&
        RadioPlayer.load
    ) {

        RadioPlayer.load(
            station,
            true
        );

    }


    if (
        window.RadioUI &&
        RadioUI.showStation
    ) {

        RadioUI.showStation(
            station
        );

    }

}


/* =========================================================
   16. UPDATE FAVORITES UI
========================================================= */

function updateFavoritesUI() {

    const count =
        getFavoriteCount();


    const counters =
        document.querySelectorAll(
            "[data-favorites-count]"
        );


    counters.forEach(
        element => {

            element.textContent =
                count;

        }
    );


    const badge =
        document.querySelector(
            "#favorites-count"
        );


    if (badge) {

        badge.textContent =
            count;


        badge.classList.toggle(
            "hidden",
            count === 0
        );

    }


    renderFavorites();

}


/* =========================================================
   17. FAVORITE MESSAGE
========================================================= */

function showFavoriteMessage(
    message
) {

    if (
        window.RadioUI &&
        RadioUI.toast
    ) {

        RadioUI.toast(
            message
        );


        return;

    }


    /*
       Fallback if UI isn't loaded yet.
    */

    radioLog(
        message
    );

}


/* =========================================================
   18. EXPORT FAVORITES
========================================================= */

function exportFavorites() {

    const favorites =
        getFavorites();


    return JSON.stringify(
        favorites,
        null,
        2
    );

}


/* =========================================================
   19. IMPORT FAVORITES
========================================================= */

function importFavorites(
    json
) {

    try {

        const imported =
            typeof json ===
            "string"
                ? JSON.parse(json)
                : json;


        if (
            !Array.isArray(
                imported
            )
        ) {

            return false;

        }


        const existing =
            getFavorites();


        const combined = [
            ...existing,
            ...imported
        ];


        /*
           Remove duplicates.
        */

        const unique =
            combined.filter(
                (
                    station,
                    index,
                    array
                ) =>
                    array.findIndex(
                        item =>
                            item.id ===
                            station.id
                    ) === index
            );


        FavoritesState.stations =
            unique;


        saveFavorites();


        updateFavoritesUI();


        return true;

    }
    catch (error) {

        console.error(
            "Unable to import favorites:",
            error
        );


        return false;

    }

}


/* =========================================================
   20. ESCAPE HTML
========================================================= */

function escapeFavoriteHTML(
    value
) {

    return String(
        value ?? ""
    )
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


/* =========================================================
   21. PUBLIC FAVORITES API
========================================================= */

window.RadioFavorites = {

    init:
        initializeFavorites,

    add:
        addFavorite,

    remove:
        removeFavorite,

    toggle:
        toggleFavorite,

    has:
        isFavorite,

    get:
        getFavorites,

    count:
        getFavoriteCount,

    find:
        findFavorite,

    clear:
        clearFavorites,

    render:
        renderFavorites,

    play:
        playFavoriteStation,

    export:
        exportFavorites,

    import:
        importFavorites

};


/* =========================================================
   22. AUTO INITIALIZE
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initializeFavorites();

        }
    );

}
else {

    initializeFavorites();

}


/* =========================================================
   23. READY
========================================================= */

radioLog(
    "favorites.js loaded successfully."
);
