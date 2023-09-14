## Dev helpers

### `tampermonkey.dev.chrome.js`

Add it as a userscript in Google Chrome and adjust the `@match` and `@require` fields as needed.  
This will allow you to develop in your IDE of choice.

### `tampermonkey.dev.firefox.js`

**Note**: Firefox requires a little workaround as it does not allow local file access.  
Instead we use a helper function to load an external file and use `eval` to inject it.  
The script is made by [rRobis](https://github.com/rRobis) and was posted in
[Tampermonkey/tampermonkey/issues/347](https://github.com/Tampermonkey/tampermonkey/issues/347#issuecomment-1560670064)

Add it as a userscript in Firefox and adjust the `nodeJSEndPoint` variable to point to your dev server.  
In my case I use [VSCode](https://code.visualstudio.com) with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.

### `userscript.template.ts`

Boilerplate template for creating new userscripts.
