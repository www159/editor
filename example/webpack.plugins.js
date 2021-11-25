const htmlWPPlugins = require('html-webpack-plugin')
const miniCssExtPlugins = require('mini-css-extract-plugin')
const circluarDepPlugins = require('circular-dependency-plugin')
const webpackBar = require('webpackbar')
const webpackProgNar = require('progress-bar-webpack-plugin')
const compressPlugins = require('compression-webpack-plugin')
const bundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const webpack = require('webpack')
const path = require('path')
const isDev = require('process').env.NODE_ENV === 'development'
module.exports = [
    new webpack.CleanPlugin(),
    isDev ? undefined : new miniCssExtPlugins(),
    // new webpackProgNar(),
    // new circluarDepPlugins(),
    new htmlWPPlugins({
        template: path.resolve(__dirname, 'index.html'),
        filename: 'index.html',
        // inject: false,
    }),
    isDev ? undefined : new bundleAnalyzer(),
].filter(plugin => plugin !== undefined)