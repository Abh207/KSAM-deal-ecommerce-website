/* =====================================================
   FLASH SALE COUNTDOWN
===================================================== */


/*
    Get HTML elements
*/

const daysElement =
    document.querySelector("#days");

const hoursElement =
    document.querySelector("#hours");

const minutesElement =
    document.querySelector("#minutes");

const secondsElement =
    document.querySelector("#seconds");


/*
    Storage key

    This allows the timer to continue
    even after refreshing the page.
*/

const timerStorageKey =
    "ksamdeal_flash_sale_end_time";


/*
    Check whether a timer already exists
*/

let endTime =
    localStorage.getItem(
        timerStorageKey
    );


/*
    If there is no previous timer,
    create a new 4 day timer.

    4 days
    + 14 hours
    + 48 minutes
    + 18 seconds
*/

if (!endTime) {

    const now =
        Date.now();


    const fourDays =
        4 * 24 * 60 * 60 * 1000;


    const fourteenHours =
        14 * 60 * 60 * 1000;


    const fortyEightMinutes =
        48 * 60 * 1000;


    const eighteenSeconds =
        18 * 1000;


    const totalTime =
        fourDays +
        fourteenHours +
        fortyEightMinutes +
        eighteenSeconds;


    endTime =
        now + totalTime;


    localStorage.setItem(
        timerStorageKey,
        endTime
    );

}


/*
    Convert milliseconds
    into Days / Hours / Minutes / Seconds
*/

function updateTimer() {


    const now =
        Date.now();


    const remainingTime =
        Number(endTime) - now;


    /*
        If timer is finished
    */

    if (remainingTime <= 0) {

        daysElement.textContent = "00";

        hoursElement.textContent = "00";

        minutesElement.textContent = "00";

        secondsElement.textContent = "00";


        /*
            Stop the timer
        */

        clearInterval(timerInterval);


        /*
            Optional:
            Start a new sale automatically.

            Remove this section if you
            don't want the timer to restart.
        */

        const newSaleDuration =
            4 * 24 * 60 * 60 * 1000;


        endTime =
            Date.now() +
            newSaleDuration;


        localStorage.setItem(
            timerStorageKey,
            endTime
        );


        /*
            Start counting again
        */

        updateTimer();


        return;
    }


    /*
        Calculate days
    */

    const days =
        Math.floor(
            remainingTime /
            (1000 * 60 * 60 * 24)
        );


    /*
        Calculate hours
    */

    const hours =
        Math.floor(
            (remainingTime %
                (1000 * 60 * 60 * 24))
            /
            (1000 * 60 * 60)
        );


    /*
        Calculate minutes
    */

    const minutes =
        Math.floor(
            (remainingTime %
                (1000 * 60 * 60))
            /
            (1000 * 60)
        );


    /*
        Calculate seconds
    */

    const seconds =
        Math.floor(
            (remainingTime %
                (1000 * 60))
            /
            1000
        );


    /*
        Display values
    */

    daysElement.textContent =
        String(days).padStart(2, "0");


    hoursElement.textContent =
        String(hours).padStart(2, "0");


    minutesElement.textContent =
        String(minutes).padStart(2, "0");


    secondsElement.textContent =
        String(seconds).padStart(2, "0");

}


/*
    Run immediately
*/

updateTimer();


/*
    Update every second
*/

const timerInterval =
    setInterval(
        updateTimer,
        1000
    );