import sass from 'rollup-plugin-sass'
import { terser } from 'rollup-plugin-terser'

const dev = {
	input: 'src/index.js',
	output: {
		name: 'Gantt',
		file: 'dist/simple-gantt.js',
		sourcemap: true,
		format: 'iife',
	},
	plugins: [
		sass({
			output: true,
		}),
	],
}

const prod = {
	input: 'src/index.js',
	output: {
		name: 'Gantt',
		file: 'dist/simple-gantt.min.js',
		sourcemap: false,
		format: 'iife',
	},
	plugins: [
		sass({
			output: true,
			options: {
				outputStyle: 'compressed',
			},
		}),
		terser(),
	],
}

export default [dev, prod]
