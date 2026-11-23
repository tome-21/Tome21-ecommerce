import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { query } from "./db.js";

passport.use(
  // this obj sends to google to get the user and google send the user data to my callback url
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALL_BACK_URL,
    },

    // and this checks if the incoming user is exist from the profile
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const name = profile.displayName;
        const email = profile.emails?.[0]?.value;
        const imageUrl = profile.photos?.[0]?.value;

        const existingUser = await query(
          `
            SELECT *
            FROM users
            WHERE google_id = $1
          `,
          [googleId],
        );

        // if the user exists we update the db cuz may be the user changes its data
        if (existingUser.rows.length > 0) {
          const result = await query(
            `
              UPDATE users
              SET
                name = $1,
                email = $2,
                image_url = $3,
                updated_at = NOW()
              WHERE google_id = $4
              RETURNING *
            `,
            [name, email, imageUrl, googleId],
          );

          return done(null, result.rows[0]);
        }

        // if not exisit it insert new data 
        const result = await query(
          `
            INSERT INTO users (
              google_id,
              name,
              email,
              image_url
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `,
          [googleId, name, email, imageUrl],
        );

        return done(null, result.rows[0]);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

// ig this is sender to the google to get the user profile 
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// and this one removes the user from google ig
passport.deserializeUser(async (id, done) => {
  try {
    const result = await query(
      `
        SELECT *
        FROM users
        WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;