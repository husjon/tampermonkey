// ==UserScript==
// @name            Download Kindle Books
// @namespace       https://github.com/husjon/tampermonkey
// @version         0.3.3
// @description     Helper script for backing up a users Kindle Books
// @author          @husjon
// @updateURL       https://github.com/husjon/tampermonkey/raw/main/kindle_download_books.js
// @downloadURL     https://github.com/husjon/tampermonkey/raw/main/kindle_download_books.js
// @supportURL      https://github.com/husjon/tampermonkey/issues/new?title=Kindle%20Download%20v0.3.3%20-%20
// @match           https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/dateDsc/*
// @icon            https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant           GM_setValue
// @grant           GM_getValue
// ==/UserScript==
/* globals jQuery, $ */

(function () {
  "use strict";

  const global_log_level = "info";

  let startup_interval = null;
  let selected_books = [];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const buttons_selector = "#FLOATING_TASK_BAR > div.filter-container > div.content-filter-item";
  const devices_selector = '[id^=download_and_transfer_list_';

  function log(message, level = "info") {
    if (level == global_log_level) {
      console.log(message);
    }
  }

  function startup() {
    startup_interval = setInterval(() => {
      document.querySelector(devices_selector) && started();
    }, 100);
  }

  function started() {
    log("Initialized", "info");
    clearInterval(startup_interval); // Stops the startup check

    add_button('DOWNLOAD', 'Download selected', download_books);
    add_device_dropdown();
    update_event_listeners();
  }

  function add_device_dropdown() {
    const dropdown = create_element("select");
    const options = get_available_devices();

    options.forEach((optionText, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = optionText;
      dropdown.appendChild(option);
    });

    dropdown.value = get_device_index();
    dropdown.style.textAlign = "left";
    dropdown.addEventListener('change', function (event) {
      set_device_index(event.target.selectedIndex);
    });

    add_spacer();
    add_element(dropdown);
  }

  function add_button(id, innerText, callback) {
    const button = create_element("div")
    button.id = id;
    button.innerText = innerText;

    if (id == "DOWNLOAD") {
      button.style.opacity = selected_books.length > 0 ? 1.0 : 0.25;
    }

    button.addEventListener("click", callback);
    add_spacer();
    add_element(button);
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

    let search_button = document.querySelector("#search-button > div");
    search_button.removeEventListener('click', startup)
    search_button.addEventListener('click', startup)


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

    document.getElementById('DOWNLOAD').style.opacity = selected_books.length > 0 ? 1.0 : 0.25;
  }

  async function download_books() {
    log(`Downloading: ${selected_books.join(", ")}`, "info");
    for (const asin of selected_books) {
      await download(asin);
    }
  }

  async function download(asin) {
    const device_index = get_device_index();
    const checkbox = document.querySelector(
      `#download_and_transfer_list_${asin}_${device_index}`
    );

    if (checkbox == null) {
      log(`Unable to download: ${asin}`);
      return;
    }

    const kindle_label = checkbox.parentElement.parentElement.parentElement;

    log(`Clicking Checkbox for ${kindle_label}`, "debug", "debug");
    document.querySelector(`#download_and_transfer_list_${asin}_${device_index}`).click();
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

  function create_element(tagName) {
    const elm = document.createElement(tagName);
    const defaultStyle = document.querySelector("#SELECT-ALL").style.cssText;
    elm.style.cssText = defaultStyle;
    elm.style.width = "auto";
    elm.style.padding = "0px 5px";
    elm.style.fontSize = "13px";
    elm.className = "action_button";
    return elm;
  }

  function add_spacer() {
    const spacer = document.createElement("div");
    spacer.style.paddingRight = "0.8rem";
    document.querySelector(buttons_selector).append(spacer);
  }

  function add_element(elm) {
    document.querySelector(buttons_selector).append(elm);
  }

  function get_available_devices() {
    return Array.from(
      document
        .querySelector(devices_selector)
        .querySelectorAll('li'))
      .map(item => item.textContent.trim());
  }

  function get_device_index() {
    return GM_getValue('device_index', 0);
  }

  function set_device_index(device_index) {
    GM_setValue('device_index', device_index);
  }

  startup();
})();
