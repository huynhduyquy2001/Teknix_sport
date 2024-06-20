import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Xử lý thông tin người dùng ở đây
      console.log(profile)
      // Ví dụ: lưu thông tin người dùng vào cơ sở dữ liệu
      return done(null, profile)
    },
  ),
)
