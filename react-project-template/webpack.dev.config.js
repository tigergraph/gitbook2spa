const path = require('path')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    devtool: "eval",
    mode: "development",
    entry: {
        "bundle": path.resolve(__dirname, "gitbook", "_appRoute.tsx")
    },
    output: {
        path: path.resolve(__dirname, "./gitbook"),
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
            './gitbook'
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
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: true
                        }
                    }
                ],
                include: /\.module\.css$/ // for css modules
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ],
                exclude: /\.module\.css$/ // for global css
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
            '@gitbook': path.resolve(__dirname, 'gitbook'),
            '@components': path.resolve(__dirname, 'components'),
            '@libs': path.resolve(__dirname, 'libs'),
            '@styles': path.resolve(__dirname, 'styles'),
        },
        extensions: ['.ts', '.tsx', '.js', '.css', '.json']
    },
    stats: {
        colors: true
    }
}
