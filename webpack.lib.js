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
    path.resolve(dir_app, "librpki")
  ],
  target: "async-node",
  mode: "development",
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
  plugins: [
    new webpack.DefinePlugin({
      __RELEASE_STRING__: JSON.stringify(`rpki-web-test-${require("./package.json").version}`)
    })
  ],
  output: {
    path: dir_build,
    filename: "librpkitest.js",
    library: "libRpkiTest",
    libraryTarget: "commonjs2"
  },
  //context: dir_app,
  devtool: "cheap-module-source-map"
};
