// ==UserScript==
// @name         YouTube - Auto Max Quality (Hourly Check)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Automatically sets YouTube video quality to highest on load, then checks hourly.
// @author       Nima
// @match        *://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @license      MIT
// @updateURL    https://gist.github.com/YOUR_GIST_URL/raw/youtube_max_quality_hourly.user.js  // Optional
// @downloadURL  https://gist.github.com/YOUR_GIST_URL/raw/youtube_max_quality_hourly.user.js  // Optional
// ==/UserScript==

(function() {
    'use strict';

    // --- Configuration ---
    const CHECK_INTERVAL_MS = 3600000; // How often to check/set quality (in milliseconds). 3600000 = 1 hour.
    const CLICK_DELAY_MS = 600;     // Delay between simulated clicks (ms). Increase if menus don't open reliably.
    const INITIAL_DELAY_MS = 5000;  // How long to wait after page load/navigation before the first check (ms). 5000 = 5 seconds.
    const DEBUG_MODE = false;       // Set to true to see console logs for debugging.
    // ---------------------

    let qualityCheckInterval = null;
    let isProcessing = false; // Flag to prevent overlapping executions

    function log(message) {
        if (DEBUG_MODE) {
            console.log("[YT Max Quality Hourly] " + message);
        }
    }

    function getHighestQualityOption() {
        log("Searching for quality options...");
        // Find all available quality options in the currently open menu
        const qualityOptions = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem');
        if (!qualityOptions || qualityOptions.length === 0) {
            log("Quality options menu items not found.");
            return null;
        }

        let highestQualityOption = null;
        let maxQuality = 0;

        qualityOptions.forEach(option => {
            const qualityText = option.querySelector('.ytp-menuitem-label')?.textContent;
            if (qualityText) {
                const match = qualityText.match(/^(\d+)/);
                if (match) {
                    const qualityValue = parseInt(match[1], 10);
                    log(`Found quality option: ${qualityText} (${qualityValue}p)`);
                    if (qualityValue > maxQuality) {
                        maxQuality = qualityValue;
                        highestQualityOption = option;
                        log(`New highest quality found: ${maxQuality}p`);
                    }
                } else {
                    log(`Could not parse quality value from: ${qualityText}`);
                }
            }
        });

        if (!highestQualityOption) {
            log("Could not identify the highest quality option element.");
        }

        return highestQualityOption;
    }

    function setMaxQuality() {
        if (isProcessing) {
            log("Already processing, skipping interval check.");
            return;
        }
        isProcessing = true;
        log("--- Starting quality check ---");

        // --- 1. Find and Click Settings Button ---
        const settingsButton = document.querySelector('.ytp-settings-button');
        if (!settingsButton) {
            log("Settings button not found.");
            isProcessing = false;
            return;
        }
        settingsButton.click();
        log("Clicked settings button.");

        // --- 2. Wait and Click Quality Menu Item ---
        setTimeout(() => {
            const menuItems = document.querySelectorAll('.ytp-popup .ytp-menuitem');
            let qualityMenuItem = null;
            const qualityKeywords = ['Quality', 'Qualität']; // Add keywords for other languages if needed

            menuItems.forEach(item => {
                const label = item.querySelector('.ytp-menuitem-label');
                if (label && qualityKeywords.some(keyword => label.textContent.includes(keyword))) {
                    qualityMenuItem = item;
                    log(`Found quality menu item: "${label.textContent.trim()}"`);
                }
            });

            if (!qualityMenuItem) {
                log("Quality menu item not found. Closing settings menu.");
                if (settingsButton && document.querySelector('.ytp-popup.ytp-settings-menu')) {
                    settingsButton.click();
                }
                isProcessing = false;
                return;
            }

            qualityMenuItem.click();
            log("Clicked quality menu item.");

            // --- 3. Wait and Select Highest Quality Option ---
            setTimeout(() => {
                const highestOption = getHighestQualityOption();

                if (highestOption) {
                    if (highestOption.getAttribute('aria-checked') === 'true') {
                        log(`Highest quality (${highestOption.querySelector('.ytp-menuitem-label')?.textContent}) is already selected.`);
                        if (settingsButton && document.querySelector('.ytp-popup.ytp-settings-menu')) {
                            settingsButton.click();
                            log("Closed settings menu (quality was already highest).");
                        }
                    } else {
                        log(`Clicking highest quality option: ${highestOption.querySelector('.ytp-menuitem-label')?.textContent}`);
                        highestOption.click();
                        log("Selected highest quality.");
                    }
                } else {
                    log("Could not find/select the highest quality option. Closing settings menu.");
                    if (settingsButton && document.querySelector('.ytp-popup.ytp-settings-menu')) {
                        settingsButton.click();
                    }
                }
                isProcessing = false; // Finished processing cycle

            }, CLICK_DELAY_MS); // Delay for quality options menu

        }, CLICK_DELAY_MS); // Delay for settings menu
    }


    // --- Script Initialization ---

    function init() {
        log("Script initializing...");

        if (qualityCheckInterval) {
            clearInterval(qualityCheckInterval);
            log("Cleared existing interval.");
        }
        isProcessing = false;

        log(`Waiting ${INITIAL_DELAY_MS}ms for initial check.`);
        setTimeout(() => {
            log("Running initial quality check.");
            setMaxQuality(); // Run the check once after the initial delay

            // Start the periodic check *after* the initial check has run
            log(`Starting periodic check every ${CHECK_INTERVAL_MS / 1000 / 60} minutes.`); // Log interval in minutes
            qualityCheckInterval = setInterval(setMaxQuality, CHECK_INTERVAL_MS); // Check every hour

        }, INITIAL_DELAY_MS);
    }


    // --- Navigation Handling ---
    let lastTitle = document.title;
    let lastUrl = window.location.href;

    const navigationObserver = new MutationObserver(() => {
        // Check if URL changed to a new video or if title changed significantly
        if (window.location.href !== lastUrl && window.location.pathname === '/watch') {
            log("URL changed to a new watch page. Re-initializing script.");
            lastUrl = window.location.href;
            lastTitle = document.title;
            init(); // Re-run the initialization
        }
        else if (document.title !== lastTitle && window.location.pathname === '/watch') {
            log("Document title changed. Re-initializing script.");
            lastTitle = document.title;
            init(); // Re-run the initialization
        }
    });

    const titleElement = document.querySelector('head > title');
    if (titleElement) {
        navigationObserver.observe(titleElement, { childList: true });
        log("Navigation observer attached to title.");
    } else {
        log("Could not find title element to attach navigation observer. Using URL interval fallback.");
        setInterval(() => {
            if (window.location.href !== lastUrl && window.location.pathname === '/watch') {
                log("URL changed detected via interval. Re-initializing script.");
                lastUrl = window.location.href;
                lastTitle = document.title;
                init();
            }
        }, 2000);
    }

    // Initial run when the script is first injected
    init();

})();