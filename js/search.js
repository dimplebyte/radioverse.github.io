/* =========================================================
   RADIO GLOBE
   search.js
   Station search + filters
   Made by Dimple Khangarot
========================================================= */


/* =========================================================
   01. SEARCH STATE
========================================================= */

const SearchState = {

    query: "",

    filter: "world",

    results: [],

    isSearching: false,

    timeout: null,

    requestId: 0

};


/* =========================================================
   02. INITIALIZE SEARCH
========================================================= */

function initializeSearch() {

    const input =
        document.querySelector(
            "#station-search"
        ) ||
        document.querySelector(
            ".station-search"
        );


    if (!input) {

        radioLog(
            "Search input not found."
        );

        return;

    }


    SearchState.input =
        input;


    input.addEventListener(
        "input",
        handleSearchInput
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                performStationSearch(
                    input.value
                );

            }

        }
    );


    /*
       Clear button
    */

    const clearButton =
        document.querySelector(
            "#search-clear"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearStationSearch
        );

    }


    /*
       Search button
    */

    const searchButton =
        document.querySelector(
            "#search-button"
        );


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                performStationSearch(
                    input.value
                );

            }
        );

    }


    /*
       Filter buttons
    */

    setupSearchFilters();


    radioLog(
        "Search initialized."
    );

}


/* =========================================================
   03. SEARCH INPUT
========================================================= */

function handleSearchInput(
    event
) {

    const query =
        event.target.value.trim();


    SearchState.query =
        query;


    updateSearchClearButton();


    clearTimeout(
        SearchState.timeout
    );


    /*
       Empty search
    */

    if (!query) {

        showDefaultStationResults();

        return;

    }


    /*
       Wait briefly before API call.
       Prevents request on every keystroke.
    */

    SearchState.timeout =
        setTimeout(
            () => {

                performStationSearch(
                    query
                );

            },
            RADIO_GLOBE_CONFIG
                .search
                .debounceDelay
        );

}


/* =========================================================
   04. PERFORM SEARCH
========================================================= */

async function performStationSearch(
    query
) {

    const text =
        String(
            query || ""
        ).trim();


    SearchState.query =
        text;


    updateSearchClearButton();


    if (!text) {

        showDefaultStationResults();

        return [];

    }


    const currentRequest =
        ++SearchState.requestId;


    SearchState.isSearching =
        true;


    showSearchLoading();


    try {

        let results = [];


        /*
           Rajasthan search
        */

        if (
            SearchState.filter ===
            "rajasthan"
        ) {

            results =
                await searchRajasthanStations(
                    text
                );

        }


        /*
           India search
        */

        else if (
            SearchState.filter ===
            "india"
        ) {

            results =
                await searchIndiaStations(
                    text
                );

        }


        /*
           World search
        */

        else {

            results =
                await searchRadioStations(
                    text,
                    {
                        limit:
                            RADIO_GLOBE_CONFIG
                                .search
                                .maximumResults
                    }
                );

        }


        /*
           Ignore old request.
        */

        if (
            currentRequest !==
            SearchState.requestId
        ) {

            return [];

        }


        SearchState.results =
            results || [];


        StationStore.currentResults =
            SearchState.results;


        renderSearchResults(
            SearchState.results
        );


        refreshSearchGlobe(
            SearchState.results
        );


        dispatchRadioEvent(
            RADIO_EVENTS.searchCompleted,
            {

                query:
                    text,

                results:
                    SearchState.results

            }
        );


        return SearchState.results;

    }
    catch (error) {

        console.error(
            "Station search failed:",
            error
        );


        SearchState.results =
            [];


        renderSearchError(
            "Unable to find stations right now."
        );


        return [];

    }
    finally {

        SearchState.isSearching =
            false;

    }

}


/* =========================================================
   05. SEARCH INDIA
========================================================= */

async function searchIndiaStations(
    query
) {

    let local =
        searchStations(
            query,
            {
                filter:
                    "india",

                limit:
                    25
            }
        );


    try {

        const api =
            await searchWorldStations(
                query,
                {
                    limit: 50
                }
            );


        const india =
            api.filter(
                station =>
                    isIndiaStation(
                        station
                    )
            );


        local =
            removeDuplicateStations(
                [
                    ...local,
                    ...india
                ]
            );

    }
    catch (error) {

        radioLog(
            "India API search failed:",
            error.message
        );

    }


    return local.slice(
        0,
        25
    );

}


/* =========================================================
   06. SEARCH FILTERS
========================================================= */

function setupSearchFilters() {

    const buttons =
        document.querySelectorAll(
            "[data-search-filter]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const filter =
                        button.dataset
                            .searchFilter;


                    setSearchFilter(
                        filter
                    );

                }
            );

        }
    );

}


/* =========================================================
   07. SET FILTER
========================================================= */

function setSearchFilter(
    filter
) {

    const allowed = [

        "world",

        "india",

        "rajasthan"

    ];


    if (
        !allowed.includes(
            filter
        )
    ) {

        filter = "world";

    }


    SearchState.filter =
        filter;


    updateFilterButtons();


    if (
        SearchState.query
    ) {

        performStationSearch(
            SearchState.query
        );

    }
    else {

        showDefaultStationResults();

    }


    dispatchRadioEvent(
        RADIO_EVENTS.filterChanged,
        {

            filter

        }
    );

}


/* =========================================================
   08. UPDATE FILTER BUTTONS
========================================================= */

function updateFilterButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-search-filter]"
        );


    buttons.forEach(
        button => {

            const active =
                button.dataset
                    .searchFilter ===
                SearchState.filter;


            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                active
            );

        }
    );

}


/* =========================================================
   09. DEFAULT RESULTS
========================================================= */

function showDefaultStationResults() {

    let results = [];


    if (
        SearchState.filter ===
        "rajasthan"
    ) {

        results =
            getRajasthanStations();

    }

    else if (
        SearchState.filter ===
        "india"
    ) {

        results =
            getIndiaStations();

    }

    else {

        results =
            StationStore.all;

    }


    SearchState.results =
        results.slice(
            0,
            25
        );


    StationStore.currentResults =
        SearchState.results;


    renderSearchResults(
        SearchState.results
    );


    refreshSearchGlobe(
        SearchState.results
    );

}


/* =========================================================
   10. RENDER RESULTS
========================================================= */

function renderSearchResults(
    stations
) {

    const container =
        document.querySelector(
            "#search-results"
        ) ||
        document.querySelector(
            ".search-results"
        );


    if (!container) {

        radioLog(
            "Search results container not found."
        );

        return;

    }


    container.innerHTML = "";


    if (
        !stations ||
        !stations.length
    ) {

        renderNoResults(
            container
        );

        return;

    }


    stations.forEach(
        (
            station,
            index
        ) => {

            const item =
                createStationResult(
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
   11. CREATE RESULT
========================================================= */

function createStationResult(
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
        "station-result";


    item.dataset.stationId =
        station.id;


    const rajasthan =
        isRajasthanStation(
            station
        );


    const flag =
        getCountryFlag(
            station.countryCode
        );


    item.innerHTML = `

        <span class="station-result-icon">
            ${flag}
        </span>

        <span class="station-result-info">

            <strong>
                ${escapeSearchHTML(
                    station.name
                )}
            </strong>

            <small>
                ${escapeSearchHTML(
                    station.city ||
                    station.state ||
                    station.country ||
                    "Unknown location"
                )}
            </small>

        </span>

        ${
            rajasthan
                ? `
                    <span class="station-rajasthan">
                        RAJASTHAN
                    </span>
                  `
                : ""
        }

    `;


    item.addEventListener(
        "click",
        () => {

            handleStationSelection(
                station,
                index
            );

        }
    );


    return item;

}


/* =========================================================
   12. SELECT STATION
========================================================= */

function handleStationSelection(
    station,
    index
) {

    if (!station) {
        return;
    }


    SearchState.results =
        SearchState.results || [];


    PlayerState.currentIndex =
        index;


    /*
       Focus globe
    */

    if (
        window.RadioGlobe &&
        RadioGlobe.focusStation
    ) {

        RadioGlobe.focusStation(
            station
        );

    }


    /*
       Load real station stream
    */

    if (
        window.RadioPlayer &&
        RadioPlayer.load
    ) {

        RadioPlayer.load(
            station,
            false
        );

    }


    /*
       Update UI
    */

    if (
        window.RadioUI &&
        RadioUI.showStation
    ) {

        RadioUI.showStation(
            station
        );

    }


    dispatchRadioEvent(
        RADIO_EVENTS.stationSelected,
        {

            station

        }
    );


    /*
       Report station click
    */

    if (
        window.RadioPlayer &&
        RadioPlayer.reportClick
    ) {

        RadioPlayer.reportClick();

    }

}


/* =========================================================
   13. CLEAR SEARCH
========================================================= */

function clearStationSearch() {

    if (
        SearchState.input
    ) {

        SearchState.input.value =
            "";

    }


    SearchState.query =
        "";


    SearchState.results =
        [];


    updateSearchClearButton();


    showDefaultStationResults();


    if (
        SearchState.input
    ) {

        SearchState.input.focus();

    }

}


/* =========================================================
   14. CLEAR BUTTON
========================================================= */

function updateSearchClearButton() {

    const button =
        document.querySelector(
            "#search-clear"
        );


    if (!button) {
        return;
    }


    button.classList.toggle(
        "visible",
        Boolean(
            SearchState.query
        )
    );

}


/* =========================================================
   15. LOADING
========================================================= */

function showSearchLoading() {

    const container =
        document.querySelector(
            "#search-results"
        ) ||
        document.querySelector(
            ".search-results"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="search-loading">

            <span class="search-spinner"></span>

            <span>
                Finding radio stations...
            </span>

        </div>

    `;

}


/* =========================================================
   16. NO RESULTS
========================================================= */

function renderNoResults(
    container
) {

    container.innerHTML = `

        <div class="search-empty">

            <div class="search-empty-icon">
                ◌
            </div>

            <strong>
                No stations found
            </strong>

            <span>
                Try another station,
                city or country.
            </span>

        </div>

    `;

}


/* =========================================================
   17. SEARCH ERROR
========================================================= */

function renderSearchError(
    message
) {

    const container =
        document.querySelector(
            "#search-results"
        ) ||
        document.querySelector(
            ".search-results"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="search-empty">

            <div class="search-empty-icon">
                !
            </div>

            <strong>
                Search unavailable
            </strong>

            <span>
                ${escapeSearchHTML(
                    message
                )}
            </span>

        </div>

    `;

}


/* =========================================================
   18. REFRESH GLOBE
========================================================= */

function refreshSearchGlobe(
    stations
) {

    if (
        window.RadioGlobe &&
        RadioGlobe.refreshStations
    ) {

        RadioGlobe.refreshStations(
            stations
        );

    }

}


/* =========================================================
   19. HIGHLIGHT ACTIVE STATION
========================================================= */

function highlightSearchStation(
    stationId
) {

    const items =
        document.querySelectorAll(
            ".station-result"
        );


    items.forEach(
        item => {

            item.classList.toggle(
                "selected",
                item.dataset.stationId ===
                stationId
            );

        }
    );

}


/* =========================================================
   20. ESCAPE HTML
========================================================= */

function escapeSearchHTML(
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
   21. COUNTRY FLAG
========================================================= */

function getCountryFlag(
    countryCode
) {

    if (
        !countryCode
    ) {

        return "📻";

    }


    const code =
        String(
            countryCode
        ).toUpperCase();


    if (
        !/^[A-Z]{2}$/.test(
            code
        )
    ) {

        return "📻";

    }


    return String.fromCodePoint(

        ...[...code].map(
            character =>
                127397 +
                character.charCodeAt(0)
        )

    );

}


/* =========================================================
   22. SEARCH BY COUNTRY
========================================================= */

async function searchByCountry(
    country
) {

    if (!country) {
        return [];
    }


    SearchState.filter =
        "world";


    showSearchLoading();


    try {

        const stations =
            await getStationsByCountry(
                country,
                {
                    limit: 100
                }
            );


        SearchState.results =
            stations;


        StationStore.currentResults =
            stations;


        renderSearchResults(
            stations
        );


        refreshSearchGlobe(
            stations
        );


        return stations;

    }
    catch (error) {

        renderSearchError(
            "Could not load country stations."
        );


        return [];

    }

}


/* =========================================================
   23. SEARCH BY CITY
========================================================= */

async function searchByCity(
    city
) {

    if (!city) {
        return [];
    }


    return performStationSearch(
        cit
    );

}


/* =========================================================
   24. SEARCH BY RAJASTHAN CITY
========================================================= */

async function searchRajasthanCity(
    city
) {

    SearchState.filter =
        "rajasthan";


    return performStationSearch(
        city
    );

}


/* =========================================================
   25. PUBLIC SEARCH API
========================================================= */

window.RadioSearch = {

    init:
        initializeSearch,

    search:
        
