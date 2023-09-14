// ==UserScript==
// @name            Kindle Helper
// @namespace       https://github.com/husjon/tampermonkey
// @version         0.4.0
// @description     Helper script for Kindle Content
// @author          @husjon
// @updateURL       https://github.com/husjon/tampermonkey/raw/main/kindle_download_books.js
// @downloadURL     https://github.com/husjon/tampermonkey/raw/main/kindle_download_books.js
// @supportURL      https://github.com/husjon/tampermonkey/issues/new?title=Kindle%20Download%20v0.4.0%20-%20
// @match           https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/*
// @icon            https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant           none
// ==/UserScript==

(function () {
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const BUTTONS_CONTAINER_SELECTOR =
    "#FLOATING_TASK_BAR > div.filter-container > div.content-filter-item";
  let buttonsCSSText = "";

  const DOWNLOAD_BUTTON = document.createElement("div");
  const REMOVE_EXPIRED_BUTTON = document.createElement("div");

  function waitForElement(selector: string): Promise<HTMLElement> {
    // from: https://stackoverflow.com/a/61511955

    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector) as HTMLElement);
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector) as HTMLElement);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  function getCheckboxes() {
    return [...$$("[type=checkbox]")].filter((checkbox) =>
      checkbox.id.includes("KindleEBook"),
    ) as HTMLInputElement[];
  }

  function getBooks(getAllBooks = true): string[] {
    const checkboxes = getAllBooks
      ? getCheckboxes()
      : getCheckboxes().filter((c) => c.checked);

    return checkboxes.map((c) => {
      return c.id.replace(":KindleEBook", "");
    });
  }

  const getSelectedBooks = () => getBooks(false);

  function addButton(
    base_button: HTMLElement,
    id: string,
    text: string,
    listener: any,
  ) {
    base_button.className = "action_button";
    base_button.id = id;
    base_button.innerText = text;
    base_button.style.cssText = buttonsCSSText;
    base_button.style.width = "auto";
    base_button.style.padding = "0px 5px";
    base_button.style.opacity = getSelectedBooks().length > 0 ? "1.0" : "0.25";
    base_button.style.marginLeft = "0.8rem";

    base_button.addEventListener("click", listener);

    $(BUTTONS_CONTAINER_SELECTOR)?.append(base_button);
  }

  function updateButtons() {
    DOWNLOAD_BUTTON.style.opacity =
      getSelectedBooks().length > 0 ? "1.0" : "0.25";
    REMOVE_EXPIRED_BUTTON.style.opacity =
      getSelectedBooks().length > 0 ? "1.0" : "0.25";
  }

  function updateEventListeners() {
    let all_checkboxes = [...$$("[type=checkbox]")].filter((checkbox) =>
      checkbox.id.includes("KindleEBook"),
    );

    all_checkboxes.map((element) => {
      element.removeEventListener("change", updateButtons);
      element.addEventListener("change", updateButtons);
    });

    const searchButton = $("#search-button > div");
    if (searchButton) {
      searchButton.removeEventListener("click", initialize);
      searchButton.addEventListener("click", initialize);
    }

    $$("#pagination .page-item").forEach((button) => {
      button.addEventListener("click", initialize);
    });
  }

  async function removeExpiredBooks() {
    for (const asin of getBooks()) {
      await removeExpiredBook(asin);
    }

    const ORIGINAL_BUTTON_TEXT = REMOVE_EXPIRED_BUTTON.innerText;
    REMOVE_EXPIRED_BUTTON.innerText = "Done!";
    await sleep(3000);
    REMOVE_EXPIRED_BUTTON.innerText = ORIGINAL_BUTTON_TEXT;
  }

  async function removeExpiredBook(asin: string) {
    const TITLE = $(`#content-title-${asin}`);
    if (!TITLE) throw new Error(`No title found with ASIN: ${asin}`);

    const ROWS = TITLE.parentElement?.querySelectorAll(
      ".information_row span",
    ) as NodeListOf<HTMLElement>;
    if (!ROWS) throw new Error(`No info rows found for ASIN: ${asin}`);

    const ROW_1 = ROWS.item(0) as HTMLElement;
    const ROW_2 = ROWS.item(1) as HTMLElement;

    const RETURN_BOOK_BUTTON = $(
      `#RETURN_CONTENT_ACTION_${asin}_CONFIRM > span`,
    ) as HTMLElement;

    if (
      ROW_1.innerText === "This book was a Kindle digital library loan" &&
      ROW_2.innerText === "Expired on"
    ) {
      RETURN_BOOK_BUTTON.click();
    }

    await sleep(1500);
  }

  async function downloadBooks() {
    const selectedBooks = getSelectedBooks();
    for (const asin of selectedBooks) {
      await download(asin);
      await sleep(1500); // Delay needed to let the previous download to start.
    }
  }

  async function download(asin: string) {
    const kindleDevice = $(`#download_and_transfer_list_${asin}_0`);
    if (!kindleDevice) return;

    await waitForElement(
      `#DOWNLOAD_AND_TRANSFER_ACTION_${asin}_CONFIRM > span`,
    ).then((obj) => {
      obj.click();
    });
    await waitForElement("#notification-close").then((obj) => {
      obj.click();
    });
  }

  function initialize() {
    waitForElement("#CONTENT_LIST").then(() => {
      waitForElement("#SELECT-ALL").then(
        (e) => (buttonsCSSText = e.style.cssText + "font-size: 13px;"),
      );

      // Add `Download Selected` button
      addButton(
        DOWNLOAD_BUTTON,
        "DOWNLOAD",
        "Download Selected",
        downloadBooks,
      );
      // Add `Remove Expired` button
      addButton(
        REMOVE_EXPIRED_BUTTON,
        "REMOVE_EXPIRED_BOOKS",
        "Removed Expired",
        removeExpiredBooks,
      );

      // Add Event Listeners for pagination buttons and checkboxes
      updateEventListeners();
    });
  }

  initialize();
})();
