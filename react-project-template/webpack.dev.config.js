const path = require('path')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    devtool: "eval",
    mode: "development",
    entry: {
        "bundle": path.resolve(__dirname, "source", "_appRoute.tsx")
    },
    output: {
        path: path.resolve(__dirname, "./source"),
        filename: "[name].js"
    },
    plugins: [
        new OpenBrowserPlugin({ url: "http://localhost:8080" }),
        new webpack.DefinePlugin({
            STATIC_PATH: "''"
        }),
        new HtmlWebpackPlugin({
            templateContent:"<div id='root'></div>"
        })
    ],
    devServer: {
        contentBase: [
            './source'
        ],
        historyApiFallback: {
            index: './index.html'
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader'],
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader?modules",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                exclude: /src/,
                use: [
                    { loader: "style-loader", },
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1
                        }
                    }
                ]
            },
            {
                test: /\.(eot|woff2?|ttf|svg)$/,
                use: ["url-loader"]
            }
        ]
    },
    optimization: {
        minimize: false
    },
    resolve: {
        alias: {
            '@parts': path.resolve(__dirname, 'parts'),
            '@source': path.resolve(__dirname, 'source'),
            '@lib': path.resolve(__dirname, 'lib'),
            '@build': path.resolve(__dirname, 'build'),
            '@styles': path.resolve(__dirname, 'styles'),
        },
        extensions: ['.ts', '.tsx', '.js', '.css', '.json']
    }
}