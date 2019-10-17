// webpack.config.js
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = env => {
    env = env || {}
    env.BASE_URL = 'public/'

    return {
        mode: 'development',
        devtool: 'source-map',
        output: {
            // publicPath: env.BASE_URL,
        },
        devServer: {
            stats: 'minimal',
            contentBase: 'public',
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
            // new webpack.EnvironmentPlugin(['BASE_URL', env.BASE_URL]),
        ],
    }
}
