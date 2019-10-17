const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

var dir_app = path.resolve(__dirname, "src");
var dir_build = path.resolve(__dirname, "build");

/*
 * These are the environment variables that can
 * be set when running webpack (for deployment)
 */

// end environment variables
module.exports = {
  entry: [
    // "babel-polyfill",
    // "core-js",
    // "react-hot-loader/patch",
    // "webpack/hot/only-dev-server",
    path.resolve(dir_app, "main")
  ],
  target: "async-node",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        //include: [/app/],
        // includes don't work with linked (local) modules,
        // such as the @ripe-rnd/ui-components
        // so excluding is the way to go.
        exclude: /.*node_modules\/((?!@ripe-rnd).)*$/,
        use: ["babel-loader"]
      }
    ]
  },
  resolve: {
    extensions: ["*", ".js"],
    symlinks: false
  },
  output: {
    path: dir_build,
    filename: "rpki-test-cli.js",
    //library: "libRpki",
    //libraryTarget: "commonjs2"
  },
  //context: dir_app,
  devtool: "cheap-module-source-map"
};
