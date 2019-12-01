import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import resolve from "rollup-plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript";
import svelteConfig from "./svelte.config";

const production = !process.env.ROLLUP_WATCH;

export default {
    input: "src/client/main.ts",
    output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "static/build/index.js",
    },
    plugins: [
        resolve({
            browser: true,
            dedupe: (importee) => importee === "svelte" || importee.startsWith("svelte/"),
        }),
        commonjs(),

        svelte(svelteConfig),
        typescript(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload("static"),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser(),
    ],
    watch: {
        clearScreen: false,
    },
};
