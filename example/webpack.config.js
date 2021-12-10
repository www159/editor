const path = require('path')
const process = require('process')
// const patch = require("react-hot-loader/patch")
const env = process.env.NODE_ENV
const isDev = env === 'development'
console.log('env',env)
/** @type { import('webpack').WebpackOptionsNormalized } */
const config = {
    entry: [
        // 'react-hot-loader/patch',
        path.resolve(__dirname, '..', 'indexspec.ts')
    ],
    output: {
        path: path.resolve(__dirname, '..', 'doc'),
        filename: 'index.js',
    },

    mode: env,

    devtool: isDev ? 'eval-source-map' : 'cheap-module-source-map',

    devServer: {
        port: 3000,
    },

    module: {
        rules: require(path.resolve(__dirname, 'webpack.rules.js')),
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.less', '.json'],
        alias: {
            '@editor': path.resolve(__dirname, '..', 'src'),
            // 'react-dom': '@hot-loader/react-dom',
        }
    },

    plugins: require(path.resolve(__dirname, 'webpack.plugins.js')),

    watchOptions: {
        ignored: ['**/node_modules']
    },

    optimization: {
        minimize: isDev ? false : true
    }
}

module.exports = config