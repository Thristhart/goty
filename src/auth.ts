import { Context, DefaultState, Middleware } from "koa";
import passport from "koa-passport";
import { getUserFromDB } from "./data/users";

passport.serializeUser((user: { id: string }, done) => {
    done(undefined, user.id);
});
passport.deserializeUser(async function(id: string, done) {
    try {
        const user = await getUserFromDB(id);
        done(undefined, user);
    } catch (err) {
        done(err);
    }
});

export const requireAuthenticationOrRedirectToLogin: Middleware<DefaultState, Context> = async (ctx, next) => {
    if (ctx.isAuthenticated()) {
        return next();
    } else {
        console.log("not authed, redirecting to login");
        ctx.redirect("/login");
    }
};

export const requireAuthenticationOr403: Middleware<DefaultState, Context> = async (ctx, next) => {
    if (ctx.isAuthenticated()) {
        return next();
    } else {
        console.log("not authed, 403ing");
        ctx.status = 403;
        ctx.body = "Not Authorized";
    }
};
