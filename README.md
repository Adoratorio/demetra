# Demetra README

# Demetra

A utility library for Wordpress custom api interaction, using the **adora-theme** endpoint.

## Installation

    # Install package
    npm install @adoratorio/demetra

## Usage

Since this package has a [pkg.module](https://github.com/rollup/rollup/wiki/pkg.module) field, it’s highly recommended to import it as an ES6 module with some bundlers like [webpack](https://webpack.js.org/) or [rollup](https://rollupjs.org/):

    import Demetra from '@adoratorio/demetra';
    const demetra = new Demetra({ });

If you are not using any bundlers, you can just load the UMD bundle:

    <script src="/medusa/umd/index.js"></script>
    <script>var medusa = window.Demetra({ });</script>

## Available options

Medusa accept in the constructor and `option` object with the following possible props.

[Untitled](https://www.notion.so/b14ec76a630d46599027095404d6b046)

## APIs

### fetchPage()

Use this method to get pages details, the method accept the following params

    Demetra.fetchPage(slug : string | number, type : string, i18n : boolean, siblings : boolean, fields : Array<string>, prev : boolean, next : boolean, loop: boolean);

[Untitled](https://www.notion.so/3a800412c7894ae6b6ef24d7aea9b889)

The returned object will be in the following form

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

### fetchMenu()

Fetch content for a menu

    Demetra.fetchMenu(slug : string | number);

The returned object will be in the following form

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

### fetchArchive()

Retrive the information and the content for an archive (a collection of items)

    Demetra.fetchArchive(type : string, fields : Array<string>, i18n : boolean, pagination : Pagination, filters : Array<Filter>);

[Untitled](https://www.notion.so/a85d745af6944b92a41806a2f150f65b)

The returning object will be in the following form

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

### fetchExtra()

Fetch data considered to be extra in the Wordpress seetup

    Demetra.fetchExtra(slug : string);

The returning object will be in the following form

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