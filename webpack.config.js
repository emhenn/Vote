const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');

//const lighthouseConfig = require('./webpack.lighthouse');

const parts = require('./webpack.parts');

const developmentConfig = require('./webpack.dev');
// const lighthouseConfig = require('./webpack.lighthouse');
const productionConfig = require('./webpack.prod');
const testConfig = require('./webpack.test');

const PATHS = {
	app: path.resolve(__dirname, 'app'),
	build: path.resolve(__dirname, 'dist')
};

// merge sect 4.2 of SurviveJS - Webpack -- refactor

// https://webpack.js.org/guides/code-splitting-async/

// look into https://github.com/addyosmani/webpack-lighthouse-plugin
// it might get integrated into Chrome 60

// look into imports-loader https://github.com/webpack-contrib/imports-loader

// https://webpack.js.org/guides/webpack-and-typescript/#enabling-tree-shaking

// TODO this can be a .ts file https://medium.com/webpack/unambiguous-webpack-config-with-typescript-8519def2cac7

const commonConfig = merge([
	{
		entry: {
			// the entry point of our app
			app: [
				PATHS.app
			],
			vendor: [
				// 'jquery', // imports-loader?$= commenting out as Bootstrap isn't using any scripts
				'bootstrap-loader'
			],
		},
		output: {
			filename: '[name].js',
			path: PATHS.build,
			publicPath: '/',
		},
		module: {
			rules: [
				{
					test: /\.vue$/,
					loader: 'vue-loader',
					options: {
						esModule: false, // when tsconfig.json set to use es2015 modules?
						loaders: {
							ts: 'ts-loader'
						},
					}
				},
				{
					test: /\.tsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
						},
						{
							loader: 'ts-loader',
							options: {
								appendTsSuffixTo: [
									/\.vue$/
								]
							}
						},
					]
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
					}
				},
				{
					test: /\.scss$/,
					loaders: ['style-loader', 'css-loader', 'postcss', 'sass']
				},
				{
					test: /\.(woff2?|ttf|eot|svg)$/,
					loader: 'url-loader?limit=10000'
				},
				{
					// bootstrap 3
					test: /bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/,
					loader: 'imports-loader?jQuery=jquery'
				},
				{
					// bootstrap 4
					test: /bootstrap[\/\\]dist[\/\\]js[\/\\]umd[\/\\]/,
					loader: 'imports-loader?jQuery=jquery'
				},
				{ // only added to address brittleness in chai, see https://github.com/chaijs/chai/issues/985
					test: /\.json$/,
					loader: 'json-loader',
				}
			]
		},
		plugins: [
			new webpack.ProvidePlugin({
				$: 'jquery',
				jQuery: 'jquery',
				'window.jquery': 'jquery',
				Tether: 'tether',
				'window.Tether': 'tether'
			}),
			new webpack.EnvironmentPlugin(
				{
					'NODE_ENV': 'development'
				}
			),
			new webpack.optimize.ModuleConcatenationPlugin()
		],
		resolve: {
			// Add '.ts' and '.tsx' as a resolvable extension.
			alias: {
				'vue$': 'vue/dist/vue.esm.js'
			},
			extensions: ['.vue', '.ts', '.tsx', '.js', '.json']
		}
	},
	parts.lintJavaScript({include: PATHS.app}),
	parts.loadCSS()
]);

module.exports = (env) => {
	let config = {};
	switch(env) {

		// once lighthouse is fixed use lighthouseConfig in combination with
		// serving a prod built
		// see https://github.com/addyosmani/webpack-lighthouse-plugin/issues/5

		case 'development':
			config = merge(commonConfig, developmentConfig);
			break;
		case 'production':
			config = merge(commonConfig, productionConfig); // lighthouseConfig
			break;
		default:
		case 'test':
			config = merge(commonConfig, developmentConfig, testConfig);
			break;
	}

	return config;
};
