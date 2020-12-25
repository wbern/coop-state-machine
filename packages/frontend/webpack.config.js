// webpack.config.js
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = env => {
    env = env || {}
    env.BASE_URL = 'public/'

    return {
        devtool: 'source-map',
        entry: './src/main.js',
        output: {
            filename: '[name].bundle.js',
            // publicPath: env.BASE_URL,
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'all',
                        priority: 1,
                    },
                },
            },
        },
        devServer: {
            stats: 'minimal',
            contentBase: 'public',
            port: 9090,
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    exclude: /node_modules/,
                    loader: 'vue-loader',
                },
                // this will apply to both plain `.js` files
                // AND `<script>` blocks in `.vue` files
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                },
                {
                    // make all files ending in .json5 use the `json5-loader`
                    test: /\.json$/,
                    include: /json5-snippets/,
                    use: 'json5-loader',
                    type: 'javascript/auto',
                },
                // this will apply to both plain `.css` files
                // AND `<style>` blocks in `.vue` files
                {
                    test: /\.css$/,
                    use: ['vue-style-loader', 'css-loader'],
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'fonts/',
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            // make sure to include the plugin for the magic
            new VueLoaderPlugin(),
            new HtmlWebpackPlugin({
                template: env.BASE_URL + 'index.html',
            }),
            new webpack.DefinePlugin({
                'window.WEBSOCKET_PORT': env.WEBSOCKET_PORT
            })
            // new webpack.EnvironmentPlugin(['BASE_URL', env.BASE_URL]),
        ],
    }
}
