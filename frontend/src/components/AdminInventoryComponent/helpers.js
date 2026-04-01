export const formatMoney = (value = 0) => Number(value || 0).toLocaleString('vi-VN')

export const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '--')

export const getAccessToken = () => {
  const rawToken = localStorage.getItem('access_token')
  if (!rawToken) return ''

  try {
    return JSON.parse(rawToken)
  } catch (error) {
    return ''
  }
}

export const toDayRangeFilter = (dates) => {
  if (!dates || dates.length !== 2) {
    return { fromDate: undefined, toDate: undefined }
  }

  return {
    fromDate: dates[0]?.format('YYYY-MM-DD'),
    toDate: dates[1]?.format('YYYY-MM-DD'),
  }
}

export const includesKeyword = (text, keyword) => {
  if (!keyword) return true
  return String(text || '').toLowerCase().includes(String(keyword).toLowerCase())
}
