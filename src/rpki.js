import { v4 } from "uuid";
import { RSA_NO_PADDING } from "constants";

let rpkiResult = {
    "rpki-valid-passed": null,
    "rpki-invalid-passed": null
};

const iconElm = document.querySelector("#rpki-test-icon");
const consoleElm = document.querySelector("#console");

const reloadSvg =
    '<svg version="1.1" width="12" height="14" viewBox="0 0 12 14"><path d="M256.455 8c66.269.119 126.437 26.233 170.859 68.685l35.715-35.715C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.75c-30.864-28.899-70.801-44.907-113.23-45.273-92.398-.798-170.283 73.977-169.484 169.442C88.764 348.009 162.184 424 256 424c41.127 0 79.997-14.678 110.629-41.556 4.743-4.161 11.906-3.908 16.368.553l39.662 39.662c4.872 4.872 4.631 12.815-.482 17.433C378.202 479.813 319.926 504 256 504 119.034 504 8.001 392.967 8 256.002 7.999 119.193 119.646 7.755 256.455 8z"></path></svg>';
const qSvg =
    '<svg version="1.1" class="meh" viewBox="0 0 12 14"><path d="M6.875 9.375v1.25q0 0.109-0.070 0.18t-0.18 0.070h-1.25q-0.109 0-0.18-0.070t-0.070-0.18v-1.25q0-0.109 0.070-0.18t0.18-0.070h1.25q0.109 0 0.18 0.070t0.070 0.18zM8.875 5.5q0 0.391-0.117 0.703t-0.355 0.539-0.406 0.344-0.465 0.281q-0.25 0.141-0.363 0.219t-0.203 0.187-0.090 0.227v0.25q0 0.109-0.070 0.18t-0.18 0.070h-1.25q-0.109 0-0.18-0.070t-0.070-0.18v-0.531q0-0.273 0.082-0.504t0.187-0.371 0.305-0.277 0.32-0.199 0.348-0.164q0.414-0.195 0.586-0.336t0.172-0.383q0-0.328-0.34-0.559t-0.746-0.23q-0.438 0-0.742 0.211-0.227 0.156-0.625 0.648-0.070 0.094-0.195 0.094-0.086 0-0.148-0.047l-0.844-0.641q-0.078-0.055-0.094-0.156t0.039-0.18q0.953-1.5 2.727-1.5 1.008 0 1.863 0.699t0.855 1.676zM6 2q-1.016 0-1.941 0.398t-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941-0.398-1.941-1.066-1.594-1.594-1.066-1.941-0.398zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>';
const frownSvg =
    '<svg class="frown" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 14"><path d="M8.859 9.602q0.062 0.195-0.031 0.379t-0.289 0.246-0.383-0.031-0.25-0.297q-0.195-0.625-0.723-1.012t-1.184-0.387-1.184 0.387-0.723 1.012q-0.062 0.203-0.246 0.297t-0.379 0.031q-0.203-0.062-0.297-0.246t-0.031-0.379q0.289-0.945 1.078-1.523t1.781-0.578 1.781 0.578 1.078 1.523zM5 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM9 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM11 7q0-1.016-0.398-1.941t-1.066-1.594-1.594-1.066-1.941-0.398-1.941 0.398-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>';
const mehSvg =
    '<svg class="meh" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 14"><path d="M9 8.5q0 0.203-0.148 0.352t-0.352 0.148h-5q-0.203 0-0.352-0.148t-0.148-0.352 0.148-0.352 0.352-0.148h5q0.203 0 0.352 0.148t0.148 0.352zM5 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM9 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM11 7q0-1.016-0.398-1.941t-1.066-1.594-1.594-1.066-1.941-0.398-1.941 0.398-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>';
const smileSvg =
    '<svg class="smile" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 14"><path d="M8.859 8.398q-0.289 0.945-1.078 1.523t-1.781 0.578-1.781-0.578-1.078-1.523q-0.062-0.195 0.031-0.379t0.297-0.246q0.195-0.062 0.379 0.031t0.246 0.297q0.195 0.625 0.723 1.012t1.184 0.387 1.184-0.387 0.723-1.012q0.062-0.203 0.25-0.297t0.383-0.031 0.289 0.246 0.031 0.379zM5 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM9 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM11 7q0-1.016-0.398-1.941t-1.066-1.594-1.594-1.066-1.941-0.398-1.941 0.398-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>';
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
            // Only if the invalid request hasn't already set the value in rpkiResults to true
            // should this rpki-invalid-passed be set to false.
            if (!rpkiResult["rpki-invalid-passed"]) {
                resolve({ "rpki-invalid-passed": false });
                addConsoleSpan("[passed]", true);
            }
        }, dur);
        promise.then(resolve, reject);
    });
};

const addConsoleLine = (line, textClass) => {
    console.log(line);
    const termLine = document.createElement("p");
    termLine.classList = textClass || "";
    termLine.textContent = line;
    consoleElm.appendChild(termLine);
};

const clearConsole = () => {
    console.log("clear console");
    rpkiResult = {
        "rpki-valid-passed": null,
        "rpki-invalid-passed": null
    };
    consoleElm.innerHTML = "";
};

const addConsoleSpan = (span, passed) => {
    console.log(span);
    const termSpan = document.createElement("span");
    termSpan.classList.add((passed && "smile") || "frown");
    termSpan.textContent = span;
    const lastLine = consoleElm.lastChild;
    lastLine.appendChild(termSpan);
};

export const handleReload = () => {
    iconElm.innerHTML = qSvg;
    clearConsole();
    console.log("testing for invalid rpki rejects...");
    testRpkiInvalids();
};

const loadIpPrefixAndAsn = msgVerb => {
    console.log(rpkiResult.ip);
    const textClass = (msgVerb === "drop" && "smile") || "frown";
    const myIp = (rpkiResult.ip && rpkiResult.ip) || null;
    // loadResource("https://stat.ripe.net/data/whats-my-ip/data.json").then(
    //     r => {
    // const myIp =
    //     (r.status === "ok" &&
    //         r.data.ip &&
    //         // check this is *NOT* an ipv6 address,
    //         // that's not checked currently.
    //         r.data.ip.replace(":") === r.data.ip) ||
    //     null;
    // console.log(`your ip: ${r.status === "ok" && r.data.ip}`);
    // addConsoleLine(
    //     `your public IP address : ${myIp}`
    // );
    if (myIp) {
        loadResource(
            `https://stat.ripe.net/data/network-info/data.json?resource=${myIp}`
        ).then(
            r => {
                const myPrefix = (r.status === "ok" && r.data.prefix) || null;
                const myAsns = (r.status === "ok" && r.data.asns) || null;
                rpkiResult.asns = myAsns.join();
                rpkiResult.pfx = myPrefix;
                addConsoleLine(
                    `AS${(myAsns.length > 1 && "s") || ""}${myAsns.join(
                        ","
                    )} ${msgVerb}${(myAsns.length === 1 && "s") ||
                        ""} RPKI invalid BGP routes from prefix ${myPrefix} as witnessed by your public IP ${myIp}`,
                    textClass
                    //ex: AS3333 drops RPKI invalid BGP routes from prefix 193.0.20.0/23 as witnessed by your public IP 193.0.20.230
                );
            },
            err => {
                addConsoleLine(
                    `The network you're connected with ${msgVerb}s RPKI invalid BGP routes.`,
                    textClass
                );
            }
        ).then(
            _ => {
                    fetch(
                        "https://rpki-browser.webmeasurements.net/results/",
                        {
                            method: 'POST',
                            mode: 'cors',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(
                                {
                                        "json": {
                                            "rpki-valid-passed": rpkiResult["rpki-valid-passed"],
                                            "rpki-invalid-passed": rpkiResult["rpki-invalid-passed"],
                                            "pfx": rpkiResult["pfx"],
                                            "asns": rpkiResult["asns"],

                                            "user_agent": navigator.userAgent
                                        }
                                    }
                            )
                        }
                    )
            }
        );
    } else {
        addConsoleLine(
            `The network you're connected with ${msgVerb}s RPKI invalid BGP routes.`,
            textClass
        );
    }
    // },
    // err => {
    //     addConsoleLine(
    //         `The network you're connected with ${msgVerb}s RPKI invalid BGP routes.`,
    //         textClass
    //     );
    // }
    // );
};

export const testRpkiInvalids = () => {
    console.log("generating uuid...");
    const newUuid = v4();

    const fetchValidUrl = `http://${newUuid}.rpki-valid-beacon.meerval.net/valid.json`;
    const fetchInvalidUrl = `http://${newUuid}.rpki-invalid-beacon.meerval.net/invalid.json`;

    addConsoleLine("testing valid ROA...");
    console.log(fetchValidUrl);

    loadResource(fetchValidUrl).then(
        r => {
            addConsoleSpan("[passed]", true);
            console.log(r);
            rpkiResult = { ...rpkiResult, ...r };

            addConsoleLine("testing invalid ROA (5sec)...");
            console.log(fetchInvalidUrl);
            timeout(loadResource(fetchInvalidUrl), 5000).then(
                r => {
                    console.log(r);
                    rpkiResult = { ...rpkiResult, ...r };
                    console.log(rpkiResult);
                    if (
                        rpkiResult["rpki-valid-passed"] === true &&
                        rpkiResult["rpki-invalid-passed"] === false
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
                        loadIpPrefixAndAsn("drop");
                    } else {
                        addConsoleSpan("[failed]!", false);
                        rpkiResult = { ...rpkiResult, r };
                        iconElm.innerHTML = mehSvg;
                        loadIpPrefixAndAsn("accept");
                    }
                },
                err => {
                    // May very well be a success if the error was
                    // an EMPTY_RESPONSE (meaning timeout).
                    if (rpkiResult["rpki-valid-passed"] === true) {
                        /*
                        _________                                       ._.
                        /   _____/__ __   ____  ____  ____   ______ _____| |
                        \_____  \|  |  \_/ ___\/ ___\/ __ \ /  ___//  ___/ |
                        /        \  |  /\  \__\  \__\  ___/ \___ \ \___ \ \|
                        /_______  /____/  \___  >___  >___  >____  >____  >__
                                \/            \/    \/    \/     \/     \/ \/
                        */
                        iconElm.innerHTML = smileSvg;
                        loadIpPrefixAndAsn("drop");
                    } else {
                        addConsoleSpan(
                            "[error (what does that mean?)]!",
                            "failed"
                        );
                        console.log(err);
                        iconElm.innerHTML = frownSvg;
                    }
                }
            );
        },
        err => {
            addConsoleSpan("[error (can't reach destination?)]");
            console.log(err.status);
            console.log(err.detail);
            iconElm.innerHTML = frownSvg;
        }
    );
};

const loadResource = async fetchUrl => {
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
