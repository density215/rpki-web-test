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
const fetch = (typeof window !== "undefined" && window.fetch) || null;

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
      resolve({
        "rpki-invalid-passed": false,
        stage: "invalidBlocked",
        error: null
      });
    }, dur);
    promise.then(resolve, reject);
  });
};

export const testRpkiInvalids = ({
  enrich = false,
  postResult = false,
  invalidTimeout = INVALID_TIMEOUT,
  fetch = fetch
}) => {
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

  console.debug("generating uuid...");

  const newUuid = v4();
  let rpkiResult = {
    "rpki-valid-passed": null, // true | false
    "rpki-invalid-passed": null, // true | false
    stage: "initialized", // initialized -> (validAwait | validReceived)
    // -> (invalidAwait | invalidBlocked | invalidReceived) -> [enrichedReceived | enrichedAwait ]
    // -> (postedSent | postedAwait )
    // -> finished
    error: null // string
  };

  console.debug(
    `testing valid rpki prefix to ${
      createRpkiTestUrl({
        uuid: newUuid,
        valid: true
      })[0]
    }...`
  );
  console.debug(
    `testing invalid rpki prefix...${
      createRpkiTestUrl({
        uuid: newUuid,
        valid: false
      })[0]
    }`
  );

  return loadResource(...createRpkiTestUrl({ uuid: newUuid, valid: true }))
    .then(
      validR => {
        rpkiResult = {
          ...rpkiResult,
          ...validR,
          stage: "validReceived",
          error: null
        };
        console.debug("valid passed.");
        return timeout(
          loadResource(...createRpkiTestUrl({ uuid: newUuid, valid: false })),
          invalidTimeout
        );
      },
      err => {
        console.debug("valid bounced.");
        console.debug(err);
        console.debug(err.status);
        console.debug(err.detail);
        // frown
        // pass this on as a new promise to keep the chain intact.
        return Promise.reject({
          ...rpkiResult,
          stage: "validAwait",
          error: (err && err.detail) || err
        });
      }
    )
    .then(
      invalidR => {
        console.debug("invalid passed.");
        // could be frown, meh or smile
        rpkiResult = { ...rpkiResult, ...invalidR };

        if (enrich) {
          return loadIpPrefixAndAsn({ rpkiResult, postResult });
        }

        return { ...rpkiResult, stage: "invalidReceived", error: null };
      },
      err => {
        console.debug("invalid returned error.");
        console.debug(err);
        console.debug(err.status);
        console.debug(err.detail);
        // frown
        return Promise.reject({
          ...rpkiResult,
          stage: "invalidAwait",
          error: (err.detail && err.detail) || err
        });
      }
    )
    .then(
      rpkiResult => ({ ...rpkiResult, stage: "finished", error: null }),
      finalErr => finalErr
    );
};

export const loadResource = async (fetchUrl, fetchFn = fetch) => {
  let response = await fetchFn(fetchUrl, {
    // credentials: "include"
  }).catch(errHandler);

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
        asns: rpkiResult["asns"],
        user_agent: (navigator && navigator.userAgent) || "rpki-web-test 0.0.1"
      }
    })
  });
};

export const loadIpPrefixAndAsn = ({ rpkiResult, postResult = false }) => {
  console.debug(rpkiResult.ip);
  const myIp = (rpkiResult.ip && rpkiResult.ip) || null;

  rpkiResult = { ...rpkiResult, asns: null, pfx: null };

  if (myIp) {
    return loadResource(`${NETWORK_INFO_URL}${myIp}`, fetch)
      .then(
        r => {
          console.debug("got some enrichment data");
          const myPrefix = (r.status === "ok" && r.data.prefix) || null;
          const myAsns = (r.status === "ok" && r.data.asns) || null;
          return { ...rpkiResult, asns: myAsns.join(), pfx: myPrefix };
        },
        err => {
          console.error("could not retrieve ASN and/or prefix");
          return Promise.reject({
            ...rpkiResult,
            stage: "enrichAwait",
            error: err
          });
        }
      )
      .then(
        r => {
          console.debug("postprocessing...");
          if (postResult) {
            postRpkiResult({ rpkiResult });
          }
          return { ...r, stage: "enrichReceived", error: null };
        },
        err => Promise.reject(err)
      );
  } else {
    console.error("could not retrieve the IP address of the client");
    return Promise.reject({
      ...rpkiResult,
      stage: "enrichAwait",
      error: "cannot retrieve ip address"
    });
  }
};
