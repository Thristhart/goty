import config from "config";
import fs from "fs";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import passport from "koa-passport";
import session from "koa-session";
import staticMiddleware from "koa-static";
import path from "path";
import "./auth";
import { logMiddleware } from "./middleware/logging";
import { router } from "./router";

console.log(fs.readdirSync("./config"));

const app = new Koa();

app.keys = [config.get("SESSION_KEY")];

app.use(logMiddleware);

app.use(session({ renew: true }, app));

app.use(bodyParser());

app.use(passport.initialize());
app.use(passport.session());

app.use(staticMiddleware(path.join(__dirname, "../static/"), { defer: true, extensions: ["html"] }));

app.use(router.routes());

console.log("Starting server on 8080");

app.listen(8080);
