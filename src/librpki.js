import { v4 } from "uuid";

const RPKI_VALID_URL = "rpki-valid-beacon.meerval.net";
const RPKI_INVALID_URL = "rpki-invalid-beacon.meerval.net";
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
  (typeof window !== "undefined" && window.location.origin) || null;

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
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      // note that this promise will resolve after time `dur`
      // but if the resolve was already called by the promise.then
      // down here (because the invalid endpoint returned a response)
      // the resolve will be ignored.
      const stage = "invalidBlocked";
      // we don't have access to the module scoped rpkiResult here
      const intermediaryRpkiResult = {
        "rpki-invalid-passed": false,
        stage: stage,
        error: null
      };
      resolve(intermediaryRpkiResult);
    }, dur);
    promise.then(resolve, reject);
  });
};

export const testRpkiInvalids = opts => {
  const {
    enrich = false,
    postResult = false,
    invalidTimeout = INVALID_TIMEOUT,
    fetch = fetchFn,
    callBacks = {}
  } = opts;

  if (!fetch) {
    return Promise.reject(
      "no fetch function available. Use node-fetch module or other and pass it as argument 'fetch'"
    );
  }

  const createRpkiTestUrl = ({ uuid, valid = false, protocol = "https" }) => [
    `${protocol}://${uuid}.${(valid && RPKI_VALID_URL) ||
      RPKI_INVALID_URL}/${(valid && "valid") || "invalid"}.json`,
    fetch
  ];

  const newUuid = v4();

  // inital state of the result object
  let rpkiResult = {
    "rpki-valid-passed": null, // true | false
    "rpki-invalid-passed": null, // true | false
    events: [],
    stage: stage, // initialized -> (validAwait | validReceived)
    // -> (invalidAwait | invalidBlocked | invalidReceived) -> [enrichedReceived | enrichedAwait ]
    // -> (postedSent | postedAwait )
    // -> finished
    error: null // string
  };

  const stage = "initialized";
  const validTestUrl = createRpkiTestUrl({
    uuid: newUuid,
    valid: true
  });
  const invalidTestUrl = createRpkiTestUrl({
    uuid: newUuid,
    valid: false
  });

  const startTs = Date.now();

  rpkiResult.events.push({
    stage: stage,
    error: null,
    success: true,
    data: {
      testUrls: [
        { url: validTestUrl[0], addressFamily: 4 },
        { url: invalidTestUrl[0], addressFamily: 4 }
      ],
      startDateTime: new Date(),
      originLocation: originLocation,
      userAgent: userAgent,
      options: { enrich, invalidTimeout, postResult }
    }
  });
  callBacks[stage] && callBacks[stage](rpkiResult);

  return loadResource(...validTestUrl)
    .then(
      validR => {
        const stage = "validReceived";
        rpkiResult = {
          ...rpkiResult,
          ...validR,
          stage: stage,
          error: null,
          events: [
            ...rpkiResult.events,
            {
              stage,
              error: null,
              data: {
                ...validR,
                duration: Date.now() - startTs,
                testUrl: validTestUrl[0],
                addressFamily: (validR.ip.match(/\:/) && 6) || 4
              },
              success: true
            }
          ],
          ip: validR.ip
        };
        callBacks[stage] && callBacks[stage](rpkiResult);

        return timeout(loadResource(...invalidTestUrl), invalidTimeout);
      },
      err => {
        const stage = "validAwait";
        rpkiResult.events.push({
          stage: stage,
          error: err,
          success: false,
          data: { duration: Date.now() - startTs, testUrl: validTestUrl[0] }
        });
        // frown
        // pass this on as a new promise to keep the chain intact.
        callBacks[stage] && callBacks[stage](rpkiResult);
        return Promise.reject({
          ...rpkiResult,
          stage: stage,
          error: (err && err.detail) || err
        });
      }
    )
    .then(
      invalidR => {
        // could be frown, meh or smile
        let stage = (invalidR.stage && invalidR.stage) || "invalidReceived";
        rpkiResult = {
          ...rpkiResult,
          ...invalidR,
          events: [
            ...rpkiResult.events,
            {
              stage,
              data: {
                ...invalidR,
                duration: Date.now() - startTs,
                testUrl: invalidTestUrl[0],
                addressFamily: 4
              },
              success: true,
              error: null
            }
          ]
        };

        callBacks[stage] && callBacks[stage](rpkiResult);

        if (enrich) {
          return loadIpPrefixAndAsn(rpkiResult.ip).then(
            r => {
              let stage = "enrichedReceived";
              rpkiResult = {
                ...rpkiResult,
                events: [
                  ...rpkiResult.events,
                  {
                    stage,
                    data: { ...r, duration: Date.now() - startTs },
                    error: null,
                    success: true
                  }
                ],
                ip: r.ip,
                asn: r.asns,
                pfx: r.prefix,
                stage,
                error: null
              };
              callBacks[stage] && callBacks[stage](rpkiResult);

              return rpkiResult;
            },
            err => {
              let stage = "enrichedAwait";
              rpkiResult = {
                ...rpkiResult,
                error: (err.detail && err.detail) || err,
                events: [
                  ...rpkiResult.events,
                  {
                    stage,
                    data: {
                      duration: Date.now() - startTs,
                      enrichUrl: NETWORK_INFO_URL
                    },
                    error: err,
                    success: false
                  }
                ]
              };
              callBacks[stage] && callBacks[stage](rpkiResult);

              return rpkiResult;
            }
          );
        } else {
          return rpkiResult;
        }
      },
      err => {
        // frown
        const stage = "invalidAwait";
        rpkiResult.events.push({
          stage: stage,
          error: null,
          success: false,
          data: null
        });
        callBacks[stage] && callBacks[stage](rpkiResult);
        return Promise.reject({
          ...rpkiResult,
          stage: stage,
          error: (err.detail && err.detail) || err
        });
      }
    )
    .then(
      rpkiResult => ({
        ...rpkiResult,
        stage: "finished",
        error: null,
        events: [
          ...rpkiResult.events,
          {
            stage: "finished",
            data: { duration: Date.now() - startTs },
            error: null,
            success: true
          }
        ]
      }),
      finalErr => {
        return {
          ...rpkiResult,
          stage: "finished",
          data: { duration: Date.now() - startTs },
          error: finalErr,
          events: [
            ...rpkiResult.events,
            { stage: "finished", error: finalErr, data: null, success: false }
          ]
        };
      }
    );
};

export const loadResource = async (fetchUrl, fetchFn = fetch) => {
  let response = await fetchFn(fetchUrl).catch(errHandler);

  let resultData = await response.json().catch(err => {
    console.debug(err);
    return Promise.reject({
      status: response.status,
      detail: "The response is not in JSON format"
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
        status: response.status
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
      error.title;

    const statusErr = { status: response.status, detail: detailText };
    return Promise.reject(statusErr);
  }

  return resultData;
};

export const postRpkiResult = ({
  rpkiResult,
  postResultsUrl = POST_RESULTS_URL,
  fetchFn = fetch
}) => {
  fetchFn(`${postResultsUrl}`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      json: {
        "rpki-valid-passed": rpkiResult["rpki-valid-passed"],
        "rpki-invalid-passed": rpkiResult["rpki-invalid-passed"],
        pfx: rpkiResult["pfx"],
        asns: rpkiResult["asns"]
      }
    })
  });
};

export const loadIpPrefixAndAsn = myIp => {
  const fetchUrl = `${NETWORK_INFO_URL}${myIp}`;
  if (!myIp) {
    return Promise.reject({
      error: "no ip address supplied."
    });
  }

  return loadResource(fetchUrl, fetch).then(
    r => {
      const myPrefix = (r.status === "ok" && r.data.prefix) || null;
      const myAsns = (r.status === "ok" && r.data.asns) || null;
      return { ip: myIp, asns: myAsns, prefix: myPrefix, enrichUrl: fetchUrl };
    },
    err => {
      console.error("could not retrieve ASN and/or prefix");
      err.detail = `could not retrieve ASN and/or prefix from ${fetchUrl}`;
      return Promise.reject(err);
    }
  );
};
