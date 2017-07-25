const webpack = require('webpack');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, './build');
const APP_DIR = path.resolve(__dirname, './src');

var config = {
    context: APP_DIR,
    entry: {
        javascript: "./index.js"
    },
    module : {
        loaders : [
            {
                test : /\.jsx?$/,
                include : APP_DIR, 
                exclude: /node_modules/,
                loader : 'babel-loader'
            },
            { test: /\.css$/, loader: "style-loader!css-loader" },
            // SVGs: svg, svg?something
            {
                test: /\.svg(\?.*$|$)/,
                loader: 'file-loader?name=themes/openview/images/[name].[ext]'
            },
            // Images: png, gif, jpg, jpeg
            {
                test: /\.(png|gif|jpe?g)$/,
                loader: 'file-loader?name=themes/openview/images/[name].[ext]'
            },
            {
                test: /\.(png|gif|jpe?g)$/,
                loader: 'file-loader?name=themes/openview/images/action/[name].[ext]'
            },
            {
                test: /\.(eot|ttf|woff2?)(\?.*$|$)/,
                loader: 'file-loader?name=themes/openview/fonts/[name].[ext]'
            }
        ]
    },
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
            'REQUEST_TIME_WINDOW': JSON.stringify(process.env.openview_REQUEST_TIME_WINDOW )
        }
      })
    ],
};

// please use "openview_REQUEST_TIME_WINDOW=2 npm run build" to add env openview_REQUEST_TIME_WINDOW to the code



module.exports = config;
