import { typescript } from "svelte-preprocess";

export default {
    preprocess: [
        typescript({
            tsconfigFile: "./tsconfig.client.json",
        }),
    ],
    css: (css) => {
        css.write("static/build/index.css");
    },
};
