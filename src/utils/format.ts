/**
 * 格式化 Unix 时间戳为可读日期时间
 * @param timestamp Unix 时间戳（秒）
 * @param format 格式类型：'datetime' | 'date' | 'time'
 * @returns 格式化后的字符串
 */
export function formatTimestamp(timestamp: number | null | undefined, format: 'datetime' | 'date' | 'time' = 'datetime'): string {
  if (!timestamp) return '-'

  const date = new Date(timestamp * 1000)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  if (format === 'date') {
    return `${year}-${month}-${day}`
  }

  if (format === 'time') {
    return `${hours}:${minutes}:${seconds}`
  }

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化金额（分转元，保留两位小数）
 * @param amount 金额（分）
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0.00'
  return (amount / 100).toFixed(2)
}
