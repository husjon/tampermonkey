"use strict";

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

const addButton = async (
  base_button: HTMLElement,
  id: string,
  text: string,
  listener: any,
) => {
  waitForElement("#SELECT-ALL").then((e) => {
    base_button.className = "action_button";
    base_button.id = id;
    base_button.innerText = text;
    base_button.style.cssText = e.style.cssText + "font-size: 13px;";

    base_button.style.width = "auto";
    base_button.style.padding = "0px 5px";
    base_button.style.opacity = getSelectedBooks().length > 0 ? "1.0" : "0.25";
    base_button.style.marginLeft = "0.8rem";

    base_button.addEventListener("click", listener);

    $(
      "#FLOATING_TASK_BAR > div.filter-container > div.content-filter-item",
    )?.append(base_button);
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
  const kindleDevice = $(`#download_and_transfer_list_${asin}_0`);
  if (!kindleDevice) return;

  await waitForElement(
    `#DOWNLOAD_AND_TRANSFER_ACTION_${asin}_CONFIRM > span`,
  ).then((obj) => obj.click());

  await waitForElement("#notification-close").then((obj) => obj.click());

  await sleep(1500);
};

const deleteBook = async (asin: string) => {
  const BUTTON = $(`DELETE_TITLE_ACTION_${asin}`) as HTMLElement;
  BUTTON?.click();
};

const removeExpiredBook = async (asin: string) => {
  if (isLibraryBook(asin) && isExpiredLibraryBook(asin)) deleteBook(asin);

  await sleep(1500);
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
  };

  log("loading");
  return new Promise((resolve) => {
    waitForElement("#CONTENT_LIST").then(() => {
      log("loaded");
      resolve(KINDLE_HELPER);
    });
  });
}
