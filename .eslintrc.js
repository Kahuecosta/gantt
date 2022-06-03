module.exports = {
	root: true,
	env: {
		commonjs: true,
		es6: true,
		node: true,
	},
	extends: ['plugin:prettier/recommended', 'eslint:recommended'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
		document: true,
		SVGElement: true,
		HTMLElement: true,
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {},
}
