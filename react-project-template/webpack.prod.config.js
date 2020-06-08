const path = require('path')
const webpack = require('webpack')

module.exports = {
    devtool: 'none',
    mode: 'production',
    entry: {
        "bundle": path.resolve(__dirname, "source", "_appRoute.tsx")
    },
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].js"
    },
    plugins: [
        new webpack.DefinePlugin({
            STATIC_PATH: "''"
        })
    ],
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