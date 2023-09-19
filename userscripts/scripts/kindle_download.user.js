"use strict";
// ==UserScript==
// @name            Kindle Download
// @namespace       https://github.com/husjon/tampermonkey
// @version         0.4.0
// @description     Helper script for backing up a users Kindle Books
// @author          @husjon
// @updateURL       https://raw.githubusercontent.com/husjon/tampermonkey/main/userscripts/scripts/kindle_kindle_download.js
// @downloadURL     https://raw.githubusercontent.com/husjon/tampermonkey/main/userscripts/scripts/kindle_kindle_download.js
// @supportURL      https://github.com/husjon/tampermonkey/issues/new?title=Kindle%20Download%20v0.4.0%20-%20
// @match           https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/dateDsc/*
// @icon            https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant           none
// @require         https://raw.githubusercontent.com/husjon/tampermonkey/kindle_helper-library/userscripts/libraries/kindle_helper/kindle_helper.js
// ==/UserScript==
/* globals KindleHelper, KH */
(async function () {
    KindleHelper().then((KH) => {
        async function downloadBooks() {
            for (const book of KH.getSelectedBooks()) {
                await KH.downloadBook(book);
            }
        }
        KH.addButton("DOWNLOAD", "Download", downloadBooks);
    });
})();
