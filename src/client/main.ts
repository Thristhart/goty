import App from "./App.svelte";

console.log("hi world!");

const app = new App({
    target: document.body,
    props: {
        name: "world",
    },
});

export default app;
