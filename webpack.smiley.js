const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

var dir_app = path.resolve(__dirname, "src");
var dir_build = path.resolve(__dirname, "build");
var dir_html = path.resolve(__dirname, "html");

// end environment variables
module.exports = {
    entry: [
        // "babel-polyfill",
        // "core-js",
        // "react-hot-loader/patch",
        // "webpack/hot/only-dev-server",
        path.resolve(dir_app, "index.js")
    ],
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
        filename: "bundle.js"
    },
    //context: dir_app,
    devtool: "cheap-module-source-map",
    plugins: [
        new CopyWebpackPlugin([{ from: dir_html }])
    ]
};
