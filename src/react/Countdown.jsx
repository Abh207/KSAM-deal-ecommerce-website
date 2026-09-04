import React, { useEffect, useState } from "react";

const SALE_STORAGE_KEY = "ksamdeal_beauty_sale_end";

const getInitialEndTime = () => {
    const savedEndTime = localStorage.getItem(SALE_STORAGE_KEY);

    if (savedEndTime && Number(savedEndTime) > Date.now()) {
        return Number(savedEndTime);
    }

    // 5 days + 12 hours + 30 minutes + 25 seconds
    const duration =
        (5 * 24 * 60 * 60 * 1000) +
        (12 * 60 * 60 * 1000) +
        (30 * 60 * 1000) +
        (25 * 1000);

    const newEndTime = Date.now() + duration;

    localStorage.setItem(
        SALE_STORAGE_KEY,
        newEndTime.toString()
    );

    return newEndTime;
};

const Countdown = () => {
    const [endTime, setEndTime] = useState(getInitialEndTime());
    const [timeLeft, setTimeLeft] = useState(
        Math.max(0, endTime - Date.now())
    );

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = endTime - Date.now();

            if (remaining <= 0) {
                // Start a new 5-day sale
                const newDuration = 5 * 24 * 60 * 60 * 1000;
                const newEndTime = Date.now() + newDuration;

                localStorage.setItem(
                    SALE_STORAGE_KEY,
                    newEndTime.toString()
                );

                setEndTime(newEndTime);
                setTimeLeft(newDuration);

                return;
            }

            setTimeLeft(remaining);
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    const totalSeconds = Math.floor(timeLeft / 1000);

    const days = Math.floor(totalSeconds / (24 * 60 * 60));

    const hours = Math.floor(
        (totalSeconds % (24 * 60 * 60)) / (60 * 60)
    );

    const minutes = Math.floor(
        (totalSeconds % (60 * 60)) / 60
    );

    const seconds = totalSeconds % 60;

    const formatNumber = (number) => {
        return String(number).padStart(2, "0");
    };

    return (
        <div className="beauty-countdown">

            <p className="beauty-countdown-label">
                LIMITED TIME OFFER
            </p>

            <h2>
                Sale Ends In
            </h2>

            <div className="beauty-countdown-timer">

                <div className="beauty-time-box">
                    <strong>{formatNumber(days)}</strong>
                    <span>Days</span>
                </div>

                <span className="beauty-time-separator">:</span>

                <div className="beauty-time-box">
                    <strong>{formatNumber(hours)}</strong>
                    <span>Hours</span>
                </div>

                <span className="beauty-time-separator">:</span>

                <div className="beauty-time-box">
                    <strong>{formatNumber(minutes)}</strong>
                    <span>Minutes</span>
                </div>

                <span className="beauty-time-separator">:</span>

                <div className="beauty-time-box">
                    <strong>{formatNumber(seconds)}</strong>
                    <span>Seconds</span>
                </div>

            </div>

        </div>
    );
};

export default Countdown;