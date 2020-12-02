# Demetra

A utility library for Wordpress custom API interaction, using the **adora-theme** endpoint.

## Installation
```bash
# Install package
npm install @adoratorio/demetra
```
## Usage

Since this package has a [pkg.module](https://github.com/rollup/rollup/wiki/pkg.module) field, it’s highly recommended importing it as an ES6 module with some bundlers like [Webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/):
```javascript
import Demetra from '@adoratorio/demetra';
const demetra = new Demetra(options: object);
```
If you are not using any bundlers, you can just load the UMD bundle:
```html
<script src="/demetra/umd/index.js"></script>
<script>const demetra = window.Demetra(options: object);</script>
```
## Available options

Demetra accepts in the constructor an `option` object with the following possible props.

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|endpoint|string|`''`|The URL for the custom theme API endpoint|
|uploadEndpoint|string|`{$endpoint}/upload.php`|The URL for the custom theme API endpoint for uploading files|
|site|string|`'default'`|In the Wordpress multi-site installation the site id to fetch data from|
|lang|string|`'en'`|The language in which data is retrieved|
|debug|boolean|`false`|If You need extra log in browser console about what Demetra is doing|
|version|number|`2`|The API version used (V2 is now available!)|
|cacheMaxAge|number|`3600000`|Maximum cache age in ms. If the request will use the local cache (LRU Cache)|



## APIs

### fetchPage()

Use this method to get pages details, the method accept the following params
```typescript
Demetra.fetchPage(id : string | number, options : object);
```

**Accepted parameters**

|parameter|required|description|
|:---|:---:|:---|
|id|`true`|The id or the slug of the page to fetch|
|options|`false`|The configuration object|

**Options can take an object with the following keys**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|type|string|`'page'`|The custom post type id or 'page' if you need an actual page not a post.|
|siblings|object|`{ fields: [], prev: false, next: false, loop: false }`|If you also need information about adjacent siblings|
|cache|boolean|`true`|If the endpoint will use the API cache (*disable in development mode*)|
|localCache|boolean|`false`|If you want to save the data in a local cache *(LruCache)*|
|lang|string|`Demetra.lang`|The language in which data is retrieved|
|i18n|boolean|`true`|If you need to get the i18n object in the response containing all information about the other languages available for this page|

**Siblings can take a object with the following keys**

| parameter |  type   | default | description                                                  |
| :-------- | :-----: | :-----: | :----------------------------------------------------------- |
| fields    |  Array  |  `[]`   | An array of fields you need for siblings, identified by their frontId |
| prev      | boolean | `false` | If you need the prev sibling                                 |
| next      | boolean | `false` | If you need the next sibling                                 |
| loop      | Boolean | `false` | If the requested page is the last or the first, treat the siblings as a circle, returning the first one or the previous one depending on the position |

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

Retrieve the information and content for an archive (a collection of items)
```typescript
Demetra.fetchArchive(id: string, options : object);
```

**Accepted parameters**

|parameter|required|description|
|:---|:---:|:---|
|id|`true`|The slug of the archive to fetch|
|options|`false`|The configuration object|

**Options can take an object with the following keys**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|fields|string|`[]`|Array of frontId used to identify the fields for the items|
|pagination|object|`{ start: 0, count: -1 }`|A pagination object used to define if you need pagination|
|cache|boolean|`true`|If the endpoint will use the API cache (*disable in development mode*)|
|localCache|boolean|`false`|If you want to save the data in a local cache *(LruCache)*|
|lang|string|`Demetra.lang`|The language in which data is retrieved|
|i18n|boolean|`true`|If you need to get in response the i18n object containing all the information about the other available languages for this page|

**Pagination can take a object with the following keys**

| parameter |  type  | default | description |
| :-------- | :----: | :-----: | :---------- |
| start     | number |   `0`   |             |
| count     | number |  `-1`   |             |

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
Demetra.fetchExtra(id: string, options? : object);
```

**Accepted parameters**

|parameter|required|description|
|:---|:---:|:---|
|id|`true`|The slug of the extra to fetch|
|options|`false`|The configuration object|

**Options can take an object with the following keys**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|cache|boolean|`true`|If the endpoint will use the API cache (*disable in development mode*)|
|localCache|boolean|`false`|If you want to save the data in a local cache *(LruCache)*|
|lang|string|`Demetra.lang`|The language in which data is retrieved|
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

|parameter|required|description|
|:---|:---:|:---|
|id|`true`|The slug of the menu to fetch|
|options|`false`|The configuration object|

**Options can take an object with the following keys**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|cache|boolean|`true`|If the endpoint will use the API cache *(disable in development mode)*|
|localCache|boolean|`false`|If you want to save the data in a local cache *(LruCache)*|
|lang|string|`Demetra.lang`|The language in which data is retrieved|
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
Demetra.fetchTaxonomy(id: string, options? : object);
```

**Accepted parameters**

|parameter|required|description|
|:---|:---:|:---|
|id|`true`|The slug of the taxonomy to fetch|
|options|`false`|The configuration object|

**Options can take an object with the following keys**

|parameter|type|default|description|
|:---|:---:|:---:|:---|
|cache|boolean|`true`|If the endpoint will use the API cache *(disable in development mode)*|
|localCache|boolean|`false`|If you want to save the data in a local cache *(LruCache)*|
|lang|string|`Demetra.lang`|The language in which data is retrieved|
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
Demetra.subscribe(email : string);
```

**Accepted parameters**

|parameter|required|description|
|:---|:---:|:---|
|email|`true`|The e-mail to subscribe to the newsletter|

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

**Accepted parameters**

|parameter|required|description|
|:---|:--:|:---|
|id|`true`|the form ID|
|recipients|`true`|should be a single email, or a comma separated list of email addresses|
|data|`true`|`data` should be a valid JSON parsable string, containing only one level key/value pairs, one for each field defined in form options on WP side|
|files|`false`|should be a list of files handler to upload as attachments to the reques|

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
Demetra.upload(files : file | array<file>);
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

### fetchQueue()

Sends all the [DemetraRequest](#DemetraRequests) in the [queue](#Queue) in three different format: **all together**, **simultaneously** or **one at time**.

```typescript
fetchQueue(sendModes: string)
```

**Accepted parameters**

| parameter |   type   | required |          default          | description                                                  |
| :-------- | :------: | :------: | :-----------------------: | :----------------------------------------------------------- |
| id        | `string` | `false`  | `Demetra.SEND_MODES.ONCE` | A string indicating the send mode you wish to use, it can be 'once', 'simultaneously' or 'await'. Also static enumerators are exposed to help:<br/>• `Demetra.MODE.ONCE`<br/>• `Demetra.MODE.SIMULTANEOUSLY`<br/>• `Demetra.MODE.AWAIT`. |

**Modes:**

- Once: create a request package and send thath package.
- Simultaneously: sends at the same time all requests independently of each other 
- Await: Wait a response before send the next request

## Queue

Internally Demetra uses a request queue which is used together with the [fetchQueue()](#fetchQueue()) function

### add()

Adds a request to the queue.

```typescript
queue.add(request : DemetraRequestPage | DemetraRequestArchive | DemetraRequestExtra | DemetraRequestMenu | DemetraRequestTaxonomy)
```

### Clear()

Clear the queue.

```typescript
queue.clear()
```



## DemetraRequests

In V2 you can directly create a DemetraRequest thath can be directly sent **all together**, **simultaneously** or **one at time**.
You can instantiate one or more of the following class:

- `DemetraRequestArchive(id : string | number, options : object, lang : string, site : string, version : number)`
- `DemetraRequestExtra(id : string | number, options : object, lang : string, site : string, version : number)`
- `DemetraRequestMenu(id : string | number, options : object, lang : string, site : string, version : number)`
- `DemetraRequestPage(id : string | number, options : object, lang : string, site : string, version : number)`
- `DemetraRequestTaxonomy(id : string | number, options : object, lang : string, site : string, version : number)`

> NB: The request doesn't inherit the global parameters of Demetra.

**Accepted parameters**

| parameter |       type       | required |   default   | description                                                  |
| :-------- | :--------------: | :------: | :---------: | :----------------------------------------------------------- |
| id        | string \| number |  `true`  |             | The slug or id of the archive \| extra \| page \| menu \| taxonomy to fetch |
| options   |      object      | `false`  |             | The configuration object (look the fetch API above to understand how to fill the object for each request) |
| lang      |      string      | `false`  |   `'en'`    | The language in which data is retrieved                      |
| site      |      string      | `false`  | `'default'` | In multi-site installation Wordpress the site id to fetch data from |
| version   |      number      | `false`  |     `2`     | The API version used                                         |