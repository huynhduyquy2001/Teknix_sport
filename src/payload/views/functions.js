$(document).ready(function () {
  $('#loginForm').on('submit', function (event) {
    event.preventDefault() // Ngăn chặn form submit mặc định
    const email = $('#field-email').val()
    const password = $('#field-password').val()
    const verificationCode = $('#field-verificationCode').val()
    toast({
      title: 'Thành công',
      message: 'Tài khoản đã được cập nhật',
      type: 'success',
      duration: 100000,
    })
    $.ajax({
      url: '/api/users/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email, password, verificationCode }),
      success: function (response) {
        window.location.href = '/admin/collections'
      },
      error: function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.responseJSON && jqXHR.responseJSON.errors) {
          jqXHR.responseJSON.errors.forEach(error => {
            error.data.forEach(fieldError => {
              toast({
                title: 'Thành công',
                message: 'Tài khoản đã được cập nhật',
                type: 'success',
                duration: 1000,
              })
            })
          })
        } else {
          toast({
            title: 'Error',
            message: 'Login failed',
            type: 'error',
            duration: 1000,
          })
        }
      },
    })
  })

  $('#sendOtpLink').on('click', function (event) {
    event.preventDefault() // Ngăn chặn hành vi mặc định của liên kết

    const email = $('#field-email').val()

    if (!email) {
      Toastify({
        text: 'Email is required',
        duration: 3000,
        close: true,
        gravity: 'top', // `top` or `bottom`
        position: 'right', // `left`, `center` or `right`
        backgroundColor: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        stopOnFocus: true, // Prevents dismissing of toast on hover
      }).showToast()
      return
    }

    $.ajax({
      url: '/admin/send-otp',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email: email }),
      success: function (response) {
        Toastify({
          text: 'OTP sent successfully!',
          duration: 3000,
          close: true,
          gravity: 'top', // `top` or `bottom`
          position: 'right', // `left`, `center` or `right`
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
          stopOnFocus: true, // Prevents dismissing of toast on hover
        }).showToast()
      },
      error: function (jqXHR, textStatus, errorThrown) {
        let errorMessage = 'Failed to send OTP'
        if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
          errorMessage = jqXHR.responseJSON.message
        }
        Toastify({
          text: errorMessage,
          duration: 3000,
          close: true,
          gravity: 'top', // `top` or `bottom`
          position: 'right', // `left`, `center` or `right`
          backgroundColor: 'linear-gradient(to right, #ff5f6d, #ffc371)',
          stopOnFocus: true, // Prevents dismissing of toast on hover
        }).showToast()
      },
    })
  })
})
