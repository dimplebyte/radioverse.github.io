/* =========================================================
   RADIO GLOBE
   intro.js
   Opening animation controller
   Made by Dimple Khangarot
========================================================= */


/* =========================================================
   01. INTRO STATE
========================================================= */

const IntroState = {

    started: false,

    finished: false,

    skipped: false

};


/* =========================================================
   02. INITIALIZE INTRO
========================================================= */

function initializeIntro() {

    const intro =
        document.querySelector(
            "#intro-screen"
        ) ||
        document.querySelector(
            ".intro-screen"
        );


    if (!intro) {

        radioLog(
            "Intro screen not found."
        );

        showMainWebsite();

        return;

    }


    IntroState.started =
        true;


    /*
       Prevent scrolling during intro.
    */

    document.body.classList.add(
        "intro-active"
    );


    /*
       Make sure intro is visible.
    */

    intro.classList.remove(
        "intro-hidden"
    );


    intro.classList.add(
        "intro-visible"
    );


    setupIntroElements(
        intro
    );


    setupIntroSkip(
        intro
    );


    /*
       Start animation sequence.
    */

    requestAnimationFrame(
        () => {

            startIntroAnimation(
                intro
            );

        }
    );


    radioLog(
        "RADIO GLOBE intro started."
    );

}


/* =========================================================
   03. SETUP INTRO ELEMENTS
========================================================= */

function setupIntroElements(
    intro
) {

    const title =
        intro.querySelector(
            ".intro-title"
        );


    const subtitle =
        intro.querySelector(
            ".intro-subtitle"
        );


    const globe =
        intro.querySelector(
            ".intro-globe"
        );


    const stars =
        intro.querySelector(
            ".intro-stars"
        );


    if (title) {

        title.classList.add(
            "intro-title-ready"
        );

    }


    if (subtitle) {

        subtitle.classList.add(
            "intro-subtitle-ready"
        );

    }


    if (globe) {

        globe.classList.add(
            "intro-globe-ready"
        );

    }


    if (stars) {

        stars.classList.add(
            "intro-stars-ready"
        );

    }

}


/* =========================================================
   04. START INTRO ANIMATION
========================================================= */

function startIntroAnimation(
    intro
) {

    /*
       Phase 1
       Background appears
    */

    intro.classList.add(
        "intro-phase-one"
    );


    setTimeout(
        () => {

            if (
                IntroState.finished
            ) {

                return;

            }


            /*
               Phase 2
               Globe appears
            */

            intro.classList.add(
                "intro-phase-two"
            );

        },
        350
    );


    setTimeout(
        () => {

            if (
                IntroState.finished
            ) {

                return;

            }


            /*
               Phase 3
               Title appears
            */

            intro.classList.add(
                "intro-phase-three"
            );

        },
        850
    );


    setTimeout(
        () => {

            if (
                IntroState.finished
            ) {

                return;

            }


            /*
               Phase 4
               Subtitle appears
            */

            intro.classList.add(
                "intro-phase-four"
            );

        },
        1450
    );


    setTimeout(
        () => {

            if (
                IntroState.finished
            ) {

                return;

            }


            /*
               Phase 5
               Finish intro
            */

            intro.classList.add(
                "intro-phase-five"
            );

        },
        2400
    );


    /*
       Automatically enter website.
    */

    setTimeout(
        () => {

            if (
                !IntroState.finished
            ) {

                finishIntro();

            }

        },
        3300
    );

}


/* =========================================================
   05. SKIP INTRO
========================================================= */

function setupIntroSkip(
    intro
) {

    const skipButton =
        intro.querySelector(
            "#skip-intro"
        ) ||
        intro.querySelector(
            ".skip-intro"
        );


    if (!skipButton) {

        return;

    }


    skipButton.addEventListener(
        "click",
        event => {

            event.preventDefault();


            IntroState.skipped =
                true;


            finishIntro();

        }
    );

}


/* =========================================================
   06. FINISH INTRO
========================================================= */

function finishIntro() {

    if (
        IntroState.finished
    ) {

        return;

    }


    IntroState.finished =
        true;


    const intro =
        document.querySelector(
            "#intro-screen"
        ) ||
        document.querySelector(
            ".intro-screen"
        );


    if (!intro) {

        showMainWebsite();

        return;

    }


    /*
       Start exit animation.
    */

    intro.classList.add(
        "intro-exiting"
    );


    /*
       Wait for CSS transition.
    */

    setTimeout(
        () => {

            intro.classList.remove(
                "intro-visible"
            );


            intro.classList.add(
                "intro-hidden"
            );


            document.body.classList.remove(
                "intro-active"
            );


            showMainWebsite();


            dispatchRadioEvent(
                RADIO_EVENTS.introFinished,
                {

                    skipped:
                        IntroState.skipped

                }
            );

        },
        850
    );

}


/* =========================================================
   07. SHOW MAIN WEBSITE
========================================================= */

function showMainWebsite() {

    const app =
        document.querySelector(
            "#app"
        ) ||
        document.querySelector(
            ".app"
        );


    if (!app) {

        return;

    }


    app.classList.add(
        "app-visible"
    );


    app.classList.remove(
        "app-hidden"
    );


    /*
       Start globe after intro.
    */

    if (
        window.RadioGlobe &&
        RadioGlobe.init
    ) {

        if (
            !RadioGlobe.state.initialized
        ) {

            RadioGlobe.init();

        }


        RadioGlobe.rotate();

    }


    /*
       Initialize player.
    */

    if (
        window.RadioPlayer &&
        RadioPlayer.init
    ) {

        RadioPlayer.init();

    }


    /*
       Initialize search.
    */

    if (
        window.RadioSearch &&
        RadioSearch.init
    ) {

        RadioSearch.init();

    }


    /*
       Initialize UI.
    */

    if (
        window.RadioUI &&
        RadioUI.init
    ) {

        RadioUI.init();

    }


    /*
       Load default stations.
    */

    if (
        typeof showDefaultStationResults ===
        "function"
    ) {

        showDefaultStationResults();

    }


    radioLog(
        "Main RADIO GLOBE interface ready."
    );

}


/* =========================================================
   08. REPLAY INTRO
========================================================= */

function replayIntro() {

    const intro =
        document.querySelector(
            "#intro-screen"
        ) ||
        document.querySelector(
            ".intro-screen"
        );


    if (!intro) {

        return;

    }


    IntroState.finished =
        false;


    IntroState.skipped =
        false;


    intro.classList.remove(
        "intro-hidden",
        "intro-exiting",
        "intro-phase-one",
        "intro-phase-two",
        "intro-phase-three",
        "intro-phase-four",
        "intro-phase-five"
    );


    intro.classList.add(
        "intro-visible"
    );


    document.body.classList.add(
        "intro-active"
    );


    startIntroAnimation(
        intro
    );

}


/* =========================================================
   09. INTRO STATUS
========================================================= */

function getIntroStatus() {

    return {

        started:
            IntroState.started,

        finished:
            IntroState.finished,

        skipped:
            IntroState.skipped

    };

}


/* =========================================================
   10. PUBLIC INTRO API
========================================================= */

window.RadioIntro = {

    init:
        initializeIntro,

    finish:
        finishIntro,

    replay:
        replayIntro,

    status:
        getIntroStatus

};


/* =========================================================
   11. AUTO START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initializeIntro();

        }
    );

}
else {

    initializeIntro();

}


/* =========================================================
   12. READY
========================================================= */

radioLog(
    "intro.js loaded successfully."
);
