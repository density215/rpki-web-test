# rpki-web-test
RPKI web test tool testing valid ROA and invalid ROA http endpoint.

This is the repo that backs [RPKI WEB TEST](https://www.ripe.net/s/rpki-test/)

This small tool tests whether the client running it is connected to the internet through upstream router that performs Route Origin Validation according (ROA) in accordance with the Routing Public Key Infrastructure (RPKI).
You can read more about RPKI [here](https://rpki.readthedocs.io/en/latest/index.html).

## How does this work?
This tool will try to retrieve information from a specially conifgured mutli-homed webserver through two different IP addresses. One of these IP addresses is part of a prefix that is part of a valid ROA and the other IP address is part of a prefix that explicitly has an invalid ROA. If the tool can reach the webserver through the prefix with the valid ROA, but it times out connecting to the the prefix with the invalid ROA, it will conclude that somewhere along the route from the client to the server the prefix with ROA invalid is actively being dropped. Be aware that we cannot infer where along the route this packet is dropped, nor can we infer which along which AS path the packet travels.

The specially configured webserver this test uses is kindly hosted by Job Snijders. You can however configure this tool to use any webserver that's configured to do this, provided you have access to IP addresses within a valid ROA and an invalid ROA.

## What is in this repo?
This tool consists of three parts:
  * a web-client (that you can use [here](https://www.ripe.net/s/rpki-test/)) that will run in a browser and show a frown, meh or smiley face based on the outcome of the test. You can also host it yourself if you wish.
  * a javascript library that can be run from both node.js and from webbrowsers. It can be used through ES6 modules or CJS module (for node.js).
  * a CLI tool that performs the test and outputs the result in JSON. It is rather clunky now, since it has a complete nodejs environment embedded in it. given enough interest I can port this to a compiled language, so you can have a small binary. Also, I could add a traceroute engine to this CLI tool, so we could obtain more information about where along the route the invalid ROAs are dropped.

## Using the tool

### Web client
You can build the webclient yourself. The prerequisites for this are node 12.x or higher.
The you can:
```bash
npm install
npm run web
```
This will create a file ```/build/bundle.js``` that you'll need together with ```index.html```, ```manifest.webmanifest``` from the ```/html``` directory. Note that for this to correctly function it should be hosted on a TLS backed website, i.e. https.

### CLI Tool
The cli tool is also available under the [Releases](https://github.com/density215/rpki-web-test/releases). I've only included it for MacOs. Deployments for Linux and Windows can be made with the excellent [pkg](https://www.npmjs.com/package/pkg):
```bash
npm -g install pkg@4
npm install
TARGET=<YOU_TARGET_ARCH> npm run cli
```

### JS Library

#### Loading with CommonJs (node/require)
Under the [Releases](https://github.com/density215/rpki-web-test/releases) tab you can find a file ```librpkitest.js``` that contains a CJS library for use with webbrowsers (with require/r.js) and nodejs.

```javascript
const fetch = require('cross-fetch');
const librpkitest = require('./librpkitest');
```

#### Loading with ES6 Modules
If you're using ES6 modules you can use the file `librpkitest.js` in `/src` directly, like so:
```javascript
import { testRpkiInvalids } from "./librpkitest";
```

#### Bringing your own fetch implementation
For node.js you will have to bring your own `fetch` implementation. The `cross-fetch` [package](https://www.npmjs.com/package/cross-fetch) seems to be a good choice. You'll have to include the package and then pass it as an argument to the librpkitest library:

```javascript
const rpkiResult = testRpkiInvalids({fetch: fetch}).then(...);
```

### Using the library

The Library has only one public function named ```testRpkiInvalids```.

#### Arguments
The ```testRpkiInvalids``` function accepts an `arguments` object with the following fields:

name | type | **default** | description
---- | ---- | ----------- | -----------
enrich | bool | **false** | Sets whether the prefix and ASN belonging to the client IP address will be retrieved
postResult | bool | **false** | Sets whether the result will be posted to a logging server
invalidTimeout | Number | **5000** | Timeout in milliseconds after which the invalid ROA request is considered blocked.
fetch | function | **window.fetch*** | The fetch used to make the HTTP requests.
callBacks | object with `stageName`:`callBack Function` pairs | {} | At the end of each stage a callBack can be invoked (i.e., to render stuff to the clientscreen)

### Usage
The ```tesRpkiInvalids``` function returns a Promise wrapping a Result object.

```javascript
// require:
// const librpkitest = require("./librpkitest");
// librpkitest.testRpkiInvalids(...)

// es6:
// import { testRpkiInvalids } from "librpkitest";

testRpkiInvalids({
    enrich: true,
    postResult: true
  }).then(
    rpkiResult => {
      console.log("rpki test result came in.");
      console.log(rpkiResult);
    },
    err => {
      console.log("errored out");
      console.log(err);
    }
  );
```

### Output
the ```testRpkiInvalids``` function returns a Promise that resolved into a Result object:

#### Result object
  * rpki-valid-passed (**bool**) whether all rpki valid requests returned a non-error response
  * rpki-invalid-passed (**bool**) whether all rpki invalid requests returned a non-error response
  * events: (**array of Event objects**) all events of all stages appended. See down below for details
  * lastStage: (**stageId**) the last stage before returning the result, should be "finished"
  * lastErrorStage: (**stageId**) the stage where the last error occurred
  * lastError: (**Error**) the last encountered error

#### Event object
  * stage (**string**) id of the stage
  * error (**Error**) error if thrown
  * successs (**bool**) stage finished without errors
  * data (**object**) data returned by this stage
  
The data object for each stage, will always have either a  `startDateTime` field that represents the start of a timer or a ```duration``` field, the time in ms from the start of that timer.

#### Stage/State machine
The ```testRpkiInvalids``` function will go concurrently through a few stages and will report on the final state of each of these stages.
Each stage will go through one or more states and will setlle on a final state that will end up in the ```events``` object in the returned result.

Here are the stages and their encapsulated states, like [state A] -> [state B | state C]. Stages are encapsulated in square brackets, are unnamed and can either have one possible final state (the names inside the brackets).
So, [initialized] in a stage with one possible final state, whereas [validAwait | validReceived] is a stage with two possible final states.

                                       [initialized]
                                             |
                                 + --------- + --------- +
                                 |                       |
          [validAwait | validReceived]             [invalidAwait | invalidReceived | invalidBlocked]
                                 |                       |
                                 + --------- + --------- +
                                             |
                              [enrichedAwait | enrichedReceived]
                                             |
                          [resultPostedAwait | resultPostedConfirmed]
                                             |
                                         [finished]




### Sample output for a successful RPKI test
```json
{
  "rpki-valid-passed": true,
  "rpki-invalid-passed": false,
  "lastStage": "finished",
  "lastErrorStage": null,
  "lastError": null,
  "ip": "83.160.104.137",
  "asn": ["3265"],
  "pfx": "83.160.0.0/14",
  "events": [
    {
      "stage": "initialized",
      "error": null,
      "success": true,
      "data": {
        "testUrls": [
          {
            "url": "https://038c8427-6c0e-4ad3-b42c-152d1f8c7343.rpki-valid-beacon.meerval.net/valid.json",
            "addressFamily": 4
          },
          {
            "url": "https://038c8427-6c0e-4ad3-b42c-152d1f8c7343.rpki-invalid-beacon.meerval.net/invalid.json",
            "addressFamily": 4
          }
        ],
        "startDateTime": "2019-10-31T17:06:28.153Z",
        "originLocation": null,
        "userAgent": "rpki-web-test-0.0.1",
        "options": {
          "enrich": true,
          "invalidTimeout": 5000,
          "postResult": true
        }
      }
    },
    {
      "stage": "validReceived",
      "error": null,
      "data": {
        "ip": "83.160.104.137",
        "rpki-valid-passed": true,
        "duration": 562,
        "testUrl": "https://038c8427-6c0e-4ad3-b42c-152d1f8c7343.rpki-valid-beacon.meerval.net/valid.json",
        "addressFamily": 4
      },
      "success": true
    },
    {
      "stage": "invalidBlocked",
      "data": {
        "rpki-invalid-passed": false,
        "lastError": null,
        "duration": 5026,
        "testUrl": "https://038c8427-6c0e-4ad3-b42c-152d1f8c7343.rpki-invalid-beacon.meerval.net/invalid.json",
        "addressFamily": 4
      },
      "success": true,
      "error": null
    },
    {
      "stage": "enrichedReceived",
      "data": {
        "ip": "83.160.104.137",
        "asns": ["3265"],
        "prefix": "83.160.0.0/14",
        "enrichUrl": "https://stat.ripe.net/data/network-info/data.json?resource=83.160.104.137",
        "duration": 5420
      },
      "error": null,
      "success": true
    },
    {
      "stage": "resultPostedConfirmed",
      "error": null,
      "successs": true,
      "data": {
        "postUrl": "https://rpki-browser.webmeasurements.net/results/",
        "payload": {
          "events": [
            {
              "stage": "initialized",
              "error": null,
              "success": true,
              "data": {
                "testUrls": [
                  {
                    "url": "https://038c8427-6c0e-4ad3-b42c-152d1f8c7343.rpki-valid-beacon.meerval.net/valid.json",
                    "addressFamily": 4
                  },
                  {
                    "url": "https://038c8427-6c0e-4ad3-b42c-152d1f8c7343.rpki-invalid-beacon.meerval.net/invalid.json",
                    "addressFamily": 4
                  }
                ],
                "startDateTime": "2019-10-31T17:06:28.153Z",
                "originLocation": null,
                "userAgent": "rpki-web-test-0.0.1",
                "options": {
                  "enrich": true,
                  "invalidTimeout": 5000,
                  "postResult": true
                }
              }
            },
            {
              "stage": "validReceived",
              "error": null,
              "data": {
                "ip": "83.160.104.137",
                "rpki-valid-passed": true,
                "duration": 562,
                "testUrl": "https://038c8427-6c0e-4ad3-b42c-152d1f8c7343.rpki-valid-beacon.meerval.net/valid.json",
                "addressFamily": 4
              },
              "success": true
            },
            {
              "stage": "invalidBlocked",
              "data": {
                "rpki-invalid-passed": false,
                "lastError": null,
                "duration": 5026,
                "testUrl": "https://038c8427-6c0e-4ad3-b42c-152d1f8c7343.rpki-invalid-beacon.meerval.net/invalid.json",
                "addressFamily": 4
              },
              "success": true,
              "error": null
            },
            {
              "stage": "enrichedReceived",
              "data": {
                "ip": "83.160.104.137",
                "asns": ["3265"],
                "prefix": "83.160.0.0/14",
                "enrichUrl": "https://stat.ripe.net/data/network-info/data.json?resource=83.160.104.137",
                "duration": 5420
              },
              "error": null,
              "success": true
            }
          ],
          "rpki-valid-passed": true,
          "rpki-invalid-passed": false,
          "lastStage": "enrichedReceived",
          "lastErrorStage": null,
          "lastError": null,
          "ip": "83.160.104.137",
          "asn": ["3265"],
          "pfx": "83.160.0.0/14"
        },
        "duration": 6262
      }
    },
    {
      "stage": "finished",
      "data": { "duration": 6262 },
      "error": null,
      "success": true
    }
  ]
}
```
