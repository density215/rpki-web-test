import { testRpkiInvalids } from "./librpki";
import { callBacks, handleReload } from "./smiley";

const reloadButton = document.querySelector("#reload");

reloadButton.addEventListener("click", e => {
  handleReload();
  startTest();
});

const startTest = () => {
  testRpkiInvalids({
    callBacks: callBacks,
    enrich: true,
    postResult: true
  }).then(
    r => {
      console.log("rpki result came in.");
      console.log(r);
    },
    err => {
      console.log("errored out");
      console.log(err);
    }
  );
};

startTest();
