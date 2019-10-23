exports["test that logs all failures"] = function(assert) {
  assert.equal(true, true);
};

if (module == require.main) require("test").run(exports);
