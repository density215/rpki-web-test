import { testRpkiInvalids, handleReload } from "./rpki";

const reloadButton = document.querySelector("#reload");
reloadButton.addEventListener("click", e => {
    handleReload();
});

console.log("testing for invalid rpki rejects...");
testRpkiInvalids();
