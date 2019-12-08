const webpack = require("webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
    entry: "./src/client/index.tsx",
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre",
            },
        ],
    },
    resolve: {
        extensions: ["*", ".ts", ".tsx", ".js", ".jsx"],
        plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.client.json" })],
    },
    output: {
        path: __dirname + "/static/build",
        publicPath: "/",
        filename: "index.js",
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
};
