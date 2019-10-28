module.exports = function(api) {
    var env = api.cache(() => process.env.NODE_ENV);

    return {
        env: {
            production: {
                plugins: [
                    "@babel/plugin-proposal-object-rest-spread",
                    // "@babel/plugin-syntax-dynamic-import",
                    // "@babel/plugin-syntax-import-meta",
                    [
                        "@babel/plugin-proposal-decorators",
                        {
                            legacy: true,
                            loose: true
                        }
                    ],
                    "@babel/plugin-proposal-class-properties",
                    // "@babel/plugin-proposal-json-strings",
                    "@babel/plugin-proposal-function-sent",
                    "@babel/plugin-proposal-export-namespace-from",
                    // "@babel/plugin-proposal-numeric-separator",
                    "@babel/plugin-proposal-throw-expressions"
                ]
            },
          test: {
            presets: ["@babel/preset-env"],
          },
        },
        presets: [
            [
                "@babel/preset-env",
                {
                    targets: {
                        browsers: [">0.25%", "not ie 11", "not op_mini all"]
                    },
                    modules: false,
                    useBuiltIns: "usage",
                    corejs: { version: 3, proposals: true }
                }
            ],
            // "@vue/babel-preset-jsx"
            // "@babel/preset-react"
        ],
        plugins: [
            // "react-hot-loader/babel",
            "@babel/plugin-proposal-object-rest-spread",
            // "@babel/plugin-syntax-dynamic-import",
            // "@babel/plugin-syntax-import-meta",
            [
                "@babel/plugin-proposal-decorators",
                {
                    legacy: true,
                    loose: true
                }
            ],
            "@babel/plugin-proposal-class-properties",
            // "@babel/plugin-proposal-json-strings",
            "@babel/plugin-proposal-function-sent",
            "@babel/plugin-proposal-export-namespace-from",
            // "@babel/plugin-proposal-numeric-separator",
            // "@babel/plugin-proposal-throw-expressions"
          [
            "@babel/plugin-transform-runtime",
            { regenerator: true }
          ]
        ]
    };
};
