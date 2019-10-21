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
    postResult: false
  }).then(r => {
    console.log(r);
  });
};

startTest();
