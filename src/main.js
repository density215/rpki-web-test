import { testRpkiInvalids } from "./librpki";
import fetch from "node-fetch";
import { callBacks } from "./smiley";

testRpkiInvalids({ fetch, callBacks, enrich: true, postResult: false }).then(
  d => {
    process.stdout.write("\n");
    console.log(JSON.stringify(d, null, 2));
    // kill it off manually, since
    // a promise might still be pending.
    process.exit(0);
  },
  err => {
    console.error(err);
    process.exit(1);
  }
);
