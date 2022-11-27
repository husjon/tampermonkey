// ==UserScript==
// @name         Download Kindle Books
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/dateDsc/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.1.min.js
// ==/UserScript==
/* globals jQuery, $ */

(function() {
    'use strict';

    setTimeout(function () {
        let global_log_level = 'info'
        let selected_books = []

        function log(message, level='info') {
            if (level == global_log_level) {
                console.log(message)
            }
        }
        const sleep = ms => new Promise(r => setTimeout(r, ms));

        async function download(asin) {
            const checkbox = `#download_and_transfer_list_${asin}_0`
            const confirm = `#DOWNLOAD_AND_TRANSFER_ACTION_${asin}_CONFIRM > span`

            log(`Clicking Checkbox: ${checkbox}`, 'debug')
            $(checkbox).click();
            await sleep(100);
            log(`Clicking Confirm:  ${confirm}`, 'debug')
            $(confirm).click();
            await sleep(1000);
            $('#notification-close').click()
        }

        function add_download_button() {
            let button_style = { 'display': 'flex', 'border-radius': '3px', 'margin-bottom': '10px', 'min-height': '1.8rem', 'border-width': '1px', 'border-style': 'solid', 'border-color': 'rgb(173, 177, 184) rgb(162, 166, 172) rgb(141, 144, 150)', 'border-image': 'initial', 'cursor': 'pointer', 'background': 'linear-gradient(rgb(247, 248, 250), rgb(231, 233, 236))', 'word-break': 'break-word', 'outline': 'none', 'text-align': 'center', 'align-items': 'center', 'justify-content': 'center', 'width': '8rem', 'opacity': '0.25' }

            let buttons_container = '#FLOATING_TASK_BAR > div.filter-container > div'

            $(buttons_container).append('<div style="padding-right: 0.8rem;"></div>')
            $(buttons_container).append('<div id="DOWNLOAD"><div style="font-size: 13px;"><span>Download Selected</span></div></div>')
            $('#DOWNLOAD').css(button_style).on('click', async function(){
                for (const asin of selected_books) {
                    await download(asin)
                }
            })
        }

        $(':checkbox').on('change', function() {
            selected_books = []
            for (const checkbox of $(':checkbox:checked')) {
                if (checkbox.id.includes(':KindleEBook')) {
                    let asin = checkbox.id.replace(':KindleEBook', '')
                    selected_books.push(asin)
                }
            }
            if (selected_books.length > 0) {
                $('#DOWNLOAD').css({'opacity': 1})
            }
            else {
                $('#DOWNLOAD').css({'opacity': 0.25})
            }
        })

        add_download_button()
    }, 1000);

})();
