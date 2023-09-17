"use strict";

interface Button {
  id: string;
  baseButton: HTMLElement;
  label: string;
  listener: Function;
}

let buttons: Button[] = [];

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const waitForElement = (selector: string): Promise<HTMLElement> => {
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
};

let loggingEnabled = true;
const log = (message: string) => {
  if (loggingEnabled) console.log(`Kindle Helper - ${message}`);
};

const updateEventListeners = () => {
  const searchButton = $("#search-button > div");
  if (searchButton) {
    searchButton.removeEventListener("click", KindleHelper);
    searchButton.addEventListener("click", KindleHelper);
  }

  $$("#pagination .page-item").forEach((button) => {
    button.addEventListener("click", KindleHelper);
  });
};

const addButton = async (
  baseButton: HTMLElement,
  id: string,
  label: string,
  listener: any,
) => {
  waitForElement("#SELECT-ALL").then((e) => {
    baseButton.className = "action_button";
    baseButton.id = id;
    baseButton.innerText = label;
    baseButton.style.cssText = e.style.cssText + "font-size: 13px;";

    baseButton.style.width = "auto";
    baseButton.style.padding = "0px 5px";
    baseButton.style.opacity = getSelectedBooks().length > 0 ? "1.0" : "0.25";
    baseButton.style.marginLeft = "0.8rem";

    baseButton.addEventListener("click", listener);

    $(
      "#FLOATING_TASK_BAR > div.filter-container > div.content-filter-item",
    )?.append(baseButton);

    if (!buttons.find((button) => button.id === id))
      buttons.push({ id, baseButton, label, listener });
  });
};

const getCheckboxes = () =>
  [...$$("[type=checkbox]")].filter((checkbox) =>
    checkbox.id.includes("KindleEBook"),
  ) as HTMLInputElement[];

const getAsinFromCheckbox = (checkbox: HTMLInputElement) =>
  checkbox.id.replace(":KindleEBook", "");

const getAllBooks = () => getCheckboxes().map((c) => getAsinFromCheckbox(c));

const getSelectedBooks = () =>
  getCheckboxes()
    .filter((c) => c.checked)
    .map((c) => getAsinFromCheckbox(c));

const getBookInformationRows = (asin: string) => {
  const TITLE = $(`#content-title-${asin}`);

  return TITLE?.parentElement?.querySelectorAll(
    ".information_row span",
  ) as NodeListOf<HTMLElement>;
};

const isLibraryBook = (asin: string) => {
  for (const row of getBookInformationRows(asin)) {
    if (row.innerText.match(/This book (was|is) a Kindle digital library loan/))
      return true;
  }
};
const isExpiredLibraryBook = (asin: string) => {
  for (const row of getBookInformationRows(asin)) {
    if (row.innerText.match(/Expired on/)) return true;
  }
};

const downloadBook = async (asin: string) => {
  await waitForElement(`#download_and_transfer_list_${asin}_0`).then((obj) =>
    obj.click(),
  );

  await waitForElement(
    `#DOWNLOAD_AND_TRANSFER_ACTION_${asin}_CONFIRM > span`,
  ).then((obj) => obj.click());

  await waitForElement("#notification-close").then((obj) => obj.click());

  await sleep(1500);
};

const deleteBook = async (asin: string) => {
  const BUTTON = $(`DELETE_TITLE_ACTION_${asin}`) as HTMLElement;
  BUTTON?.click();

  await sleep(1500);
};

const removeExpiredBook = async (asin: string) => {
  if (isLibraryBook(asin) && isExpiredLibraryBook(asin)) deleteBook(asin);
};

const returnBook = async (asin: string) => {
  const BUTTON = $(`RETURN_CONTENT_ACTION_${asin}_CONFIRM`) as HTMLElement;

  if (isLibraryBook(asin)) BUTTON?.click();
};

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
        addButton(button.baseButton, button.id, button.label, button.listener);
      }

      log("Initialized");
      resolve(KINDLE_HELPER);
    });
  });
}
