const path = require('path')
const webpack = require('webpack')

module.exports = {
    devtool: 'none',
    mode: 'production',
    entry: {
        "bundle": path.resolve(__dirname, "gitbook", "_appRoute.tsx")
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
        splitChunks: { name: 'vendor', chunks: 'all' }
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
