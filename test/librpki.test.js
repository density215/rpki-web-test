import { testRpkiInvalids } from "../src/librpki";

global.fetch = require("jest-fetch-mock");
jest.setTimeout(9000);

const validPassedExampleR = { ip: "193.0.21.108", "rpki-valid-passed": true };
const invalidPassedExampleR = {
  ip: "193.0.21.108",
  "rpki-invalid-passed": true
};
const bogonExampleR =
  "<html><header></header><body><h1>Haha bogon server</h1></body></html>";

const ripeStatR = {
  status: "ok",
  server_id: "app008",
  status_code: 200,
  version: "1.0",
  cached: false,
  see_also: [],
  time: "2019-10-31T09:39:31.100971",
  messages: [],
  data_call_status: "supported",
  process_time: 125,
  build_version: "2019.10.31.137",
  query_id: "20191031093930-93accc1d-b377-4efe-bc29-74fdd42496d5",
  data: {
    prefix: "193.0.20.0/23",
    asns: ["3333"]
  }
};

expect.extend({
  toBeAddressFamily: d => ({
    message: "expected to be an address family",
    pass: d === 4 || d === 6
  }),
  toBeTypeError: d => ({
    message: "expected to be a TypeError",
    pass: d instanceof TypeError
  })
});

const defaultOptions = {
  enrich: false,
  invalidTimeout: 5000,
  postResult: false
};

const expectedStageInitializedReceived = options =>
  expect.objectContaining({
    stage: "initialized",
    error: null,
    success: true,
    data: expect.objectContaining({
      testUrls: expect.arrayContaining([
        {
          url: expect.stringContaining("https://"),
          addressFamily: expect.toBeAddressFamily()
        }
      ]),
      startDateTime: expect.anything(),
      // window.location is mocked by jest in the config section in package.json
      originLocation: expect.stringContaining("https://test.ripe.net"),
      userAgent: expect.anything(),
      options: options
    })
  });

const expectedStageValidReceived = expect.objectContaining({
  stage: "validReceived",
  error: null,
  data: expect.objectContaining({
    ip: "193.0.21.108",
    "rpki-valid-passed": true,
    duration: expect.any(Number),
    testUrl: expect.stringContaining("https://"),
    addressFamily: expect.toBeAddressFamily()
  }),
  success: true
});

const expectedStageInvalidReceived = expect.objectContaining({
  stage: "invalidReceived",
  data: expect.objectContaining({
    "rpki-invalid-passed": true,
    duration: expect.any(Number),
    testUrl: expect.stringContaining("https://"),
    addressFamily: expect.toBeAddressFamily()
  }),
  success: true,
  error: null
});

const expectedStageValidAwait = expect.objectContaining({
  stage: "validAwait",
  error: expect.objectContaining({ detail: expect.anything() }),
  data: expect.objectContaining({
    duration: expect.any(Number),
    testUrl: expect.stringContaining("https://")
  }),
  success: false
});

const expectedStageInvalidBlocked = expect.objectContaining({
  stage: "invalidBlocked",
  error: null,
  data: expect.objectContaining({
    "rpki-invalid-passed": false,
    duration: expect.any(Number),
    testUrl: expect.stringContaining("https://"),
    addressFamily: expect.toBeAddressFamily()
  }),
  success: true
});

const expectedStageInvalidAwait = expect.objectContaining({
  stage: "invalidAwait",
  error: expect.anything(),
  data: expect.objectContaining({
    duration: expect.any(Number),
    testUrl: expect.stringContaining("https://")
  }),
  success: false
});

const expectedStageFinished = expect.objectContaining({
  stage: "finished",
  error: null,
  data: expect.objectContaining({
    duration: expect.any(Number)
    // rpkiResult: expect.anything()
  })
});

// Combined expect parsing

const expectedBothPassed = (options, expectFields) =>
  expect.objectContaining({
    "rpki-valid-passed": true,
    "rpki-invalid-passed": true,
    lastStage: "finished",
    lastError: null,
    lastErrorStage: null,
    ip: "193.0.21.108",
    ...expectFields,
    events: expect.arrayContaining([
      expectedStageInitializedReceived(options),
      expectedStageInvalidReceived,
      expectedStageValidReceived,
      expectedStageFinished
    ])
  });

const expectedBothPassedWithoutEnrich = expectedBothPassed(defaultOptions);
const expectedBothPassedWithEnrich = expectedBothPassed(
  {
    ...defaultOptions,
    enrich: true
  },
  { pfx: expect.any(String), asn: expect.arrayContaining([expect.any(String)]) }
);

const expectedValidReceivedInvalidBlocked = expect.objectContaining({
  "rpki-valid-passed": true,
  "rpki-invalid-passed": false,
  lastStage: "finished",
  lastError: null,
  lastErrorStage: null,
  ip: "193.0.21.108",
  events: expect.arrayContaining([
    expectedStageInitializedReceived(defaultOptions),
    expectedStageInvalidBlocked,
    expectedStageValidReceived,
    expectedStageFinished
  ])
});

const expectedValidReceivedInvalidAwait = expect.objectContaining({
  "rpki-valid-passed": true,
  "rpki-invalid-passed": false,
  lastStage: "finished",
  lastError: expect.objectContaining({ detail: expect.anything() }),
  lastErrorStage: "invalidAwait",
  ip: "193.0.21.108",
  events: expect.arrayContaining([
    expectedStageInitializedReceived(defaultOptions),
    expectedStageInvalidAwait,
    expectedStageValidReceived,
    expectedStageFinished
  ])
});

const expectedValidAwaitInvalidReceived = expect.objectContaining({
  "rpki-valid-passed": false,
  "rpki-invalid-passed": true,
  lastStage: "finished",
  lastError: expect.objectContaining({ detail: expect.anything() }),
  lastErrorStage: "validAwait",
  ip: "193.0.21.108",
  events: expect.arrayContaining([
    expectedStageInitializedReceived(defaultOptions),
    expectedStageValidAwait,
    expectedStageInvalidReceived,
    expectedStageFinished
  ])
});

const expectedBothTimeout = options =>
  expect.objectContaining({
    "rpki-valid-passed": false,
    "rpki-invalid-passed": false,
    lastStage: "finished",
    lastError: expect.objectContaining({ detail: expect.anything() }),
    lastErrorStage: expect.anything(),
    events: expect.arrayContaining([
      expectedStageInitializedReceived(options),
      expectedStageValidAwait,
      expectedStageInvalidBlocked,
      expectedStageFinished
    ])
  });

const expectedBothTimeoutWithoutEnrich = expectedBothTimeout(defaultOptions);
const expectedBothTimeoutWithEnrich = expectedBothTimeout({
  ...defaultOptions,
  enrich: true
});

const expectedBothBogonResponse = expect.objectContaining({
  "rpki-valid-passed": false,
  "rpki-invalid-passed": false,
  lastStage: "finished",
  lastError: expect.objectContaining({ detail: expect.anything() }),
  lastErrorStage: expect.anything(),
  events: expect.arrayContaining([
    expectedStageInitializedReceived(defaultOptions),
    expectedStageValidAwait,
    expectedStageInvalidAwait,
    expectedStageFinished
  ])
});

// tests

test("test testRpkiInvalid function...", () => {
  return expect(typeof testRpkiInvalids).toBe("function");
});

test("test valid received + invalid received correctly before timeout...", () => {
  fetch.mockResponseOnce(JSON.stringify(validPassedExampleR));
  fetch.mockResponseOnce(JSON.stringify(invalidPassedExampleR));

  return testRpkiInvalids({ fetch: fetch }).then(d =>
    expect(d).toEqual(expectedBothPassedWithoutEnrich)
  );
});

test("test valid received correctly + invalid errors before timeout...", () => {
  fetch.mockResponseOnce(JSON.stringify(validPassedExampleR));
  fetch.mockRejectOnce(
    new TypeError("Faked NetworkError when attempting to fetch resource.")
  );

  return testRpkiInvalids({ fetch: fetch }).then(d =>
    expect(d).toEqual(expectedValidReceivedInvalidAwait)
  );
});

test("test valid received correctly + invalid timed out...", () => {
  fetch.mockResponseOnce(JSON.stringify(validPassedExampleR));

  fetch.mockResponseOnce(
    () =>
      new Promise(resolve =>
        setTimeout(() => resolve(new TypeError("faked timeout error")), 9000)
      )
  );

  return testRpkiInvalids({ fetch: fetch }).then(d =>
    expect(d).toEqual(expectedValidReceivedInvalidBlocked)
  );
});

test("test both valid and invalid timing out...", () => {
  fetch.mockRejectOnce(
    () =>
      new Promise(resolve =>
        setTimeout(() => {
          const err = new Response(
            JSON.stringify({ error: "faked timeout error" }),
            {
              status: 408,
              statusText: "Faked Request Timeout"
            }
          );
          // err.status = 408;
          return resolve(err);
        }, 8000)
      )
  );
  fetch.mockResponseOnce(
    () =>
      new Promise(resolve =>
        setTimeout(() => resolve(JSON.stringify(validPassedExampleR)), 8000)
      )
  );

  return testRpkiInvalids({ fetch: fetch }).then(d =>
    expect(d).toEqual(expectedBothTimeoutWithoutEnrich)
  );
});

test("test both valid and invalid returning bogon response...", () => {
  fetch.mockResponseOnce(bogonExampleR);
  fetch.mockResponseOnce(bogonExampleR);

  return testRpkiInvalids({ fetch: fetch }).then(d =>
    expect(d).toEqual(expectedBothBogonResponse)
  );
});

test("test valid returning bogon and invalid returning correct response before timeout...", () => {
  fetch.mockResponseOnce(bogonExampleR);
  fetch.mockResponseOnce(JSON.stringify(invalidPassedExampleR));

  return testRpkiInvalids({ fetch: fetch }).then(d =>
    expect(d).toEqual(expectedValidAwaitInvalidReceived)
  );
});

// enrich
test("test valid received + invalid received with enrichment correctly...", () => {
  fetch.mockResponseOnce(JSON.stringify(validPassedExampleR));
  fetch.mockResponseOnce(JSON.stringify(invalidPassedExampleR));
  fetch.mockResponseOnce(JSON.stringify(ripeStatR));

  return testRpkiInvalids({ fetch: fetch, enrich: true }).then(d =>
    expect(d).toEqual(expectedBothPassedWithEnrich)
  );
});

test("test both valid and invalid timing out with enrichment...", () => {
  fetch.mockRejectOnce(
    () =>
      new Promise(resolve =>
        setTimeout(() => {
          const err = new Response(
            JSON.stringify({ error: "faked timeout error" }),
            {
              status: 408,
              statusText: "Faked Request Timeout"
            }
          );
          return resolve(err);
        }, 8000)
      )
  );
  fetch.mockResponseOnce(
    () =>
      new Promise(resolve =>
        setTimeout(() => resolve(JSON.stringify(validPassedExampleR)), 8000)
      )
  );
  fetch.mockResponseOnce(JSON.stringify(ripeStatR));

  return testRpkiInvalids({ enrich: true, fetch: fetch }).then(d =>
    expect(d).toEqual(expectedBothTimeoutWithEnrich)
  );
});
