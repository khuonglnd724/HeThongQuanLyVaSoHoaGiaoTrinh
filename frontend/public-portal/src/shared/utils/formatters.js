// Format utilities
export const formatters = {
  formatDate: (date, format = 'DD/MM/YYYY') => {
    if (!date) return ''
    const d = new Date(date)
    return format
      .replace('YYYY', d.getFullYear())
      .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(d.getDate()).padStart(2, '0'))
  },

  formatTime: (date, format = 'HH:mm:ss') => {
    if (!date) return ''
    const d = new Date(date)
    return format
      .replace('HH', String(d.getHours()).padStart(2, '0'))
      .replace('mm', String(d.getMinutes()).padStart(2, '0'))
      .replace('ss', String(d.getSeconds()).padStart(2, '0'))
  },

  formatCurrency: (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(amount)
  },

  formatNumber: (num) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  },

  truncate: (str, length = 50) => {
    return str && str.length > length ? str.substring(0, length) + '...' : str
  },

  capitalize: (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''
  },
}

export default formatters
