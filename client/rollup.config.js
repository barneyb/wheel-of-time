import injectProcessEnv from 'rollup-plugin-inject-process-env';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import jsx from 'acorn-jsx';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		file: '../public/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true
	},
    acornInjectPlugins: [
        jsx(),
    ],
	plugins: [
		resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
        injectProcessEnv({
            NODE_ENV: production ? 'production' : 'development',
        }),
        babel({ babelHelpers: 'bundled' }),
		production && terser() // minify, but only in production
	],
};
