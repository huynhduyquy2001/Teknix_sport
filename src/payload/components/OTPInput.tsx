// components/OTPInput.js
import React, { useState } from 'react'

const OTPInput = ({ onOTPSubmit }) => {
  const [otp, setOTP] = useState('')

  const handleChange = e => {
    setOTP(e.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    onOTPSubmit(otp)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Enter OTP:
        <input type="text" value={otp} onChange={handleChange} />
      </label>
      <button type="submit">Submit</button>
    </form>
  )
}

export default OTPInput
