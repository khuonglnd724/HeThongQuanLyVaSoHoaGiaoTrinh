// Form Validators
export const validators = {
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
  },

  isPhone: (phone) => {
    return /^\d{10,}$/.test(phone.replace(/\D/g, ''))
  },

  isRequired: (value) => {
    return value && value.toString().trim().length > 0
  },

  minLength: (value, min) => {
    return value && value.toString().length >= min
  },

  maxLength: (value, max) => {
    return value && value.toString().length <= max
  },

  isMatch: (value, match) => {
    return value === match
  },
}

export default validators
