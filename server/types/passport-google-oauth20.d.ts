declare module 'passport-google-oauth20' {
  import { Strategy as PassportStrategy } from 'passport';
  import type { Profile } from 'passport';
  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  }
  export interface VerifyCallback {
    (accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user?: any) => void): void;
  }
  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
  }
  export { Profile };
}

