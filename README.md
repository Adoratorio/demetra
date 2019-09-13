# Demetra

A utility library for Wordpress custom api interaction, using the **adora-theme** endpoint.

## Installation
```bash
# Install package
npm install @adoratorio/demetra
```
## Usage

Since this package has a [pkg.module](https://github.com/rollup/rollup/wiki/pkg.module) field, it’s highly recommended to import it as an ES6 module with some bundlers like [webpack](https://webpack.js.org/) or [rollup](https://rollupjs.org/):
```javascript
import Demetra from '@adoratorio/demetra';
const demetra = new Demetra({ });
```
If you are not using any bundlers, you can just load the UMD bundle:
```html
<script src="/medusa/umd/index.js"></script>
<script>var medusa = window.Demetra({ });</script>
```
## Available options

Medusa accept in the constructor and `option` object with the following possible props.

|parameter|type|default|description|
|:-------|:--:|:-----:|:----------|
|endpoint|string|`''`|The URL for the custom theme API endpoint|
|lang|string|`'en'`|The lang used to fetch the data|
|version|number|`1`|The API version used, v1 only available for now...|
|site|string|`''`|In multi-site installation Wordpress the site id to fetch data from|
|debug|boolean|`false`|If You need extra log in browser console about what Demetra is doing|

## APIs

### fetchPage()

Use this method to get pages details, the method accept the following params
```typescript
Demetra.fetchPage(slug : string | number, type : string, i18n : boolean, siblings : boolean, fields : Array<string>, prev : boolean, next : boolean, loop: boolean);
```
|parameter|type|default|description|
|:-------|:--:|:-----:|:----------|
|slug|string \| number|none, required|The id or the slug of the page to fetch|
|type|string|`'page'`|The custom post type id or 'page' if you need an actual page not a post.|
|i18n|boolean|`true`|If you need to get in response the i18n object containing all the information about the other available languages for this page|
|siblings|boolean|`false`|If you also need information about adiacent siblings|
|fields|Array\<string\>|`[]`|An array of fields you need for siblings, identified by their frontId|
|prev|boolean|`false`|If you need the prev sibling|
|next|boolean|`false`|If you need the next sibling|
|loop|boolean|`false`|If the requested page is the last or the first, treat the siblings as a circle, returning the first one or the previous one depending on the position|

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
Demetra.fetchMenu(slug : string | number);
```
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
  "status": {
    "code": 200,
    "message": "Data loaded!",
    "cache": false
  }
}
```
### fetchArchive()

Retrive the information and the content for an archive (a collection of items)
```typescript
Demetra.fetchArchive(type : string, fields : Array<string>, i18n : boolean, pagination : Pagination, filters : Array<Filter>);
```
|parameter|type|default|description|
|:-------|:--:|:-----:|:----------|
|type|string|none, required|The URL for the custom theme API endpoint|
|fields|string|`[]`|Array of frontId used to identify the fileds for the items|
|i18n|boolean|`false`|If you want i18n information for each item in the archive|
|pagination|Pagination|`undefined`|A pagination object used to define if you need pagination `{ start : number, count : number }`|
|filters|Array\<Filter\>|`[]`|Array of filters object used as condition to filter the item in the archive, the object is composed like so `{ compare : string, key : string, value : string }`|

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
  "status": {
    "code": 200,
    "message": "Data loaded!",
    "cache": false
  }
}
```
### fetchExtra()

Fetch data considered to be extra in the Wordpress seetup
```typescript
Demetra.fetchExtra(slug : string);
```
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
    "status": {
        "code": 200,
        "message": "Data loaded!",
        "cache": false
    }
}
```