import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage.ts";
import dotnet from 'dotenv';
dotnet.config();

const getOidcConfig = memoize(
  async () => {
    // Only configure OIDC in production with proper Replit environment
    if (process.env.NODE_ENV === "production" && process.env.REPL_ID) {
      return await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID!
      );
    }
    // Return null for development - auth functions will handle this
    return null;
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // For local development without database, use memory store
  if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
    return session({
      secret: process.env.SESSION_SECRET || 'local-dev-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // Set to false for localhost
        maxAge: sessionTtl,
      },
    });
  }
  
  // For production or when database is available
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Setup passport strategy only if in production with proper Replit environment
  if (process.env.NODE_ENV === "production" && process.env.REPLIT_DOMAINS && config) {
    for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
      // For development, create a mock user session
      req.login({ 
        claims: { 
          sub: "dev-user-123", 
          email: "dev@example.com", 
          first_name: "Dev", 
          last_name: "User" 
        },
        access_token: "dev-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600
      }, (err) => {
        if (err) return next(err);
        res.redirect("/");
      });
    } else {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    }
  });

  app.get("/api/callback", (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
      res.redirect("/");
    } else {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      if (process.env.NODE_ENV === "development" || !config) {
        res.redirect("/");
      } else {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In development mode, allow all requests to pass through for testing
  if (process.env.NODE_ENV === "development") {
    // Create a mock user if not authenticated
    if (!req.isAuthenticated()) {
      req.user = { 
        claims: { 
          sub: "dev-user-123", 
          email: "dev@example.com", 
          first_name: "Dev", 
          last_name: "User" 
        },
        access_token: "dev-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
    }
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    if (!config) {
      // In development, don't try to refresh tokens
      return next();
    }
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
