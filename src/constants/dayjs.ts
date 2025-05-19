import dayjs from 'dayjs'

const CURRENT_YEAR: number = dayjs().year()
const CURRENT_MONTH: number = dayjs().month() // 0-indexed (0 = January)
const CURRENT_DAY: number = dayjs().date()
const CURRENT_HOUR: number = dayjs().hour()
const CURRENT_MINUTE: number = dayjs().minute()
const CURRENT_SECOND: number = dayjs().second()

export { CURRENT_YEAR, CURRENT_MONTH, CURRENT_DAY, CURRENT_HOUR, CURRENT_MINUTE, CURRENT_SECOND }
