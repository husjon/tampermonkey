## Functions

<dl>
<dt><a href="#addButton">addButton(id, label, listener, followSelection)</a> ⇒</dt>
<dd><p>Adds a button to the Button Bar.</p>
</dd>
<dt><a href="#getAllBooks">getAllBooks()</a> ⇒</dt>
<dd><p>Gets all visible books.</p>
</dd>
<dt><a href="#getSelectedBooks">getSelectedBooks()</a> ⇒</dt>
<dd><p>Gets only the selected books.</p>
</dd>
<dt><a href="#isLibraryBook">isLibraryBook(asin)</a></dt>
<dd><p>Checks if the book with specified ASIN is from a library. (f.ex B003PPDIC4)</p>
</dd>
<dt><a href="#isExpiredLibraryBook">isExpiredLibraryBook(asin)</a></dt>
<dd><p>Checks if the loan period of the book with specified ASIN has expired. (f.ex B07DTLQJPK)</p>
</dd>
<dt><a href="#downloadBook">downloadBook(asin)</a></dt>
<dd><p>Downloads a book based on the specified ASIN (f.ex B01MYZ8X5C)</p>
</dd>
<dt><a href="#deleteBook">deleteBook(asin)</a></dt>
<dd><p>Deletes a book based on the specified ASIN (f.ex B0727TNBTY)</p>
</dd>
<dt><a href="#removeExpiredBook">removeExpiredBook(asin)</a></dt>
<dd><p>Returns a book based on the specified ASIN (f.ex B002RI9KAE)</p>
</dd>
<dt><a href="#returnBook">returnBook(asin)</a></dt>
<dd><p>Returns a book based on the ASIN (f.ex B00Y7RWXHU)</p>
</dd>
<dt><a href="#KindleHelper">KindleHelper()</a> ⇒</dt>
<dd><p>Instantiates the Kindle Helper</p>
<p>Example usage in f.ex Tampermonkey:</p>
<pre><code class="language-javascript">... SNIP ...

// @match           https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/dateDsc/*
// @require         https://github.com/husjon/tampermonkey/blob/main/userscripts/libraries/kindle_helper/kindle_helper.js
// ==/UserScript==

(async function () {
    KindleHelper().then(async (KH) =&gt; { // Instantiates the helper

        async function downloadBooks() { // Example callback function
            for (const book of KH.getSelectedBooks()) {
                await KH.downloadBook(book);
            }
        }

        let download_button = KH.addButton(&quot;DOWNLOAD&quot;, &quot;Download&quot;, downloadBooks);
        //                                  ^ id        ^ label    ^ function reference
    });
})();
</code></pre>
</dd>
</dl>

<a name="addButton"></a>

## addButton(id, label, listener, followSelection) ⇒
Adds a button to the Button Bar.

**Kind**: global function  
**Returns**: The button element  

| Param | Default | Description |
| --- | --- | --- |
| id |  | The CSS id for the button |
| label |  | The label of the button |
| listener |  | The function that should be called when the button is pressed |
| followSelection | <code>true</code> | Override in case the btton should always be available |

<a name="getAllBooks"></a>

## getAllBooks() ⇒
Gets all visible books.

**Kind**: global function  
**Returns**: string[]: An array containing ASINs  
<a name="getSelectedBooks"></a>

## getSelectedBooks() ⇒
Gets only the selected books.

**Kind**: global function  
**Returns**: string[]: An array containing ASINs  
<a name="isLibraryBook"></a>

## isLibraryBook(asin)
Checks if the book with specified ASIN is from a library. (f.ex B003PPDIC4)

**Kind**: global function  

| Param |
| --- |
| asin | 

<a name="isExpiredLibraryBook"></a>

## isExpiredLibraryBook(asin)
Checks if the loan period of the book with specified ASIN has expired. (f.ex B07DTLQJPK)

**Kind**: global function  

| Param |
| --- |
| asin | 

<a name="downloadBook"></a>

## downloadBook(asin)
Downloads a book based on the specified ASIN (f.ex B01MYZ8X5C)

**Kind**: global function  

| Param |
| --- |
| asin | 

<a name="deleteBook"></a>

## deleteBook(asin)
Deletes a book based on the specified ASIN (f.ex B0727TNBTY)

**Kind**: global function  

| Param |
| --- |
| asin | 

<a name="removeExpiredBook"></a>

## removeExpiredBook(asin)
Returns a book based on the specified ASIN (f.ex B002RI9KAE)

**Kind**: global function  

| Param |
| --- |
| asin | 

<a name="returnBook"></a>

## returnBook(asin)
Returns a book based on the ASIN (f.ex B00Y7RWXHU)

**Kind**: global function  

| Param |
| --- |
| asin | 

<a name="KindleHelper"></a>

## KindleHelper() ⇒
Instantiates the Kindle Helper

Example usage in f.ex Tampermonkey:
```javascript
... SNIP ...

// @match           https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll/dateDsc/*
// @require         https://github.com/husjon/tampermonkey/blob/main/userscripts/libraries/kindle_helper/kindle_helper.js
// ==/UserScript==

(async function () {
    KindleHelper().then(async (KH) => { // Instantiates the helper

        async function downloadBooks() { // Example callback function
            for (const book of KH.getSelectedBooks()) {
                await KH.downloadBook(book);
            }
        }

        let download_button = KH.addButton("DOWNLOAD", "Download", downloadBooks);
        //                                  ^ id        ^ label    ^ function reference
    });
})();
```

**Kind**: global function  
**Returns**: Promise with helper functions  
