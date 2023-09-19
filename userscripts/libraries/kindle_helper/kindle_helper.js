"use strict";
const VERSION = "0.1.0";
let buttons = [];
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitForElement = (selector) => {
    // from: https://stackoverflow.com/a/61511955
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
};
let loggingEnabled = true;
const log = (message) => {
    if (loggingEnabled)
        console.log(`Kindle Helper v${VERSION} - ${message}`);
};
const updateEventListeners = () => {
    const searchButton = $("#search-button > div");
    if (searchButton) {
        searchButton.removeEventListener("click", KindleHelper);
        searchButton.addEventListener("click", KindleHelper);
    }
    getCheckboxes().map((checkbox) => {
        checkbox.removeEventListener("click", updateButtons);
        checkbox.addEventListener("click", updateButtons);
    });
    $$("#pagination .page-item").forEach((button) => {
        button.addEventListener("click", KindleHelper);
    });
};
const updateButtons = () => {
    buttons.map((button) => {
        if (button.followSelection) {
            button.baseButton.style.opacity =
                getSelectedBooks().length > 0 ? "1.0" : "0.25";
        }
    });
};
/**
 * Adds a button to the Button Bar.
 *
 * @param id              The CSS id for the button
 * @param label           The label of the button
 * @param listener        The function that should be called when the button is pressed
 * @param followSelection Override in case the btton should always be available
 * @returns               The button element
 */
const addButton = async (id, label, listener, followSelection = true) => {
    waitForElement("#SELECT-ALL").then((e) => {
        const baseButton = document.createElement("div");
        baseButton.className = "action_button";
        baseButton.id = id;
        baseButton.innerText = label;
        baseButton.style.cssText = e.style.cssText + "font-size: 13px;";
        baseButton.style.width = "auto";
        baseButton.style.padding = "0px 5px";
        if (followSelection) {
            baseButton.style.opacity = getSelectedBooks().length > 0 ? "1.0" : "0.25";
        }
        baseButton.style.marginLeft = "0.8rem";
        baseButton.addEventListener("click", listener);
        $("#FLOATING_TASK_BAR > div.filter-container > div.content-filter-item")?.append(baseButton);
        if (!buttons.find((button) => button.id === id)) {
            buttons.push({ id, baseButton, label, listener, followSelection });
        }
        return new Promise((resolve) => {
            return resolve(baseButton);
        });
    });
};
const getCheckboxes = () => [...$$("[type=checkbox]")].filter((checkbox) => checkbox.id.includes("KindleEBook"));
const getAsinFromCheckbox = (checkbox) => checkbox.id.replace(":KindleEBook", "");
/**
 * Gets all visible books.
 * @returns string[]: An array containing ASINs
 */
const getAllBooks = () => getCheckboxes().map((c) => getAsinFromCheckbox(c));
/**
 * Gets only the selected books.
 * @returns string[]: An array containing ASINs
 */
const getSelectedBooks = () => getCheckboxes()
    .filter((c) => c.checked)
    .map((c) => getAsinFromCheckbox(c));
const getBookInformationRows = (asin) => {
    const TITLE = $(`#content-title-${asin}`);
    return TITLE?.parentElement?.querySelectorAll(".information_row span");
};
/**
 * Checks if the book with specified ASIN is from a library. (f.ex B003PPDIC4)
 * @param asin
 */
const isLibraryBook = (asin) => {
    for (const row of getBookInformationRows(asin)) {
        if (row.innerText.match(/This book (was|is) a Kindle digital library loan/))
            return true;
    }
    return false;
};
/**
 * Checks if the loan period of the book with specified ASIN has expired. (f.ex B07DTLQJPK)
 * @param asin
 */
const isExpiredLibraryBook = (asin) => {
    for (const row of getBookInformationRows(asin)) {
        if (row.innerText.match(/Expired on/))
            return true;
    }
    return false;
};
/**
 * Downloads a book based on the specified ASIN (f.ex B01MYZ8X5C)
 * @param asin
 */
const downloadBook = async (asin) => {
    await waitForElement(`#download_and_transfer_list_${asin}_0`).then((obj) => obj.click());
    await waitForElement(`#DOWNLOAD_AND_TRANSFER_ACTION_${asin}_CONFIRM > span`).then((obj) => obj.click());
    await waitForElement("#notification-close").then((obj) => obj.click());
    await sleep(1500);
};
/**
 * Deletes a book based on the specified ASIN (f.ex B0727TNBTY)
 * @param asin
 */
const deleteBook = async (asin) => {
    const BUTTON = $(`DELETE_TITLE_ACTION_${asin}`);
    BUTTON?.click();
    await sleep(1500);
};
/**
 * Returns a book based on the specified ASIN (f.ex B002RI9KAE)
 * @param asin
 */
const removeExpiredBook = async (asin) => {
    if (isLibraryBook(asin) && isExpiredLibraryBook(asin))
        deleteBook(asin);
};
/**
 * Returns a book based on the ASIN (f.ex B00Y7RWXHU)
 * @param asin
 */
const returnBook = async (asin) => {
    const BUTTON = $(`RETURN_CONTENT_ACTION_${asin}_CONFIRM`);
    if (isLibraryBook(asin))
        BUTTON?.click();
    await sleep(1500);
};
/**
 * Instantiates the Kindle Helper
 *
 * Example usage in f.ex Tampermonkey:
 * ```javascript
 * ... SNIP ...
 *
 * // @match           https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/dateDsc/*
 * // @require         https://github.com/husjon/tampermonkey/blob/main/userscripts/libraries/kindle_helper/kindle_helper.js
 * // ==/UserScript==
 *
 * (async function () {
 *     KindleHelper().then(async (KH) => { // Instantiates the helper
 *
 *         async function downloadBooks() { // Example callback function
 *             for (const book of KH.getSelectedBooks()) {
 *                 await KH.downloadBook(book);
 *             }
 *         }
 *
 *         let download_button = KH.addButton("DOWNLOAD", "Download", downloadBooks);
 *         //                                  ^ id        ^ label    ^ function reference
 *     });
 * })();
 * ```
 * @returns Promise with helper functions
 */
async function KindleHelper() {
    const KINDLE_HELPER = {
        addButton,
        getAllBooks,
        getSelectedBooks,
        isLibraryBook,
        isExpiredLibraryBook,
        deleteBook,
        downloadBook,
        removeExpiredBook,
        returnBook,
    };
    return new Promise(async (resolve) => {
        log("Initializing");
        await sleep(200);
        await waitForElement("#CONTENT_LIST").then(() => {
            updateEventListeners();
            for (const button of buttons) {
                addButton(button.id, button.label, button.listener);
            }
            log("Initialized");
            resolve(KINDLE_HELPER);
        });
    });
}
