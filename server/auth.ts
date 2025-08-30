import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy, type Profile as GoogleProfile } from "passport-google-oauth20";
import connectPg from "connect-pg-simple";
import { storage } from "./storage.ts";

type SerializedUser = {
  claims: {
    sub: string;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    profile_image_url?: string | null;
  };
};

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  if (process.env.NODE_ENV === "development") {
    return session({
      secret: process.env.SESSION_SECRET || "dev-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: false, maxAge: sessionTtl },
    });
  }
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl / 1000,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: sessionTtl },
  });
}

function configureGoogleStrategy() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientID || !clientSecret) return false;

  const callbackURL = `${process.env.BASE_URL || "http://localhost:3000"}/home`;
  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GoogleProfile,
        done: (err: any, user?: any) => void,
      ) => {
        try {
          const email = profile.emails?.[0]?.value || null;
          const firstName = profile.name?.givenName || null;
          const lastName = profile.name?.familyName || null;
          const imageUrl = profile.photos?.[0]?.value || null;
          console.log(email, firstName, lastName, imageUrl);
          // Find or create a user record, and always use the DB user's id as session subject
          let dbUserId: string;
          if (email) {
            const existing = await storage.getUserByEmail(email);
            if (existing) {
              dbUserId = existing.id;
            } else {
              const created = await storage.upsertUser({
                email: email || undefined,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                profileImageUrl: imageUrl || undefined,
              });
              dbUserId = created.id;
            }
          } else {
            // No email provided: create/find a user keyed by provider id
            const fallbackId = `google:${profile.id}`;
            const created = await storage.upsertUser({
              id: fallbackId,
              email: undefined,
              firstName: firstName || undefined,
              lastName: lastName || undefined,
              profileImageUrl: imageUrl || undefined,
            });
            dbUserId = created.id;
          }

          const user: SerializedUser = {
            claims: {
              sub: dbUserId,
              email,
              first_name: firstName,
              last_name: lastName,
              profile_image_url: imageUrl,
            },
          };
          return done(null, user);
        } catch (err) {
          return done(err as any);
        }
      },
    ),
  );
  return true;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  const googleEnabled = configureGoogleStrategy();
  console.log(googleEnabled);
  // Login route
  app.get("/api/login", (req, res, next) => {
    if (googleEnabled) {
      passport.authenticate("google", { scope: ["openid", "email", "profile"] })(req, res, next);
      return;
    }
    console.log(googleEnabled)
    if (process.env.NODE_ENV === "development") {
      // Mock login for development
      const user: SerializedUser = {
        claims: {
          sub: "dev-user-123",
          email: "dev@example.com",
          first_name: "Dev",
          last_name: "User",
          profile_image_url: null,
        },
      };
      req.login(user as any, (err) => {
        if (err) return next(err);
        res.redirect("/");
      });
    } else {
      res.status(500).json({ message: "Authentication not configured" });
    }
  });

  // Google OAuth callback
  if (googleEnabled) {
    app.get(
      "/home",
      passport.authenticate("google", { failureRedirect: "/" }),
      (req, res) => {
        const user = req.user as any;
        const userId = user?.claims?.sub || "";
        const email = user?.claims?.email || "";
        res.setHeader("Content-Type", "text/html");
        res.send(`<!doctype html><html><body><script>
          try {
            localStorage.setItem('altmed_user_id', ${JSON.stringify(userId)});
            if (${JSON.stringify(email)} && ${JSON.stringify(email)} !== '') {
              localStorage.setItem('altmed_user_email', ${JSON.stringify(email)});
            }
          } catch (e) {}
          window.location.replace('/');
        </script></body></html>`);
      },
    );
  }

  // Logout
  app.get("/api/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  // Allow header-based user propagation as a fallback
  const headerUserId = req.header("x-user-id") || req.header("X-User-Id");
  if (headerUserId) {
    (req as any).user = { claims: { sub: headerUserId } } as any;
    return next();
  }
  if (process.env.NODE_ENV === "development") {
    // In dev, ensure a user exists so the app works out-of-the-box
    if (!req.isAuthenticated()) {
      (req as any).user = { claims: { sub: "dev-user-123" } } satisfies SerializedUser;
    }
    return next();
  }
  const user = req.user as SerializedUser | undefined;
  if (req.isAuthenticated() && user?.claims?.sub) return next();
  return res.status(401).json({ message: "Unauthorized" });
};


