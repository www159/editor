const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { resolve } = require('path')
const env = process.env.NODE_ENV

const isDev = env === 'development'

module.exports = [
    {
        test: /\.tsx?$/,
        use: [
            {
                loader: 'istanbul-instrumenter-loader',
                options: {
                    produceSourceMap: true,
                }
                // include: resolve(__dirname, '..', 'src')
            },

            {
                loader: 'ts-loader',
                /** @type { import("ts-loader").Options } */
                // options: {
                //     compilerOptions: {
                //         noEmitOnError: true,
                //     }
                // },
            }
        ],
        exclude: /node_modules/,
    },

    {
        test: /\.css$/i,
        use: [
            {
                loader: (isDev ? 'style-loader' : MiniCssExtractPlugin.loader)
            },
            'css-loader',
        ],
    },

    {
        test: /\.less$/i,
        use: [
            {
                loader: (isDev ? 'style-loader' : MiniCssExtractPlugin.loader)
            },
            'css-loader',
            {
                loader: 'less-loader',
            }
        ],
    },

    {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'javascript/auto',
        use: {
            loader: "url-loader",
            options: {
                limit: 10 * 1024,
                name: `fonts/[name]--[folder].[ext]`,
            }
        }
    },
]