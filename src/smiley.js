const consoleOnly = typeof document === "undefined" ? true : false;

let iconElm, consoleElm;

// const smile = (consoleOnly && "😄") || smileSvg;
// const frown = (consoleOnly && "😟") || frownSvg;
// const meh = (consoleOnly && "😐") || mehSvg;
// const q = (consoleOnly && "❓") || qSvg;

if (!consoleOnly) {
  iconElm = document.querySelector("#rpki-test-icon");
  consoleElm = document.querySelector("#console");
}

const reloadSvg =
  '<svg version="1.1" width="12" height="14" viewBox="0 0 12 14"><path d="M256.455 8c66.269.119 126.437 26.233 170.859 68.685l35.715-35.715C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.75c-30.864-28.899-70.801-44.907-113.23-45.273-92.398-.798-170.283 73.977-169.484 169.442C88.764 348.009 162.184 424 256 424c41.127 0 79.997-14.678 110.629-41.556 4.743-4.161 11.906-3.908 16.368.553l39.662 39.662c4.872 4.872 4.631 12.815-.482 17.433C378.202 479.813 319.926 504 256 504 119.034 504 8.001 392.967 8 256.002 7.999 119.193 119.646 7.755 256.455 8z"></path></svg>';
const qSvg = [
  "❓",
  '<svg version="1.1" class="meh" viewBox="0 0 12 14"><path d="M6.875 9.375v1.25q0 0.109-0.070 0.18t-0.18 0.070h-1.25q-0.109 0-0.18-0.070t-0.070-0.18v-1.25q0-0.109 0.070-0.18t0.18-0.070h1.25q0.109 0 0.18 0.070t0.070 0.18zM8.875 5.5q0 0.391-0.117 0.703t-0.355 0.539-0.406 0.344-0.465 0.281q-0.25 0.141-0.363 0.219t-0.203 0.187-0.090 0.227v0.25q0 0.109-0.070 0.18t-0.18 0.070h-1.25q-0.109 0-0.18-0.070t-0.070-0.18v-0.531q0-0.273 0.082-0.504t0.187-0.371 0.305-0.277 0.32-0.199 0.348-0.164q0.414-0.195 0.586-0.336t0.172-0.383q0-0.328-0.34-0.559t-0.746-0.23q-0.438 0-0.742 0.211-0.227 0.156-0.625 0.648-0.070 0.094-0.195 0.094-0.086 0-0.148-0.047l-0.844-0.641q-0.078-0.055-0.094-0.156t0.039-0.18q0.953-1.5 2.727-1.5 1.008 0 1.863 0.699t0.855 1.676zM6 2q-1.016 0-1.941 0.398t-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941-0.398-1.941-1.066-1.594-1.594-1.066-1.941-0.398zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>',
];
const frownSvg = [
  "😟",
  '<svg class="frown" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 14"><path d="M8.859 9.602q0.062 0.195-0.031 0.379t-0.289 0.246-0.383-0.031-0.25-0.297q-0.195-0.625-0.723-1.012t-1.184-0.387-1.184 0.387-0.723 1.012q-0.062 0.203-0.246 0.297t-0.379 0.031q-0.203-0.062-0.297-0.246t-0.031-0.379q0.289-0.945 1.078-1.523t1.781-0.578 1.781 0.578 1.078 1.523zM5 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM9 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM11 7q0-1.016-0.398-1.941t-1.066-1.594-1.594-1.066-1.941-0.398-1.941 0.398-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>',
];
const mehSvg = [
  "😐",
  '<svg class="meh" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 14"><path d="M9 8.5q0 0.203-0.148 0.352t-0.352 0.148h-5q-0.203 0-0.352-0.148t-0.148-0.352 0.148-0.352 0.352-0.148h5q0.203 0 0.352 0.148t0.148 0.352zM5 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM9 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM11 7q0-1.016-0.398-1.941t-1.066-1.594-1.594-1.066-1.941-0.398-1.941 0.398-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>',
];
const smileSvg = [
  "😄",
  '<svg class="smile" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 14"><path d="M8.859 8.398q-0.289 0.945-1.078 1.523t-1.781 0.578-1.781-0.578-1.078-1.523q-0.062-0.195 0.031-0.379t0.297-0.246q0.195-0.062 0.379 0.031t0.246 0.297q0.195 0.625 0.723 1.012t1.184 0.387 1.184-0.387 0.723-1.012q0.062-0.203 0.25-0.297t0.383-0.031 0.289 0.246 0.031 0.379zM5 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM9 5q0 0.414-0.293 0.707t-0.707 0.293-0.707-0.293-0.293-0.707 0.293-0.707 0.707-0.293 0.707 0.293 0.293 0.707zM11 7q0-1.016-0.398-1.941t-1.066-1.594-1.594-1.066-1.941-0.398-1.941 0.398-1.594 1.066-1.066 1.594-0.398 1.941 0.398 1.941 1.066 1.594 1.594 1.066 1.941 0.398 1.941-0.398 1.594-1.066 1.066-1.594 0.398-1.941zM12 7q0 1.633-0.805 3.012t-2.184 2.184-3.012 0.805-3.012-0.805-2.184-2.184-0.805-3.012 0.805-3.012 2.184-2.184 3.012-0.805 3.012 0.805 2.184 2.184 0.805 3.012z"></path></svg>',
];

const addConsoleLine = (line, textClass, id = null) => {
  if (consoleOnly) {
    process.stdout.write(`${line}`);
  } else {
    console.log(line);
    const termLine = document.createElement("p");
    if (id) {
      termLine.setAttribute("id", id);
    }
    termLine.classList = textClass || "";
    termLine.textContent = line;
    consoleElm.appendChild(termLine);
  }
};

const addConsoleSpan = (span, passed, toId = null) => {
  if (consoleOnly) {
    process.stdout.write(`${span}\n`);
  } else {
    const consoleElm = document.querySelector("#console");
    const termSpan = document.createElement("span");
    termSpan.classList.add((passed && "smile") || "frown");
    termSpan.textContent = span;
    const lastLine =
      (toId && document.querySelector(`#${toId}`)) || consoleElm.lastChild;
    lastLine.appendChild(termSpan);
  }
};

const makeFace = (faceType) => {
  if (!consoleOnly) {
    iconElm.innerHTML = faceType[1];
  } else {
    console.log(faceType[0]);
  }
};

const finalMsg = (rpkiResult) => {
  //ex: AS3333 was not able to reach our RPKI invalid BGP route from prefix 193.0.20.0/23 as witnessed by your public IP 193.0.20.230
  // if (!rpkiResult["rpki-valid-passed"]) {
  //   addConsoleLine("The RPKI test could not complete", "frown");
  //   return;
  // }
  const ipAddress = rpkiResult.perAf[rpkiResult.perAf.length - 1];
  let msgVerb;

  if (ipAddress.ip.includes(".")) {
    if (rpkiResult["rpki-valid-passed-v4"] === true) {
      msgVerb = "was not able to reach";
    } else {
      msgVerb = "reached";
    }
  } else if (rpkiResult["rpki-valid-passed-v6"] === true) {
    msgVerb = "was not able to reach";
  } else {
    msgVerb = "reached";
  }

  // const msgVerb =
  //   ((rpkiResult["rpki-valid-passed-v4"] === true ||
  //     rpkiResult["rpki-valid-passed-v6"] === true) &&
  //     (rpkiResult["rpki-invalid-passed-v4"] === false ||
  //       rpkiResult["rpki-invalid-passed-v6"] === false ||
  //       rpkiResult["no-rpki-invalid-test"] === true) &&
  //     "was not able to reach") ||
  //   "reached";
  const textClass = (msgVerb === "was not able to reach" && "smile") || "frown";
  if (ipAddress.ip && !ipAddress.asn) {
    addConsoleLine(
      `The IPv${ipAddress.af} network you're connected with ${msgVerb}s our RPKI invalid BGP route.`,
      textClass
    );
  } else {
    addConsoleLine(
      `AS${(ipAddress.asn.length > 1 && "s") || ""}${ipAddress.asn.join(
        ","
      )} ${msgVerb} our RPKI invalid BGP route from prefix ${
        ipAddress.pfx
      } as witnessed by your public IP ${ipAddress.ip}`,
      textClass
    );
  }
};

export const handleReload = () => {
  consoleElm.innerHTML = "";
  makeFace(qSvg);
};

// initialized -> (validAwait | validReceived)
// -> (invalidAwait | invalidBlocked | invalidReceived) -> [enrichedReceived | enrichedAwait ]
// -> (postedSent | postedAwait )
// -> finished
export const callBacks = {
  initialized: (rpkiResult) => {
    addConsoleLine("testing valid ROA...", null, "valid");
    if (!rpkiResult["no-rpki-invalid-test"]) {
      addConsoleLine("testing invalid ROA (5sec)...", null, "invalid");
    } else {
      console.log("skip invalid test...");
      console.log(rpkiResult);
    }
  },
  validAwait: () => {
    if (rpkiResult.perAf[rpkiResult.perAf.length - 1].af == 4) {
      addConsoleSpan("[failed IPv4]", false, "valid");
    } else if (rpkiResult.perAf[rpkiResult.perAf.length - 1].af == 4) {
      addConsoleSpan("[failed IPv6]", false, "valid");
    } else {
      addConsoleSpan("[failed]", true, "valid");
    }
  },
  validReceived: (rpkiResult) => {
    if (
      rpkiResult["rpki-valid-passed-v4"] === false &&
      rpkiResult["rpki-valid-passed-v6"] === true
    ) {
      // addConsoleSpan(`[failed IPv4]`, false, "valid");
      addConsoleSpan(`[passed IPv6]`, true, "valid");
      makeFace(mehSvg);
    } else if (
      rpkiResult["rpki-valid-passed-v4"] === true &&
      rpkiResult["rpki-valid-passed-v6"] === false
    ) {
      addConsoleSpan(`[passed IPv4]`, true, "valid");
      // addConsoleSpan(`[failed IPv6]`, false, "valid");
      makeFace(mehSvg);
    } else if (
      rpkiResult["rpki-valid-passed-v4"] === true &&
      rpkiResult.perAf[rpkiResult.perAf.length - 1].af == 4
    ) {
      addConsoleSpan(`[passed ipv4]`, true, "valid");
      makeFace(smileSvg);
    } else if (
      rpkiResult["rpki-valid-passed-v4"] === false &&
      rpkiResult.perAf[rpkiResult.perAf.length - 1].af == 4
    ) {
      addConsoleSpan(`[failed IPv4]`, false, "valid");
      makeFace(frownSvg);
    } else if (
      rpkiResult["rpki-valid-passed-v6"] === false &&
      rpkiResult.perAf[rpkiResult.perAf.length - 1].af == 6
    ) {
      addConsoleSpan(`[failed IPv6]`, false, "valid");
      makeFace(frownSvg);
    } else if (
      rpkiResult["rpki-valid-passed-v6"] === true &&
      rpkiResult.perAf[rpkiResult.perAf.length - 1].af == 6
    ) {
      addConsoleSpan(`[passed IPv6]`, true, "valid");
      makeFace(frownSvg);
    } else {
      console.log("burfg!");
      console.log(rpkiResult["rpki-valid-passed-v4"]);
    }
  },
  invalidAwait: (rpkiResult) => {
    makeFace(mehSvg);
    // May very well be a success if the error was
    // an EMPTY_RESPONSE (meaning timeout).
    if (
      rpkiResult["rpki-valid-passed-v4"] === true ||
      rpkiResult["rpki-valid-passed-v6"] === true
    ) {
      /*
        _________                                       ._.
        /   _____/__ __   ____  ____  ____   ______ _____| |
        \_____  \|  |  \_/ ___\/ ___\/ __ \ /  ___//  ___/ |
        /        \  |  /\  \__\  \__\  ___/ \___ \ \___ \ \|
        /_______  /____/  \___  >___  >___  >____  >____  >__
                \/            \/    \/    \/     \/     \/ \/
        */
      makeFace(smileSvg);
    } else {
      addConsoleSpan("[error (what does that mean?)]!", "failed", "valid");
      makeFace(frownSvg);
    }
  },
  invalidBlocked: (rpkiResult) => {
    if (
      rpkiResult["rpki-valid-passed-v4"] === true ||
      rpkiResult["rpki-valid-passed-v6"] === true
    ) {
      addConsoleSpan("[passed]", true, "invalid");
      makeFace(smileSvg);
    } else {
      addConsoleSpan("[failed (error)]", false, "invalid");
      makeFace(mehSvg);
    }
  },
  invalidReceived: (rpkiResult) => {
    addConsoleSpan("[failed]", false, "invalid");
    makeFace(mehSvg);
  },
  enrichedAwait: finalMsg,
  enrichedReceived: finalMsg,
};
