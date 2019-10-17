import { testRpkiInvalids } from "./librpki";
import fetch from "node-fetch";

testRpkiInvalids({ fetch }).then(
  d => {
    console.log(d);
    // kill it off manually, since
    // a promise might still be pending.
    process.exit(0);
  },
  err => {
    console.error(err);
    process.exit(1);
  }
);
