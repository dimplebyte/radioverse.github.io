/* =========================================================
   RADIO GLOBE
   ui.js
   Main interface controller
   Made by Dimple Khangarot
========================================================= */


/* =========================================================
   01. UI STATE
========================================================= */

const UIState = {

    currentStation: null,

    playerStatus: "idle",

    liked: false,

    theme: "night"

};


/* =========================================================
   02. INITIALIZE UI
========================================================= */

function initializeUI() {

    setupPlayerButtons();

    setupVolumeControls();

    setupLikeButton();

    setupLocationButtons();

    setupPlayerEvents();

    setupStationEvents();

    updatePlayerInterface();

    radioLog(
        "UI initialized successfully."
    );

}


/* =========================================================
   03. PLAYER BUTTONS
========================================================= */

function setupPlayerButtons() {

    const playButton =
        document.querySelector(
            "#play-button"
        ) ||
        document.querySelector(
            "[data-player='play']"
        );


    if (playButton) {

        playButton.addEventListener(
            "click",
            async () => {

                await RadioPlayer.toggle();

            }
        );

    }


    const pauseButton =
        document.querySelector(
            "#pause-button"
        );


    if (pauseButton) {

        pauseButton.addEventListener(
            "click",
            () => {

                RadioPlayer.pause();

            }
        );

    }


    const nextButton =
        document.querySelector(
            "#next-button"
        ) ||
        document.querySelector(
            "[data-player='next']"
        );


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                RadioPlayer.next();

            }
        );

    }


    const previousButton =
        document.querySelector(
            "#previous-button"
        ) ||
        document.querySelector(
            "[data-player='previous']"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                RadioPlayer.previous();

            }
        );

    }

}


/* =========================================================
   04. VOLUME CONTROLS
========================================================= */

function setupVolumeControls() {

    const slider =
        document.querySelector(
            "#volume-slider"
        );


    if (slider) {

        slider.addEventListener(
            "input",
            event => {

                RadioPlayer.volume(
                    Number(
                        event.target.value
                    )
                );

            }
        );


        slider.value =
            RadioPlayer.state.volume;

    }


    const muteButton =
        document.querySelector(
            "#mute-button"
        );


    if (muteButton) {

        muteButton.addEventListener(
            "click",
            () => {

                RadioPlayer.mute();

            }
        );

    }

}


/* =========================================================
   05. LIKE BUTTON
========================================================= */

function setupLikeButton() {

    const button =
        document.querySelector(
            "#like-button"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            if (
                !UIState.currentStation
            ) {

                return;

            }


            const liked =
                toggleFavorite(
                    UIState.currentStation
                );


            UIState.liked =
                liked;


            updateLikeButton(
                liked
            );

        }
    );

}


/* =========================================================
   06. LOCATION BUTTONS
========================================================= */

function setupLocationButtons() {

    const worldButton =
        document.querySelector(
            "#world
