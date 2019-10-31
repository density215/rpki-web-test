# rpki-web-test
RPKI web test testing valid ROA and invalid ROA http endpoint.

This is the repo that backs [RPKI WEB TEST](https://www.ripe.net/s/rpki-test/)

This small tool tests whether the host running it has an internet connection that has an upstream router that performs Route Origin Validation according (ROA) in accordance with the Routing Public Key Infrastructure (RPKI).
You can read more about RPKI [here](https://rpki.readthedocs.io/en/latest/index.html).

## How does this work?

This tool will try to retrieve information from a mutli-homed webserver. One route to the server connects through an IP address in a prefix that's inside a valid ROA.
The other connection comes in on an IP address that is part of prefix that has an invalid ROA. If the tool can reach the webserver through the prefix with the valid ROA, but it times out connecting to the the prefix with the invalid ROA,
it will conclude that somewhere along the route from the client to the server the prefix with ROA invalid is actively being dropped.

## What is in this repo?

This tool consists of 
  * a web-client (that you can use [here](https://www.ripe.net/s/rpki-test/)). You can also host it yourself if you wish.
  * a javascript library that can be run from both node.js and from webbrowsers.
  * a CLI tool. It is rather clunky now, since it has a complete nodejs environment embedded in it. given enough interest I can port this to a compiled language, so you can have a small binary. Also, I could add a traceroute engine to this CLI tool, so we could obtain more information about where along the route the invalid ROAs are dropped.

## Using the tool

### Web client

You can build the webclient yourself. The prerequisites for this are node 12.x or higher.
The you can:
```bash
npm install
npm run web
```
This will create a file ```/build/bundle.js``` that you'll need together with ```index.html```, ```manifest.webmanifest``` from the ```/html``` directory. Put this somewhere on a webserver that knows how to speak https and your good to go.

### JS Library

#### CommonJs (node)
Under the [Releases](https://github.com/density215/rpki-web-test/releases) tab you can find a file ```librpkitest.js``` that contains a CJS library for use with webbrowsers (with require) and nodejs.
If you use this in need you will have to bring your own `fetch` implementation. `cross-fetch` seems to be a good library for this:
```javascript
const fetch = require('cross-fetch');
const librpkitest = require('./librpkitest');
```

#### ES6 Modules
If you're using ES6 modules you can use the file `librpkitest.js` in `/src` directly, like so:
```javascript
import { testRpkiInvalids } from "./librpkitest";
```

More usage details are down below.

### CLI Tool

The cli tool is also available under the [Releases](https://github.com/density215/rpki-web-test/releases). I've only included it for MacOs. Deployments for Linux and Windows can be made with the excellent [pkg](https://www.npmjs.com/package/pkg):
```bash
npm -g install pkg@4
npm install
TARGET=<YOU_TARGET_ARCH> npm run cli
```

### Using the library

The Library has only one public function named ```testRpkiInvalids```.

#### Arguments

The ```testRpkiInvalids``` accepts an arguments object with the following fields:

name | type | **default** | description
---- | ---- | ----------- | -----------
enrich | bool | **false** | Sets whether the prefix and ASN belonging to the client IP address will be retrieved
postResult | bool | **false** | Sets whether the result will be posted to a logging server
invalidTimeout | Number | 5000 | Timeout in milliseconds after which the invalid ROA request is considered blocked.
fetch | function | window.fetch | The fetch function to use for making web requests.
callBacks | object with `stageName`:`callBack Function` pairs | {} | At the end of each stage a callBack can be invoked (i.e., to render stuff to the clientscreen)

#### Stage/State machine

The ```testRpkiInvalids``` function will go linearly through a few stages and will report on the final state of each of these stages.
Each stage will go through one or more states and will setlle on a final state that will end up in the ```events``` object in the returned result.

Here are the stages and their encapsulated states, like state A -> [state B | state C]. Stages are separated by arrows, are unnamed and can either have one possible final state.
The first stage is one such stage, whereas the second stage has two possible final states.

initialized ->
[validAwait | validReceived] ->
[invalidAwait | invalidReceived | invalidBlocked] ->
[enrichedAwait | enrichedReceived] ->
[resultPostedAwait | resultPostedConfirmed] ->
finished

### Output

the ```testRpkiInvalids()``` function returns a Promise that wraps a Result object:

#### Result object

  * rpki-valid-passed (**bool**) whether all rpki valid requests returned a non-error response
  * rpki-invalid-passed (**bool**) whether all rpki invalid requests returned a non-error response
  * events: (**array of Event objects**) all events of all stages appended
  * lastStage: (**stageId**) the last stage before returning the result, should be "finished"
  * lastErrorStage: (**stageId**) the stage where the last error occurred
  * lastError: (**Error**) the last encountered error
  * startDateTime: (**DateTime**) the datetime at the start of the initialization stage

#### Event object

  * stage (**string**) id of the stage
  * error (**Error**) error if thrown
  * successs (**bool**) stage finished without errors
  * data (**object**) data returned by this stage, will always have a ```duration``` field, the time in ms from the start of the initialization stage.
  
### Example Usage

```javascript
// require:
// const librpkitest = require("./librpkitest");
// librpkitest.testRpkiInvalids(...)

testRpkiInvalids({
    enrich: true,
    postResult: true
  }).then(
    r => {
      console.log("rpki result came in.");
      console.log(r);
    },
    err => {
      console.log("errored out");
      console.log(err);
    }
  );
```
