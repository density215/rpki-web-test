import { v4 } from "uuid";

// only Edge needs this currently (10/2019)
import allSettled from "promise.allsettled";
allSettled.shim();

const RPKI_VALID_URL_4 = "rpkitest4.nlnetlabs.nl";
const RPKI_VALID_URL_6 = "rpkitest6.nlnetlabs.nl";
const RPKI_INVALID_URL = "";
const POST_RESULTS_URL = "https://rpki-browser.webmeasurements.net/results/";
const NETWORK_INFO_URL =
  "https://stat.ripe.net/data/network-info/data.json?resource=";
const INVALID_TIMEOUT = 5000;

// node clients should pass in their own fetch function,
// probably from the node-fetch npm module, but axios will
// also work I guess (untested).
// We're not importing that here, to keep bundle size down for
// web clients.
const fetchFn = (typeof window !== "undefined" && window.fetch) || null;
const userAgent =
  (typeof navigator !== "undefined" && navigator.userAgent) ||
  __RELEASE_STRING__;
const originLocation =
  (typeof window !== "undefined" && window.location.href) || null;

let rpkiResult = { events: [] };

// Enrich the standard js error
// with a `detail` attribute.
// The API throws errors that includes this field
// So we don't have two write two separate handlers
// upstream.
function errHandler(err) {
  console.debug(err);
  err.detail = err.message;
  throw err;
}

// Will return a resolved promise after 5000ms (default) of inactivity,
// will return the actual promise if it settles within that time.
// So the last case might be a resolve (so NOT dropping invalids)
// or an error (which we return).
const timeout = async (promise, dur) => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      // note that this promise will resolve after time `dur`
      // but if the resolve was already called by the promise.then
      // down here (because the invalid endpoint returned a response)
      // the resolve will be ignored.
      const stage = "invalidBlocked";
      // we don't have access to the module scoped rpkiResult here
      const intermediaryRpkiResult = {
        "rpki-invalid-passed": false,
        stage: stage,
        lastError: null,
      };
      resolve(intermediaryRpkiResult);
    }, dur);
    promise.then(resolve, reject);
  });
};

export const testRpkiInvalids = (opts) => {
  opts = (opts && opts) || {};
  const {
    enrich = false,
    postResult = false,
    invalidTimeout = INVALID_TIMEOUT,
    fetch = fetchFn,
    callBacks = {},
  } = opts;

  if (!fetch) {
    return Promise.reject(
      "no fetch function available. Use node-fetch module or other and pass it as argument 'fetch'"
    );
  }

  const createRpkiTestUrl = ({
    url,
    invalid_url,
    valid = false,
    addressFamily,
    protocol = "https",
  }) => [
    `${protocol}://${(valid && url) || invalid_url}/${
      (valid && "valid") || "invalid"
    }.json`,
    fetch,
    addressFamily,
  ];

  const newUuid = v4();
  const validTestUrl4 = createRpkiTestUrl({
    url: RPKI_VALID_URL_4,
    uuid: newUuid,
    valid: true,
    addressFamily: 4,
  });
  const validTestUrl6 = createRpkiTestUrl({
    url: RPKI_VALID_URL_6,
    uuid: newUuid,
    valid: true,
    addressFamily: 6,
  });
  const invalidTestUrl = createRpkiTestUrl({
    url: RPKI_INVALID_URL,
    uuid: newUuid,
    valid: false,
  });

  const startTs = Date.now();

  const stageInitialize = () => {
    const stage = "initialized";

    // inital state of the result object
    rpkiResult = {
      ...rpkiResult,
      "rpki-valid-passed-v4": null, // true | false
      "rpki-valid-passed-v6": null, // true | false
      "no-rpki-invalid-test": RPKI_INVALID_URL == "",
      events: [],
      lastStage: stage, // initialized -> (validAwait | validReceived)
      // -> (invalidAwait | invalidBlocked | invalidReceived) -> [enrichedReceived | enrichedAwait ]
      // -> (postedSent | postedAwait )
      // -> finished
      lastErrorStage: null,
      lastError: null, // string
      perAf: [],
    };

    const event = {
      stage: stage,
      error: null,
      success: true,
      data: {
        testUrls: [
          { url: validTestUrl4[0], addressFamily: 4 },
          { url: validTestUrl6[0], addressFamily: 6 },
          { url: invalidTestUrl[0], addressFamily: 4 },
        ],
        startDateTime: new Date(),
        originLocation: originLocation,
        userAgent: userAgent,
        options: { enrich, invalidTimeout, postResult },
      },
    };
    rpkiResult = { ...rpkiResult, events: [...rpkiResult.events, event] };
    callBacks[stage] && callBacks[stage](rpkiResult);
    return Promise.resolve(event);
  };

  // try valid, stage validReceived, validAwait
  const stageTestValid = (validTestUrl) =>
    loadResource(...validTestUrl).then(
      (validR) => {
        const stage = "validReceived";
        const event = {
          stage,
          error: null,
          data: {
            ...validR,
            duration: Date.now() - startTs,
            testUrl: validTestUrl[0],
            addressFamily: validTestUrl[2],
          },
          success: true,
        };
        let rpkiValidKey = `rpki-valid-passed-v${validTestUrl[2]}`;
        rpkiResult[rpkiValidKey] = true;
        rpkiResult = {
          ...rpkiResult,
          ...validR,
          lastStage: stage,
          events: [...rpkiResult.events, event],
          perAf: [...rpkiResult.perAf, { ip: validR.ip, af: validTestUrl[2] }],
        };
        callBacks[stage] && callBacks[stage](rpkiResult);
        return Promise.resolve(event);
      },
      (err) => {
        const stage = "validAwait";
        const event = {
          stage: stage,
          error: err,
          success: false,
          data: { duration: Date.now() - startTs, testUrl: validTestUrl[0] },
        };
        let rpkiValidKey = `rpki-valid-passed-v${validTestUrl[2]}`;
        rpkiResult[rpkiValidKey] = false;
        rpkiResult = {
          ...rpkiResult,
          lastStage: stage,
          lastErrorStage: stage,
          lastError: err,
          events: [...rpkiResult.events, event],
        };
        // frown
        // pass this on as a new promise to keep the chain intact.
        callBacks[stage] && callBacks[stage](rpkiResult);
        return Promise.reject(event);
      }
    );
  // try invalid, stages invalidAwait,
  const stageTestInvalid = (invalidTestUrl) => {
    if (RPKI_INVALID_URL == "") {
      return Promise.resolve({
        stage: "invalidAwait",
        error: null,
        success: true,
      });
    }
    timeout(loadResource(...invalidTestUrl), invalidTimeout).then(
      (invalidR) => {
        // could be frown, meh or smile
        const stage = (invalidR.stage && invalidR.stage) || "invalidReceived";
        delete invalidR.stage;
        const event = {
          stage,
          data: {
            ...invalidR,
            duration: Date.now() - startTs,
            testUrl: invalidTestUrl[0],
            addressFamily: 4,
          },
          success: true,
          error: null,
        };
        rpkiResult = {
          ...rpkiResult,
          ...invalidR,
          lastStage: stage,
          events: [...rpkiResult.events, event],
        };
        callBacks[stage] && callBacks[stage](rpkiResult);
        return Promise.resolve(event);
      },
      (err) => {
        // frown
        const stage = "invalidAwait";
        const event = {
          stage: stage,
          error: err,
          data: {
            duration: Date.now() - startTs,
            testUrl: invalidTestUrl[0],
            addressFamily: 4,
          },
          success: false,
        };
        let rpkiValidKey = `rpki-valid-passed-v${validTestUrl[2]}`;
        rpkiResult[rpkiValidKey] = false;
        rpkiResult = {
          ...rpkiResult,
          lastStage: stage,
          lastErrorStage: stage,
          lastError: err,
          events: [...rpkiResult.events, event],
        };
        callBacks[stage] && callBacks[stage](rpkiResult);
        return Promise.reject(event);
      }
    );
  };

  const stageEnrich = () => {
    console.log("start enriching...");
    console.log(rpkiResult.perAf);
    rpkiResult.perAf.forEach((af) => {
      console.log(`enriching: ${af.ip}`);
      loadIpPrefixAndAsn(af.ip, fetch).then(
        (r) => {
          const stage = "enrichedReceived";
          const event = {
            stage,
            data: { ...r, duration: Date.now() - startTs },
            error: null,
            success: true,
          };
          rpkiResult = {
            ...rpkiResult,
            events: [...rpkiResult.events, event],
            perAf: [
              ...rpkiResult.perAf.filter(ip => ip.af !== af.af),
              { ip: r.ip, asn: r.asns, pfx: r.prefix },
            ],
            lastStage: stage,
          };
          callBacks[stage] && callBacks[stage](rpkiResult);
          return Promise.resolve(event);
        },
        (err) => {
          const stage = "enrichedAwait";
          const event = {
            stage,
            data: {
              duration: Date.now() - startTs,
            },
            error: err,
            success: false,
          };
          rpkiResult = {
            ...rpkiResult,
            lastStage: stage,
            lastErrorStage: stage,
            lastError: err,
            events: [...rpkiResult.events, event],
          };
          callBacks[stage] && callBacks[stage](rpkiResult);
          return Promise.reject(event);
        }
      );
    });
  };

  const stagePostResult = () =>
    fetch(`${POST_RESULTS_URL}`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json: rpkiResult,
      }),
      // keep the promise chain alive, we have to
      // return the rpkiResult to be worken on
      // by the next Promise.
    }).then(
      (r) => {
        const stage = "resultPostedConfirmed";
        const event = {
          stage: stage,
          error: null,
          successs: true,
          data: {
            postUrl: POST_RESULTS_URL,
            payload: rpkiResult,
            duration: Date.now() - startTs,
          },
        };
        rpkiResult = {
          ...rpkiResult,
          lastStage: stage,
          events: [...rpkiResult.events, event],
        };
        return Promise.resolve(event);
      },
      (err) => {
        err.detail = "could not post the results";
        err.payload = rpkiResult;
        err.url = POST_RESULTS_URL;
        const stage = "resultPostedAwait";
        const event = {
          stage: stage,
          error: err,
          data: null,
          success: false,
        };
        rpkiResult = {
          ...rpkiResult,
          lastStage: stage,
          lastErrorStage: stage,
          lastError: err,
          events: [...rpkiResult.events, event],
        };
        return Promise.reject(event);
      }
    );

  const stageFinishSuccessful = () => {
    const stage = "finished";
    const event = {
      stage: stage,
      data: { duration: Date.now() - startTs }, //, rpkiResult: rpkiResult }, this is kinda correct, but clutters the complete result with duplicated info.
      error: null,
      success: true,
    };
    rpkiResult = {
      ...rpkiResult,
      lastStage: stage,
      events: [...rpkiResult.events, event],
    };
    return rpkiResult;
  };

  const stageFinishError = (finalErr) => {
    const stage = "finished";
    const event = {
      stage: stage,
      error: finalErr,
      data: null,
      success: false,
    };
    rpkiResult = {
      ...rpkiResult,
      // lastErrorStage: stage, // do not set this here, the error propagated out of the promise before this one.
      lastStage: stage,
      // lastError: finalErr,
      data: { duration: Date.now() - startTs },
      events: [...rpkiResult.events, event],
    };
    return rpkiResult;
  };

  return stageInitialize()
    .then(() => {
      let promises = [
        stageTestValid(validTestUrl4),
        stageTestValid(validTestUrl6),
      ];
      if (RPKI_INVALID_URL !== "") {
        promises.push(stageTestInvalid(invalidTestUrl));
      }
      return Promise.allSettled(promises);
    })
    .then(() => {
      if (enrich) {
        return stageEnrich();
      } else return Promise.resolve();
    })
    .then(() => {
      if (postResult) {
        return stagePostResult();
      } else return Promise.resolve();
    })
    .then(stageFinishSuccessful, stageFinishError);
};

const loadResource = async (fetchUrl, fetchFn = fetch) => {
  let response = await fetchFn(fetchUrl).catch(errHandler);

  let resultData = await response.json().catch((err) => {
    console.debug(err);
    console.debug(response.json);

    console.debug(response);
    return Promise.reject({
      status: response.status,
      detail: "The response is not in JSON format",
    });
  });

  // Browser getting HTTP error code back from xhr calls
  // do not necessarily throw JS errors (e.g. 404)!
  // So we need to check the ok field of the response
  // and reject the Promise accordingly.
  if (!response.ok) {
    console.debug("HTTP status code indicated error.");
    console.debug(response);

    const error = resultData.error;
    console.debug(error);

    // if the status and ok fields in the response object inidicate
    // an eror, we would expect a body that holds an 'error' object.
    // If it doesn't than probably the server errored out itself
    // and just returned an HTTP error code without constructing a payload.
    // Alternatively it might have returned syntactically incorrect JSON
    // like, well, HTML
    if (!error) {
      return Promise.reject({
        detail:
          "The server threw an error, additionally the JSON from the response of the server could not be parsed (or was not available at all).",
        status: response.status,
      });
    }

    // We have an HTTP error and a JSON Payload!

    // Check to see if there's any kind of error message.
    // That might be in the form of
    // { error: { errors: [...]}} in case of the EL api returning an error (e.g. 404, integer overflow)
    // or { status: ..., statusText: ..., detail: ...} in case of DRF returning (e.g. 403)
    // or the 'detail' field might be missing, so that we only have the `status` (HTTP code)
    const detailText =
      (error.errors && error.errors.length > 0 && error.errors[0].detail) ||
      error.detail ||
      error.title ||
      response.statusText;

    const statusErr = { status: response.status, detail: detailText };
    return Promise.reject(statusErr);
  }

  return resultData;
};

const loadIpPrefixAndAsn = (ipAddress, fetchFn = fetch) => {
  const fetchUrl = `${NETWORK_INFO_URL}${ipAddress}`;
  if (!ipAddress) {
    return Promise.reject({
      detail: "no ip address supplied.",
    });
  }

  return loadResource(fetchUrl, fetchFn).then(
    (r) => {
      const myPrefix = (r.status === "ok" && r.data.prefix) || null;
      const myAsns = (r.status === "ok" && r.data.asns) || null;
      return {
        ip: ipAddress,
        asns: myAsns,
        prefix: myPrefix,
        enrichUrl: fetchUrl,
      };
    },
    (err) => {
      console.debug(err);
      console.error("could not retrieve ASN and/or prefix");
      err.detail = `could not retrieve ASN and/or prefix`;
      err.url = fetchUrl;
      return Promise.reject(err);
    }
  );
};
