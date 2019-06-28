import { v4 } from "uuid";

const frownSvg =
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="12" height="14" viewBox="0 0 12 14"><path d="M8.859 9.602q0.062 0.195-0.031 0.379t-0.289 0.246-0.383-0.031-0.25-0.297q-0.195-0.625-0.723-1.012t-1.184-0.387-1.184 0.387-0.723 1.012q-0.062 0.203-0.246 0.297t-0.379 0.031q-0.203-0.062-0.297-0.246t-0.031-0.379q0.289-0.945 1.078-1.523t1.781-0.578 1.781 0.578 1.078 1.523zM5 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM9 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM11 7q0-1.016-0.398-1.941t-1.066-1.594-1.594-1.066-1.941-0.398-1.941 0.398-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>';
const mehSvg =
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="12" height="14" viewBox="0 0 12 14"><path d="M9 8.5q0 0.203-0.148 0.352t-0.352 0.148h-5q-0.203 0-0.352-0.148t-0.148-0.352 0.148-0.352 0.352-0.148h5q0.203 0 0.352 0.148t0.148 0.352zM5 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM9 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM11 7q0-1.016-0.398-1.941t-1.066-1.594-1.594-1.066-1.941-0.398-1.941 0.398-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>';
const smileSvg =
    '<svg style="fill: green;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="12" height="14" viewBox="0 0 12 14"><path d="M8.859 8.398q-0.289 0.945-1.078 1.523t-1.781 0.578-1.781-0.578-1.078-1.523q-0.062-0.195 0.031-0.379t0.297-0.246q0.195-0.062 0.379 0.031t0.246 0.297q0.195 0.625 0.723 1.012t1.184 0.387 1.184-0.387 0.723-1.012q0.062-0.203 0.25-0.297t0.383-0.031 0.289 0.246 0.031 0.379zM5 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM9 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM11 7q0-1.016-0.398-1.941t-1.066-1.594-1.594-1.066-1.941-0.398-1.941 0.398-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>';
/*
 * ERROR HANDLING
 *
 * Either you can:
 * 1) pass the standard errHandler function listed below in the .catch() on a fetch OR
 * 2) define a custom error and throw that.
 *
 * custom error object definition:
 *
 * {
 *    status: <HTTPStatusCode::<Number> || "customErr"::<String>>
 *    detail: <String>
 * }
 *
 * `status` is the HTTP status code that you can pass on from a network error from fetch or the special
 * variant "customErr", in which case a special message stating an internal error will be displayed to
 * the user.
 *
 * `detail` is the message for the user that will be displayed below the generic error message.
 * please do not repeat the generic error message ("404. file not found") but try to be as specific
 * as possible.
 */

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

const timeout = (promise, dur) => {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve({ "rpki-invalid-passed": false });
        }, dur);
        promise.then(resolve, reject);
    });
};

export const testRpkiInvalids = () => {
    const iconElm = document.querySelector("#rpki-test-icon");
    console.log("generating uuid...");

    const newUuid = v4();

    const fetchValidUrl = `http://${newUuid}.rpki-valid-beacon.meerval.net/rpki.json`;
    const fetchInvalidUrl = `http://${newUuid}.rpki-invalid-beacon.meerval.net/rpki.json`;
    // let rpkiResult = {
    //     "valid-rpki-passed": null,
    //     "invalid-rpki-passed": null
    // };

    console.log("testing valid rpki prefix...");
    console.log(fetchValidUrl);
    console.log("testing invalid rpki prefix...");
    console.log(fetchInvalidUrl);

    Promise.all([
        loadRpkiUrl(fetchValidUrl),
        timeout(loadRpkiUrl(fetchInvalidUrl), 5000)
    ]).then(
        ([validR, invalidR]) => {
            const rpkiResult = { ...validR, ...invalidR };

            if (
                invalidR["rpki-invalid-passed"] === false &&
                validR["rpki-valid-passed"]
            ) {
                /*
                _________                                       ._.
                /   _____/__ __   ____  ____  ____   ______ _____| |
                \_____  \|  |  \_/ ___\/ ___\/ __ \ /  ___//  ___/ |
                /        \  |  /\  \__\  \__\  ___/ \___ \ \___ \ \|
                /_______  /____/  \___  >___  >___  >____  >____  >__
                        \/            \/    \/    \/     \/     \/ \/
                */
                iconElm.innerHTML = smileSvg;
            } else {
                console.log("invalid rpki prefix loaded... )-:");
                rpkiResult = { ...rpkiResult, r };
                iconElm.innerHTML = mehSvg;
            }
        },

        err => {
            console.log("some rpki prefix errored out.");
            console.log(err.status);
            console.log(err.detail);
            iconElm.innerHTML = frownSvg;
            // rpkiResult["valid-rpki-passed"] = false;
        }
    );

    // loadRpkiUrl(fetchValidUrl).then(
    //     r => {
    //         console.log("valid rpki prefix loaded.");
    //         console.log(r);
    //         rpkiResult = { ...rpkiResult, r };
    //     },
    //     err => {
    //         console.log("valid rpki prefix errored out.");
    //         console.log(err.status);
    //         console.log(err.detail);
    //         iconElm.innerHTML = frownSvg;
    //         rpkiResult["valid-rpki-passed"] = false;
    //     }
    // );

    // timeout(loadRpkiUrl(fetchInvalidUrl), 5000).then(
    //     r => {
    //         console.log(r);

    //         if (r["rpki-invalid-passed"]) {
    //             console.log("invalid rpki prefix loaded... )-:");
    //             rpkiResult = { ...rpkiResult, r };
    //             iconElm.innerHTML = mehSvg;
    //         } else {
    //             /*
    //             _________                                       ._.
    //             /   _____/__ __   ____  ____  ____   ______ _____| |
    //             \_____  \|  |  \_/ ___\/ ___\/ __ \ /  ___//  ___/ |
    //             /        \  |  /\  \__\  \__\  ___/ \___ \ \___ \ \|
    //             /_______  /____/  \___  >___  >___  >____  >____  >__
    //                     \/            \/    \/    \/     \/     \/ \/
    //             */
    //             iconElm.innerHTML = smileSvg;
    //         }
    //     },
    //     err => {
    //         console.log(
    //             "invalid rpki prefix errored out... (what does that mean?)"
    //         );
    //         console.log(err);
    //         iconElm.innerHTML = frownSvg;
    //     }
    // );
};

const loadRpkiUrl = async fetchUrl => {
    let response = await fetch(fetchUrl, {
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
            (error.errors &&
                error.errors.length > 0 &&
                error.errors[0].detail) ||
            error.detail ||
            error.title;

        const statusErr = { status: response.status, detail: detailText };
        return Promise.reject(statusErr);
    }

    return resultData;
};
