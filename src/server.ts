import crypto from 'crypto'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import next from 'next'
import nextBuild from 'next/dist/build'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import path from 'path'
import payload from 'payload'

import type { User } from './payload/payload-types'
import { scheduleJob } from './payload/schedulers/scheduler'
import { seed } from './payload/seed'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { checkAuthentication } from './payload/middleware/checkAuthentication'
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

const app = express()

const PORT = process.env.PORT || 3000
declare module 'express-session' {
  interface SessionData {
    tempUser: any; // Bạn có thể thay thế `any` bằng kiểu cụ thể hơn nếu biết rõ kiểu của `tempUser`
    tempToken: string;
  }
}
app.use(
  session({
    secret: process.env.PAYLOAD_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }),
)
const getCookieExpiration = (expiration: string | number) => {
  if (typeof expiration === 'number') {
    return new Date(Date.now() + expiration * 1000); // expiration is in seconds
  } else if (typeof expiration === 'string') {
    return new Date(expiration);
  } else {
    throw new Error('Invalid token expiration format');
  }
};


// Sử dụng middleware để phục vụ các tệp tĩnh từ thư mục "public"
app.use(express.static(path.join(__dirname, '../public')));

// Ví dụ route để trả về trang login-mfa.html
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login-mfa.html'));
});
app.get('/admin/verify-otp', (req, res) => {
  if (!req.session.tempUser) {
    return res.redirect('/admin/login');
  }
  res.set('Content-Type', 'text/html')
  res.sendFile(path.join(__dirname, '/payload/views/sendOtp.html'))
})

app.use('/admin', checkAuthentication);
const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || '',
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
    email: {
      transportOptions: {
        host: process.env.SMTP_HOST,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false (the default) for 587 and others
        requireTLS: true,
      },
      fromName: 'Huynh Duy Quy',
      fromAddress: 'huynhduyquy2001@gmail.com',
    },
  })
  //write here
  // Middleware to establish session
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Middleware to initialize Passport and session
  app.use(passport.initialize())
  app.use(passport.session())

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Access configuration for the 'users' collection
      const collectionConfig = payload.collections["users"].config;
      const user = req.user as User;
      // Select the fields from the user object to include in the JWT
      let fieldsToSign = {
        email: user.email,  // User's email
        id: user.id,  // User's ID
        collection: "users",  // Collection to which the user belongs
      };

      // Sign the JWT with selected fields
      const token = jwt.sign(fieldsToSign, payload.secret, {
        expiresIn: collectionConfig.auth.tokenExpiration,  // Set token expiration as per configuration
      });

      // Set a cookie in the response with the JWT
      res.cookie(`${payload.config.cookiePrefix}-token`, token, {
        path: "/",  // Cookie path
        httpOnly: true,  // HttpOnly flag for security
        expires: getCookieExpiration(collectionConfig.auth.tokenExpiration),  // Cookie expiration time
        secure: collectionConfig.auth.cookies.secure,  // Secure flag (for HTTPS)
        sameSite: collectionConfig.auth.cookies.sameSite,  // SameSite attribute
        domain: collectionConfig.auth.cookies.domain || undefined,  // Cookie domain
      });
      res.redirect('/');
    }
  );
  // Route to check login status
  app.get('/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
      console.log(req.user)
      res.status(200).send(`User is authenticated: ${JSON.stringify(req.user, null, 2)}`)
      console.log(req.user)
    } else {
      res.status(401).send('User is not authenticated')
    }
  })
  //  Passport config
  passport.serializeUser((user: any, done) => {
    done(null, user.id); // Lưu trữ user ID trong session
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await payload.findByID({
        collection: 'users',
        id,
      });

      if (user) {
        done(null, user); // Tải lại người dùng từ cơ sở dữ liệu
      } else {
        done(new Error('User not found'), null);
      }
    } catch (error) {
      done(error, null);
    }
  });


  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // find user in Payload CMS
          const result = await payload.find({
            collection: 'users',
            where: {
              email: { equals: profile.emails[0].value },
            },
          })
          let user: User
          const randomPassword = crypto.randomBytes(20).toString('hex')
          if (result.docs.length === 0) {
            user = await payload.create({
              collection: 'users',
              data: {
                email: String(profile.emails[0].value),
                name: String(profile.displayName),
                password: randomPassword,
              },
            })
            // send mail with OTP
            // const message = {
            //   to: String(profile.emails[0].value),
            //   from: process.env.SMTP_USER,
            //   subject: 'You are logged in with your Google account at Payload CMS',
            //   text: `Your random password is ${randomPassword}, please change it to increase security`,
            // }
            // await payload.sendEmail(message)
          } else {
            user = result.docs[0]
          }
          // Sử dụng ID tự động sinh của Payload CMS
          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      },
    ),
  )
  if (process.env.PAYLOAD_SEED === 'true') {
    await seed(payload)
    process.exit()
  }

  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info(`Next.js is now building...`)
      // @ts-expect-error
      await nextBuild(path.join(__dirname, '../'))
      process.exit()
    })

    return
  }

  const nextApp = next({
    dev: process.env.NODE_ENV !== 'production',
  })

  const nextHandler = nextApp.getRequestHandler()

  app.use((req, res) => nextHandler(req, res))

  nextApp.prepare().then(() => {
    payload.logger.info('Starting Next.js...')

    app.listen(PORT, async () => {
      payload.logger.info(`Next.js App URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}`)
      // scheduleJob();
    })
  })
}

start()
