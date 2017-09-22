const webpack = require('webpack');
var node_env = (process.env.NODE_ENV || 'development').trim();
var is_dev = node_env == 'development';
module.exports = {
    resolve: {
        //root: __dirname,
        modules: ["./src/js/", "./node_modules/"]
    },
    entry: {
        mintvideo: './src/js/mintvideo.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: __dirname + '/build/js'
    },
    //module: {
	// 	loaders: [
	//	   { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
		   //{ test: /\.css$/, loader: 'style-loader!css-loader' },
		   //{ test: /\.less$/, loader: 'style-loader!css-loader!less-loader'}
	// 	]
	//},
    plugins: is_dev ? [] : [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(node_env),
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            mangle: true,
            compress: {
                warnings: false,
            }
        }),
    ]
}