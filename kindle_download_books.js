// ==UserScript==
// @name            Download Kindle Books
// @namespace       https://github.com/husjon/tampermonkey
// @version         0.3.1
// @description     Helper script for backing up a users Kindle Books
// @author          @husjon
// @updateURL       https://github.com/husjon/tampermonkey/raw/main/kindle_download_books.js
// @downloadURL     https://github.com/husjon/tampermonkey/raw/main/kindle_download_books.js
// @supportURL      https://github.com/husjon/tampermonkey/issues/new?title=Kindle%20Download%20-%20
// @match           https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/dateDsc/*
// @icon            https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant           none
// ==/UserScript==
/* globals jQuery, $ */

(function () {
  "use strict";

  const global_log_level = "info";

  let startup_interval = null;
  let selected_books = [];

  const button = document.createElement("div");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function log(message, level = "info") {
    if (level == global_log_level) {
      console.log(message);
    }
  }

  function startup() {
    startup_interval = setInterval(() => {
      document.querySelector("#CONTENT_LIST") && started();
    }, 100);
  }

  function started() {
    log("Initialized", "info");
    clearInterval(startup_interval); // Stops the startup check

    add_download_button();
    update_event_listeners();
  }

  function add_download_button() {
    log("Adding download button", "debug");
    let buttons_container =
      "#FLOATING_TASK_BAR > div.filter-container > div.content-filter-item";
    let button_style =
      document.querySelector("#SELECT-ALL").style.cssText + "font-size: 13px;";

    button.className = "action_button";
    button.id = "DOWNLOAD";
    button.innerText = "Download Selected";
    button.style.cssText = button_style;
    button.style.width = "auto";
    button.style.padding = "0px 5px";
    button.style.opacity = selected_books.length > 0 ? 1.0 : 0.25;
    button.addEventListener("click", download_books);

    const button_spacer = document.createElement("div");
    button_spacer.style.paddingRight = "0.8rem";

    document.querySelector(buttons_container).append(button_spacer);
    document.querySelector(buttons_container).append(button);
    log("Added download button", "debug");
  }

  function update_event_listeners() {
    log("Updating event listeners", "debug");
    let all_checkboxes = [
      ...document.querySelectorAll("[type=checkbox]"),
    ].filter((checkbox) => checkbox.id.includes("KindleEBook"));

    all_checkboxes.map((element) => {
      element.removeEventListener("change", update_download_list);
      element.addEventListener("change", update_download_list);
    });

    document.querySelectorAll("#pagination .page-item").forEach((button) => {
      button.addEventListener("click", startup);
    });

    log("Updated event listeners", "debug");
  }

  function update_download_list(event) {
    const asin = event.target.id.replace(":KindleEBook", "");

    if (event.target.checked) {
      selected_books.push(asin);
    } else {
      selected_books = selected_books.filter((item) => {
        return item !== asin;
      });
    }

    button.style.opacity = selected_books.length > 0 ? 1.0 : 0.25;
  }

  async function download_books() {
    log(`Downloading: ${selected_books.join(", ")}`, "info");
    for (const asin of selected_books) {
      await download(asin);
    }
  }
  async function download(asin) {
    const checkbox = document.querySelector(
      `#download_and_transfer_list_${asin}_0`
    );
    const kindle_label = checkbox.parentElement.parentElement.parentElement;

    log(`Clicking Checkbox for ${kindle_label}`, "debug", "debug");
    document.querySelector(`#download_and_transfer_list_${asin}_0`).click();
    await sleep(100);

    log(`Clicking Confirm:  ${confirm}`, "debug");
    document
      .querySelector(`#DOWNLOAD_AND_TRANSFER_ACTION_${asin}_CONFIRM > span`)
      .click();

    for (let i = 0; i < 10; i++) {
      await sleep(1000);

      let notification_close = document.querySelector(`#notification-close`);
      if (notification_close) {
        notification_close.click();
        await sleep(2000);
        return
      }
    }
  }

  startup();
})();
