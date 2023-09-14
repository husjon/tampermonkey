// ==UserScript==
// @name         Tampermonkey Dev
// @namespace    GRobe
// @version      0.3
// @description  GRobe™
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// ==/UserScript==
// Credits: https://github.com/Tampermonkey/tampermonkey/issues/347#issuecomment-1560670064 (https://github.com/rRobis)

(function () {
  var nodeJSEndPoint = "http://localhost:5500/kindle_helper.js"; // Change accordingly

  // Function to evaluate the fetched script
  function evaluateScript(scriptContent) {
    eval(scriptContent);
  }

  // Function to handle the GM_xmlhttpRequest response
  function handleResponse(response) {
    if (response.status === 200 && response.responseText) {
      evaluateScript(response.responseText);
    } else {
      console.error("Error loading Node.JS Script:", response.statusText);
    }
  }

  // Function to make the GM_xmlhttpRequest
  function makeRequest() {
    GM_xmlhttpRequest({
      method: "GET",
      url: nodeJSEndPoint,
      onload: handleResponse,
      onerror: handleResponse,
    });
  }

  // Wait for the DOMContentLoaded event before making the request
  document.addEventListener("DOMContentLoaded", makeRequest);
})();
