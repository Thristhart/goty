import Router from "@koa/router";
import config from "config";
import passport from "koa-passport";
import { Strategy, StrategyOptions } from "passport-google-oauth20";
import { findOrCreateUser } from "../../data/users";

const baseURL = process.env.production ? "https://goty.app" : "http://localhost.shea.at:8080";

const googleOauthConfig: {
    clientID: string;
    clientSecret: string;
} = config.get("GOOGLE_OAUTH");

const googleAuthStrategyConfig: StrategyOptions = {
    ...googleOauthConfig,
    callbackURL: baseURL + "/login_with_google/oauth_redirect",
};

passport.use(
    new Strategy(googleAuthStrategyConfig, async (accessToken, refreshToken, profile, done) => {
        const user = await findOrCreateUser(profile.id);
        done(undefined, user);
    })
);

export const googleAuth = new Router();
googleAuth.get(
    "/",
    passport.authenticate("google", { scope: "openid", successRedirect: "/", failureRedirect: "/login" })
);
googleAuth.get("/oauth_redirect", passport.authenticate("google", { successRedirect: "/", failureRedirect: "/login" }));
