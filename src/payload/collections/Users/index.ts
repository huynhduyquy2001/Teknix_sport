import { CollectionConfig } from 'payload/types'
import adminsAndUser from './access/adminsAndUser'
import { checkRole } from './checkRole'
import express from 'express'
import payload from 'payload'
import { admins } from '../../access/admins'

const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const login = async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const result = await payload.login({
            collection: 'users',
            data: {
                email: email,
                password: password,
            },
        });

        req.session.tempUser = result.user;
        req.session.tempToken = result.token;

        if (!result.user.auth2) {
            const cookieKey = 'payload-token';
            const cookieValue = result.token; // Use token from result
            const cookieOptions = {
                httpOnly: true, // Cookie can only be accessed by the server
                secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
                maxAge: 60 * 60 * 1000, // Cookie lasts for 1 hour
            };
            res.cookie(cookieKey, cookieValue, cookieOptions);
            return res.status(200).json({ user: result.user, token: result.token });
        } else {
            return res.status(200).json({ user: result.user });
        }
    } catch (error) {
        // Handle specific errors
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ message: 'Incorrect email or password.' });
        }

        // Handle other errors if necessary
        return res.status(500).json({ message: error.message });
    }
};

const sendOtp = async (req: express.Request, res: express.Response) => {
    const email = req.session.tempUser.email
    try {

        // Giả định bạn có một cách để lấy thông tin người dùng từ email
        const user = await payload.find({
            collection: 'users',
            where: {
                email: {
                    equals: email,
                },
            },
        })

        if (!user || !user.docs || user.docs.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        const userId = user.docs[0].id

        // Tạo mã xác thực 6 chữ số
        const code = Math.floor(100000 + Math.random() * 900000)

        // Lưu mã xác thực và thời gian hết hạn vào cơ sở dữ liệu người dùng
        await payload.update({
            collection: 'users',
            id: userId,
            data: {
                verificationCode: code,
                verificationCodeExpires: new Date(Date.now() + 3 * 60 * 1000), // Mã hết hạn sau 10 phút
            },
        })
        console.log(code);
        // Gửi email với mã xác thực
        const message = {
            to: email,
            from: process.env.SMTP_USER,
            subject: 'Your verification code',
            text: `Your verification code is ${code}`,
        }

        await payload.sendEmail(message)
        console.log('Email sent successfully')
        res.status(200).json({ message: 'OTP sent successfully' })
    } catch (error) {
        console.error('Failed to send email:', error)
        res.status(500).json({ message: error.message })
    }
}
const verifyOTP = async (req: express.Request, res: express.Response) => {
    try {
        const email = req.session.tempUser.email;
        const { verificationCode } = req.body;

        if (!verificationCode) {
            return res.status(400).json({ message: 'OTP code not provided.' });
        }

        const userRecord = await payload.find({
            collection: 'users',
            where: {
                email: {
                    equals: email,
                },
            },
            limit: 1,
            depth: 1,
            overrideAccess: true, // Override access control to include hidden fields
            showHiddenFields: true,
        });

        if (userRecord.totalDocs === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userDoc = userRecord.docs[0];
        const currentTimestamp = Date.now();

        if (userDoc.verificationCode === null) {
            return res.status(400).json({ message: 'Please request a verification code first.' });
        }

        if (Number(userDoc.verificationCode) !== Number(verificationCode)) {
            return res.status(401).json({ message: 'Invalid verification code.' });
        }

        if (new Date(userDoc.verificationCodeExpires).getTime() < currentTimestamp) {
            return res.status(401).json({ message: 'Verification code has expired.' });
        }

        // Clear the verification code after successful verification
        await payload.update({
            collection: 'users',
            id: userDoc.id,
            data: {
                verificationCode: null,
                verificationCodeExpires: null,
            },
        });

        const cookieKey = 'payload-token';
        const cookieValue = req.session.tempToken; // Use the temporary token
        const cookieOptions = {
            httpOnly: true, // Cookie can only be accessed by the server
            secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
            maxAge: 60 * 60 * 1000, // Cookie lasts for 1 hour
        };

        req.session.tempUser = null;
        req.session.tempToken = null;
        res.cookie(cookieKey, cookieValue, cookieOptions);
        return res.status(200).json({ token: cookieValue });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({ message: 'An error occurred during OTP verification.' });
    }
};
const Users: CollectionConfig = {
    slug: 'users',
    auth: {
        useAPIKey: true,
    },
    admin: {
        useAsTitle: 'email',
    },
    access: {
        read: adminsAndUser,
        update: adminsAndUser,
        delete: admins,
        //admin: ({ req: { user } }) => checkRole(['admin'], user),
    },
    endpoints: [
        {
            path: '/send-otp',
            method: 'post',
            handler: sendOtp,
        },
        {
            path: '/currentUser',
            method: 'get',
            handler: getCurrentUser,
        },
        {
            path: '/login',
            method: 'post',
            handler: login,
        },
        {
            path: '/verify-otp',
            method: 'post',
            handler: verifyOTP,
        },

    ],
    fields: [
        {
            name: 'name',
            type: 'text',
        },
        {
            name: 'phoneNumber',
            type: 'text',
        },
        {
            name: 'phoneVerified',
            type: 'checkbox',
        },
        {
            name: 'emailVerified',
            type: 'checkbox',
        },
        {
            name: 'verificationCode',
            type: 'number',
            admin: {
                readOnly: true,
            },
            hidden: true,
        },
        {
            name: 'verificationCodeExpires',
            type: 'date',
            admin: {
                readOnly: true,
            },
            hidden: true,
        },
        {
            name: 'auth2',
            type: 'checkbox',
            label: '2-step authentication'
        },

        // Email added by default
        // Add more fields as needed
        {
            name: 'roles',
            type: 'select',
            hasMany: true,
            defaultValue: ['customer'],
            options: [
                {
                    label: 'admin',
                    value: 'admin',
                },
                {
                    label: 'customer',
                    value: 'customer',
                },
            ],
            // hooks: {
            //   beforeChange: [ensureFirstUserIsAdmin],
            // },
            // access: {
            //   read: admins,
            //   create: admins,
            //   update: admins,
            // },
        },
    ],
}

export default Users