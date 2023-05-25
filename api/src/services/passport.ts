import { Authenticator, User } from "@prisma/client";
import { Express } from "express";
import { DateTime } from "luxon";
import cookieParser from "cookie-parser";
import session from "cookie-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oidc";
import { CtxUser } from "../graphql/context";
import { findFirstUser, upsertUser } from "../services/users.service";
import configureAuthRoutes from "../routes/auth.router";
import { APP_UI, env } from "../constants";

type PassportUser = {
  // The provider with which the user authenticated (facebook, twitter, etc.).
  provider: string & ("google" | "facebook" | "twitter");
  // A unique identifier for the user, as generated by the service provider.
  id: string;
  // The name of this user, suitable for display.
  displayName: string;
  // User's given name
  name: {
    // The family name of this user, or "last name" in most Western languages.
    familyName: string;
    // The given name of this user, or "first name" in most Western languages.
    givenName: string;
    // The middle name of this user.
    middleName: string;
  };
  // actual email address, type address (home, work, etc.).
  emails?: { value: string; type?: string }[];
  // The URL of the image.
  photos: string[];
};

export default passport;

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SK;
const callbackURL = `${APP_UI}/oauth2/redirect/google`;
const maxAge = 86400000; // 24 hours
const toCtxUser = (u: User): CtxUser => ({
  id: u.id,
  email: u.email,
  role: u.role,
  lastSeen: DateTime.now().toJSDate()
});

export function configurePassport(app: Express) {
  const secret = process.env.JWT_SEC;
  if (!secret) throw new Error("env JWT_SEC not set: run generate-keys");
  const secure = env === "production";
  const sessionCookie = { maxAge, httpOnly: true, secure };
  const sessionOpts = {
    cookie: sessionCookie,
    secret,
    resave: true,
    saveUninitialized: true
  };

  app.use(cookieParser(secret));
  app.use(session(sessionOpts));
  // register regenerate & save after the cookieSession middleware initialization
  // See: https://github.com/jaredhanson/passport/issues/904#issuecomment-1307558283
  app.use(function (req, _res, next) {
    if (req.session && !req.session.regenerate) {
      req.session.regenerate = ((cb: any) => {
        cb();
      }) as any;
    }
    if (req.session && !req.session.save) {
      req.session.save = ((cb: any) => {
        cb();
      }) as any;
    }
    next();
  });
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize authenticated user
  passport.serializeUser(function serializeUser(user, done) {
    process.nextTick(function () {
      return done(null, JSON.stringify(user));
    });
  });

  // unpack stored user
  passport.deserializeUser(function deserializeUser(user: string, done) {
    process.nextTick(function () {
      return done(null, JSON.parse(user));
    });
  });

  // Configure Google sign-in strategy
  passport.use(
    new GoogleStrategy({ clientID, clientSecret, callbackURL }, verify)
  );

  configureAuthRoutes(app, passport);
}

/**
 * Link social sign-on user to internal account
 * @param user Authenticated user
 * @param done Callback function
 */
async function verify(
  issuer: string,
  profile: PassportUser,
  cb: (e: Error | string | null, u?: CtxUser) => any
) {
  // Exit if no emails fetched from auth
  if (!Array.isArray(profile.emails)) {
    const e = new Error("No email fetched from authentication");
    return cb(e);
  }

  // Retrieve or create user
  const [{ value: email }] = profile.emails;
  const internalUser =
    (await findFirstUser({ email })) ||
    (await upsertUser({
      email,
      role: "Author",
      displayName: email,
      authSource: getAuthIssuer(issuer)
    }));

  return cb(null, toCtxUser(internalUser));
}

/**
 * Get `Authenticator` value for auth issuer
 * @param issuer Issuer from `Passport` (e.g. `https://accounts.google.com`)
 * @returns `Authenticator` value for auth issuer
 */
function getAuthIssuer(issuer: string): Authenticator {
  if (issuer.includes("google")) return "google";
  if (issuer.includes("magic")) return "magic";
  return "other";
}
