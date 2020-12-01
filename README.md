# Demetra

A utility library for Wordpress custom api interaction, using the **adora-theme** endpoint.

## Installation
```bash
# Install package
npm install @adoratorio/demetra
```
## Usage

Since this package has a [pkg.module](https://github.com/rollup/rollup/wiki/pkg.module) field, it’s highly recommended importing it as an ES6 module with some bundlers like [Webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/):
```javascript
import Demetra from '@adoratorio/demetra';
const demetra = new Demetra({ });
```
If you are not using any bundlers, you can just load the UMD bundle:
```html
<script src="/medusa/umd/index.js"></script>
<script>const demetra = window.Demetra({ });</script>
```
## Available options

Medusa accepts in the constructor and `option` an object with the following possible props.

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|endpoint|string|`''`|The URL for the custom theme API endpoint|
|uploadEndpoint|string|`'{endpoint}/upload.php'`|The URL for the custom theme API endpoint for files upload|
|site|string|`'default'`|In multi-site installation Wordpress the site id to fetch data from|
|lang|string|`'en'`|The lang used to fetch the data|
|debug|boolean|`false`|If You need extra log in browser console about what Demetra is doing|
|version|number|`2`|The API version used (V2 is now available!)|
|cacheMaxAge|number|`3600000`|Maximum cache age in ms. If the request will use the local cache (LRU Cache)|

## APIs

### fetchPage()

Use this method to get pages details, the method accept the following params
```typescript
Demetra.fetchPage(id : string | number, options : object);
```

**Required params**

|parameter|type|description|
|:---|:---:|:---|
|id|string &#124; number|The id or the slug of the page to fetch|

**Options can contain the following parameter**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|type|string|`'page'`|The custom post type id or 'page' if you need an actual page not a post.|
|siblings|object|`{ fields: [], prev: false, next: false, loop: false }`|If you also need information about adjacent siblings <br> `{ fields: array; next: boolean; prev: boolean; loop: boolean}` <br> *fields*: An array of fields you need for siblings, identified by their frontId <br> *prev*: If you need the prev sibling <br> *next*: If you need the next sibling <br>*loop*: If the requested page is the last or the first, treat the siblings as a circle, returning the first one or the previous one depending on the position|
|cache|boolean|`true`|If the endpoint will use the API cache, disable in development mode|
|localCache|boolean|`false`|If the endpoint will use the LruCache|
|lang|string|`Demetra.lang`|The lang used to fetch the data|
|i18n|boolean|`true`|If you need to get in response the i18n object containing all the information about the other available languages for this page|

The returned object will be in the following form
```javascript
{
  "page": {
    "id": 87,
    "title": "Cuvée 1821",
    "path": "/cuvee-1821/",
    "fullPath": "/en/cuvee-1821/",
    "structure": [
      {
        "acf_fc_layout": "title",
        "frontId": "AppTitle"
        // Extra data with key : value here
      },
      // ... other components following
    ],
    "lang": "en",
    "type": "page",
    "i18n": {
      "it": {
        "id": 53,
        "slug": "[PAGE_SLUG]",
        "path": "[PAGE_PATH]",
        "fullPath": "/it/[PAGE_PATH]"
      }
    },
    "siblings": {
      "next": {
        "id": 90,
          "title": "Prova",
          "path": "/prova/",
          "fullPath": "//prova/",
          "structure": [
            false
          ],
          "lang": null,
          "type": "page",
          "i18n": null,
          "siblings": null,
          "date": null
        },
        "prev": null
    },
    "date": null // Filled only wen the requested type is a post
  },
  "menu": null,
  "archive": null,
  "extra": null,
  "taxonomy": null,
  "send": null,
  "subscribe": null,
  "status": {
    "code": 200,
    "message": "Data loaded!",
    "cache": false
  }
}
```

### fetchArchive()

Retrieve the information and the content for an archive (a collection of items)
```typescript
Demetra.fetchArchive(id: string, options : object);
```

**Required params**

|parameter|type|description|
|:---|:---:|:---|
|id|string|The slug of the archive to fetch|

**Options can contain the following parameter**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|fields|string|`[]`|Array of frontId used to identify the fields for the items|
|pagination|Pagination|`{ start: 0, count: -1 }`|A pagination object used to define if you need pagination <br> `{ start : number, count : number }`|
|cache|boolean|`true`|If the endpoint will use the API cache, disable in development mode|
|localCache|boolean|`false`|If the endpoint will use the LruCache|
|lang|string|`Demetra.lang`|The lang used to fetch the data|
|i18n|boolean|`true`|If you need to get in response the i18n object containing all the information about the other available languages for this page|

The returning object will be in the following form
```javascript
{
  "page": null,
  "menu": null,
  "archive": {
    "items": [
      {
        "id": 276,
        "title": "",
        "path": "/[ITEM_PATH]/",
        "fullPath": "/en/[ITEM_PATH]/",
        "structure": [
          {
            "frontId": "TeamPreview",
            // ... Other item data
          },
          // ... Other item components
        ],
        "lang": "en",
        "type": "team",
        "i18n": null,
        "siblings": null,
        "date": null
      }
    ],
    "pagination": {
      "start": null,
      "count": null,
      "more": true,
      "total": 15
    }
  },
  "extra": null,
  "taxonomy": null,
  "send": null,
  "subscribe": null,
  "status": {
    "code": 200,
    "message": "Data loaded!",
    "cache": false
  }
}
```

### fetchExtra()

Fetch data considered to be extra in the Wordpress setup
```typescript
Demetra.fetchExtra(id: string, options : object);
```

**Required params**

|parameter|type|description|
|:---|:---:|:---|
|id|string|The slug of the extra to fetch|

**Options can contain the following parameter**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|cache|boolean|`true`|If the endpoint will use the API cache, disable in development mode|
|localCache|boolean|`false`|If the endpoint will use the LruCache|
|lang|string|`Demetra.lang`|The lang used to fetch the data|
|i18n|boolean|`true`|If you need to get in response the i18n object containing all the information about the other available languages for this page|

The returning object will be in the following form
```javascript
{
    "page": null,
    "menu": null,
    "archive": null,
    "extra": {
        "privacy": "",
        "cookies": "",
        "email": ""
        // ... Extra data with key : value here
    },
    "taxonomy": null,
    "send": null,
    "subscribe": null,
    "status": {
        "code": 200,
        "message": "Data loaded!",
        "cache": false
    }
}
```

### fetchMenu()

Fetch content for a menu
```typescript
Demetra.fetchMenu(id: string, options : object);
```

**Required params**

|parameter|type|description|
|:---|:---:|:---|
|id|string|The slug of the menu to fetch|

**Options can contain the following parameter**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|cache|boolean|`true`|If the endpoint will use the API cache, disable in development mode|
|localCache|boolean|`false`|If the endpoint will use the LruCache|
|lang|string|`Demetra.lang`|The lang used to fetch the data|
|i18n|boolean|`true`|If you need to get in response the i18n object containing all the information about the other available languages for this page|

The returned object will be in the following form
```javascript
{
  "page": null,
  "menu": {
    "id": 2,
    "lang": "en",
    "count": 7,
    "items": [
      {
        "id": 34,
        "text": "About",
        "path": "/about/",
        "fullPath": "/en/about/",
        "target": "",
        "classes": [
          ""
        ],
        "behaviour": "internal",
        "parent": false,
        // ... custom fields associataed with this menu voice
      },
      {
        "id": 122,
        "text": "Team",
        "path": "/team/",
        "fullPath": "/en/team/",
        "target": "",
        "classes": [
          ""
        ],
        "behaviour": "internal",
        "parent": false,
      },
      {
        "id": 30,
        "text": "Contact",
        "path": "/contact/",
        "fullPath": "/en/contact/",
        "target": "",
        "classes": [
          ""
        ],
        "behaviour": "internal",
        "parent": false,
      }
    ]
  },
  "archive": null,
  "extra": null,
  "taxonomy": null,
  "send": null,
  "subscribe": null,
  "status": {
    "code": 200,
    "message": "Data loaded!",
    "cache": false
  }
}
```

### fetchTaxonomy()

Fetch a single taxonomy with all terms
```typescript
Demetra.fetchTaxonomy(id: string, options : object);
```

**Required params**

|parameter|type|description|
|:---|:---:|:---|
|id|string|The slug of the taxonomy to fetch|

**Options can contain the following parameter**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|cache|boolean|`true`|If the endpoint will use the API cache, disable in development mode|
|localCache|boolean|`false`|If the endpoint will use the LruCache|
|lang|string|`Demetra.lang`|The lang used to fetch the data|
|i18n|boolean|`true`|If you need to get in response the i18n object containing all the information about the other available languages for this page|

The returning object will be in the following form
```javascript
{
    "page": null,
    "menu": null,
    "archive": null,
    "extra": null,
    "taxonomy": [
      {
        "term_id": 17,
        "name": "TERM NAME",
        "slug": "termname",
        "term_group": 0,
        "term_taxonomy_id": 17,
        "taxonomy": "taxonomy id",
        "description": "",
        "parent": 0,
        "count": 0,
        "filter": "raw"
      },
      // ... Other terms following
    ],
    "send": null,
    "subscribe": null,
    "status": {
        "code": 200,
        "message": "Data loaded!",
        "cache": false
    }
}
```

### subscribe()

Use configured MailChimp settings in order to subscribe an email to a list
```typescript
Demetra.subscribe(email,  <string>);
```

**Required params**

|parameter|type|description|
|:---|:---:|:---|
|email|string|The e-mail to subscribe to the newsletter|

The returning object will be in the following form
```javascript
{
    "page": null,
    "menu": null,
    "archive": null,
    "extra": null,
    "taxonomy": null,
    "send": null,
    "subscribe": {
      "response": 1, // The request result 0 in case of error
      "message": "SUCCESS!", // The message associated with the result
      "mailchimp": "", // Contains mailchimp messages and debug informations
    },
    "status": {
        "code": 200,
        "message": "Data loaded!",
        "cache": false
    }
}
```

### send()

Use a preconfigured form on WP to send an email
```typescript
Demetra.send(id : number, recipients : string, data : object, files : array);
```

**Required params**

|parameter|type|description|
|:---|:---:|:---|
|id|number|The form ID|
|recipients|string|should be a single email, or a comma separated list of email addresses, `data` should be a valid JSON parsable string, containing only one level key/value pairs, one for each field defined in form options on WP side|
|data|object|An object containing the form data|

**optional params**
|:---|:---:|:---|
|files|array|should be a list of files handler to upload as attachments to the request|

The returning object will be in the following form
```javascript
{
    "page": null,
    "menu": null,
    "archive": null,
    "extra": null,
    "taxonomy": null,
    "send": {
      "saved": 1, // How many requests have been saved in the db
      "sended": true, // If the email has been sended to the recipients
    },
    "subscribe": null,
    "status": {
        "code": 200,
        "message": "Data loaded!",
        "cache": false
    }
}
```

### upload()

Upload one or multiple files to the Wordpress media library
```typescript
Demetra.upload(files : File | Array);
```
The returning object will be in the following form
```javascript
{
    "files": [{
      "upload_id": 1, // The post id of the uploaded file
      "url": "https://...", // The url of the uploaded file
    }],
    "status": {
        "code": 200,
        "message": "Data loaded!",
        "cache": false
    }
}
```
