import express from 'express'
import payload from 'payload'

const router = express.Router()

router.post('/verify-2fa', async (req, res) => {
  const { userId, code } = req.body

  // Tìm người dùng bằng ID
  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  })

  if (!user) {
    return res.status(400).send('User not found')
  }

  // Kiểm tra mã xác thực và thời gian hết hạn
  if (user.verificationCode === code && new Date(user.verificationCodeExpires) > new Date()) {
    // Mã đúng và chưa hết hạn
    return res.status(200).send('2FA verification successful')
  } else {
    // Mã sai hoặc đã hết hạn
    return res.status(400).send('Invalid or expired verification code')
  }
})

export default router
