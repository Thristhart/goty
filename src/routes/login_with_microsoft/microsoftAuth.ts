import Router from "@koa/router";
import base64url from "base64-url";
import config from "config";
import passport from "koa-passport";
import { Strategy, StrategyOptions, VerifyCallback } from "passport-oauth2";
import { findOrCreateUser } from "../../data/users";

export const baseURL = process.env.NODE_ENV === "production" ? "https://goty.app" : "http://localhost:8080";

const microsoftOauthConfig: {
    clientID: string;
    clientSecret: string;
} = config.get("MICROSOFT_OAUTH");

const microsoftAuthStrategyConfig: StrategyOptions = {
    ...microsoftOauthConfig,
    authorizationURL: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    callbackURL: baseURL + "/login_with_microsoft/oauth_redirect",
};

const microsoftAuthClient = new Strategy(
    microsoftAuthStrategyConfig,
    async (accessToken: string, refreshToken: string, params: any, profile: any, done: VerifyCallback) => {
        // https://docs.microsoft.com/en-us/azure/active-directory/develop/id-tokens
        const jwt_claims = params.id_token.split(".")[1];
        const profile_info = JSON.parse(base64url.decode(jwt_claims));

        const user = await findOrCreateUser(profile_info.sub);
        done(undefined, user);
    }
);

passport.use(microsoftAuthClient);

export const microsoftAuth = new Router();
microsoftAuth.get(
    "/",
    passport.authenticate("oauth2", { scope: "openid", successRedirect: "/", failureRedirect: "/login" })
);
microsoftAuth.get(
    "/oauth_redirect",
    passport.authenticate("oauth2", { scope: "openid", successRedirect: "/", failureRedirect: "/login" })
);
