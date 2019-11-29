import Koa from "koa";
import staticMiddleware from "koa-static";
import path from "path";
import { logMiddleware } from "./middleware/logging";
import { router } from "./router";

const app = new Koa();

app.use(logMiddleware);

app.use(staticMiddleware(path.join(__dirname, "../static/"), { defer: true }));

app.use(router.routes());

console.log("Starting server on 8080");

app.listen(8080);
