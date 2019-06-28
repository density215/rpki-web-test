const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

var dir_app = path.resolve(__dirname, "src");
var dir_build = path.resolve(__dirname, "build");
var dir_html = path.resolve(__dirname, "html");

/*
 * These are the environment variables that can
 * be set when running webpack (for deployment)
 */

// API_SERVER
// the api server that is used to make all API calls to
// this var will be fed to the top react component.
var apiServer = process.env.API_SERVER || "atlas.ripe.net";

// PUBLIC_PATH
// this path should conform to the STATIC_BUILD_URL config setting
// in the atlas-ui django app.
// Also important for code splitting:
// all split files ('0.bundle.js') will be hosted prefixed with this
var publicPath = process.env.PUBLIC_PATH || "https://8080.ripe.net/";

var entryDomElement = "#rpki";

// APP_NAME
var appName = process.env.APP_NAME || "RpkiWebTest";

// end environment variables
module.exports = {
    entry: [
        // "babel-polyfill",
        // "core-js",
        // "react-hot-loader/patch",
        // "webpack/hot/only-dev-server",
        path.resolve(dir_app, "index.js")
    ],
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
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            localIdentName: "[local]_[hash:base64:8]"
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ["*", ".js"],
        symlinks: false
    },
    output: {
        path: dir_build,
        publicPath: publicPath,
        filename: "bundle.js"
    },
    //context: dir_app,
    devtool: "cheap-module-source-map",
    devServer: {
        host: "8080.ripe.net",
        port: 8080,
        hot: true,
        public: "8080.ripe.net",
        disableHostCheck: true,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        contentBase: dir_build
    },
    plugins: [
        new CopyWebpackPlugin([{ from: dir_html }]),
        new webpack.DefinePlugin({
            __DOM_ENTRY_ELEMENT__: JSON.stringify(entryDomElement),
            __API_SERVER__: JSON.stringify(apiServer),
            __APP_NAME__: JSON.stringify(appName)
        }),
        // enable HMR globally
        new webpack.HotModuleReplacementPlugin(),
        // prints more readable module names in the browser console on HMR updates
        new webpack.NamedModulesPlugin()
    ]
};
