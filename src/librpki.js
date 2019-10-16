import { v4 } from "uuid";
import fetch from "node-fetch";

const RPKI_VALID_URL = "rpki-valid-beacon.meerval.net";
const RPKI_INVALID_URL = "rpki-invalid-beacon.meerval.net";
const POST_RESULTS_URL = "https://rpki-browser.webmeasurements.net/results/";
const NETWORK_INFO_URL =
  "https://stat.ripe.net/data/network-info/data.json?resource=";

const createRpkiTestUrl = ({ uuid, valid = false, protocol = "https" }) =>
  `${protocol}://${uuid}.${(valid && RPKI_VALID_URL) ||
    RPKI_INVALID_URL}/${(valid && "valid") || "invalid"}.json`;

// Enrich the standard js error
// with a `detail` attribute.
// The API throws errors that includes this field
// So we don't have two write two separate handlers
// upstream.
function errHandler(err) {
  console.log(err);
  // console.log(this);
  err.detail = err.message;
  throw err;
}

// Will return a resolved promise after 5000ms (default) of inactivity,
// will return the actual promise if it settles within that time.
// So the last case might be a resolve (so NOT dropping invalids)
// or an error (which we return).
const timeout = async (promise, dur) => {
  Promise.pending = Promise.race.bind(Promise, []);
  let cancel;

  return new Promise(function(resolve, reject) {
    cancel = function() {
      resolve(Promise.pending());
    };

    setTimeout(function() {
      resolve({ "rpki-invalid-passed": false });
      console.log("invalid dropped [passed]");
      cancel();
    }, dur);

    promise.then(resolve, reject);
  });
};

export const testRpkiInvalids = ({ enrich = false, postResult = false }) => {
  console.log("generating uuid...");

  const newUuid = v4();
  let rpkiResult = {
    "rpki-valid-passed": null,
    "rpki-invalid-passed": null,
    error: null
  };

  console.log("testing valid rpki prefix...");
  console.log(createRpkiTestUrl({ uuid: newUuid, valid: true }));
  console.log("testing invalid rpki prefix...");
  console.log(createRpkiTestUrl({ uuid: newUuid, valid: false }));

  return loadRpkiUrl(createRpkiTestUrl({ uuid: newUuid, valid: true }))
    .then(
      validR => {
        rpkiResult = { ...rpkiResult, ...validR };
        console.log("valid passed.");
        console.log(validR);
        return timeout(
          loadRpkiUrl(createRpkiTestUrl({ uuid: newUuid, valid: false })),
          5000
        );
      },
      err => {
        console.log("valid bounced.");
        console.log(err.status);
        console.log(err.detail);
        // frown
        rpkiResult = { ...rpkiResult, error: (err && err.detail) || err };
        return rpkiResult;
      }
    )
    .then(
      invalidR => {
        console.log("valid done.");
        console.log(invalidR);
        // could be frown, meh or smile
        rpkiResult = { ...rpkiResult, ...invalidR };
        return rpkiResult;
      },
      err => {
        console.log("some rpki prefix errored out.");
        console.log(err);
        console.log(err.status);
        console.log(err.detail);
        // frown
        return { ...rpkiResult, error: (err.detail && err.detail) || err };
      }
    );
};

export const loadRpkiUrl = async (fetchUrl, fetchFn = fetch) => {
  let response = await fetchFn(fetchUrl, {
    // credentials: "include"
  }).catch(errHandler);

  let resultData = await response.json().catch(err => {
    console.log(err);
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
    console.log("HTTP status code indicated error.");
    console.log(response);

    const error = resultData.error;
    console.log(error);

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
        user_agent: (navigator && navigator.userAgent) || null
      }
    })
  });
};

export const loadIpPrefixAndAsn = ({ rpkiResult, postResult = false }) => {
  console.log(rpkiResult.ip);
  const myIp = (rpkiResult.ip && rpkiResult.ip) || null;

  rpkiResult = { ...rpkiResult, asns: null, pfx: null };

  if (myIp) {
    loadResource(`${NETWORK_INFO_URL}${myIp}`)
      .then(
        r => {
          const myPrefix = (r.status === "ok" && r.data.prefix) || null;
          const myAsns = (r.status === "ok" && r.data.asns) || null;
          rpkiResult.asns = myAsns.join();
          rpkiResult.pfx = myPrefix;
        },
        err => {
          console.error("could not retrieve ASN and/or prefix");
        }
      )
      .then(_ => {
        if (postResult) {
          postRpkiResult({ rpkiResult });
        }
      });
  } else {
    console.error("could not retrieve the IP address of the client");
  }
};
