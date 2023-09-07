// ==UserScript==
// @name            Download Kindle Books
// @namespace       https://github.com/husjon/tampermonkey
// @version         0.3.3
// @description     Helper script for backing up a users Kindle Books
// @author          @husjon
// @updateURL       https://github.com/husjon/tampermonkey/raw/main/kindle_download_books.js
// @downloadURL     https://github.com/husjon/tampermonkey/raw/main/kindle_download_books.js
// @supportURL      https://github.com/husjon/tampermonkey/issues/new?title=Kindle%20Download%20v0.3.3%20-%20
// @match           https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/*
// @icon            https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant           none
// ==/UserScript==

(function () {
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const buttons_container =
    "#FLOATING_TASK_BAR > div.filter-container > div.content-filter-item";
  let button_style = null;

  const download_button = document.createElement("div");
  const remove_expired_button = document.createElement("div");
  let selected_books = [];

  function waitForElement(selector) {
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
  }

  function add_button(base_button, id, text, listener) {
    base_button.className = "action_button";
    base_button.id = id;
    base_button.innerText = text;
    base_button.style.cssText = button_style;
    base_button.style.width = "auto";
    base_button.style.padding = "0px 5px";
    base_button.style.opacity = selected_books.length > 0 ? 1.0 : 0.25;
    base_button.style.marginLeft = "0.8rem";

    base_button.addEventListener("click", listener);

    $(buttons_container).append(base_button);
    console.log("Added download button");
  }

  function update_selection(event) {
    const asin = event.target.id.replace(":KindleEBook", "");

    if (event.target.checked) {
      selected_books.push(asin);
    } else {
      selected_books = selected_books.filter((item) => {
        return item !== asin;
      });
    }

    download_button.style.opacity = selected_books.length > 0 ? 1.0 : 0.25;
    remove_expired_button.style.opacity =
      selected_books.length > 0 ? 1.0 : 0.25;
  }

  function update_event_listeners() {
    let all_checkboxes = [...$$("[type=checkbox]")].filter((checkbox) =>
      checkbox.id.includes("KindleEBook"),
    );

    all_checkboxes.map((element) => {
      element.removeEventListener("change", update_selection);
      element.addEventListener("change", update_selection);
    });

    let search_button = $("#search-button > div");
    search_button.removeEventListener("click", initialize);
    search_button.addEventListener("click", initialize);

    $$("#pagination .page-item").forEach((button) => {
      button.addEventListener("click", initialize);
    });

    console.log("Updated event listeners");
  }

  function remove_expired_books() {
    throw new Error("Not Implemented");
  }

  async function download_books() {
    console.log(`Downloading: ${selected_books.join(", ")}`);
    for (const asin of selected_books) {
      console.log(`Downloading: ${asin}`);
      await download(asin);
      await sleep(1500); // Delay needed to let the previous download to start.
    }
  }

  async function download(asin) {
    $(`#download_and_transfer_list_${asin}_0`).click();
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
      button_style = $("#SELECT-ALL").style.cssText + "font-size: 13px;";

      // Add `Download Selected` button
      add_button(
        download_button,
        "DOWNLOAD",
        "Download Selected",
        download_books,
      );
      // Add `Remove Expired` button
      add_button(
        remove_expired_button,
        "REMOVE_EXPIRED_BOOKS",
        "Removed Expired",
        remove_expired_books,
      );

      // Add Event Listeners for pagination buttons and checkboxes
      update_event_listeners();
    });
  }

  initialize();
})();
