const webpack = require('webpack')
const path = require('path')

const package = require('./package.json')
const version = JSON.stringify(package.version)

const plugins = bProduction => [
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify(bProduction ? 'production' : 'development'),
	}),
	new webpack.BannerPlugin({
		banner:
			`@license Urpflanze SVGExporter v${version}` +
			`\n[file]` +
			`\n\nGithub: https://github.com/urpflanze-org/svg-exporter` +
			`\n\nThis source code is licensed under the MIT license found in the\nLICENSE file in the root directory of this source tree.`,
	}),
]

const umd = bProduction => ({
	entry: {
		urpflanze: './dist/cjs/index.js',
	},
	output: {
		filename: bProduction ? 'urpflanze-svg-exporter.min.js' : 'urpflanze-svg-exporter.js',
		path: path.resolve('./build/umd'),
		library: {
			name: 'SVGExporter',
			type: 'umd',
		},
		globalObject: 'window',
	},
	plugins: plugins(bProduction),
	devtool: bProduction ? undefined : 'source-map',
	mode: bProduction ? 'production' : 'none',
})

const esm = bProduction => ({
	entry: {
		urpflanze: './dist/esm/index.js',
	},
	output: {
		filename: bProduction ? 'urpflanze-svg-exporter.min.js' : 'urpflanze-svg-exporter.js',
		path: path.resolve('./build/esm'),
		library: {
			type: 'module',
		},
	},
	plugins: plugins(bProduction),
	devtool: bProduction ? undefined : 'source-map',
	mode: bProduction ? 'production' : 'none',
	experiments: {
		outputModule: true,
	},
})

module.exports = [umd(false), umd(true), esm(false), esm(true)]
