// Delivery days are calendar days in Pakistan, whatever timezone the server runs in
const TIME_ZONE = "Asia/Karachi"
const BOOKING_DAYS_AHEAD = 6
// A slot can still be booked today until this many minutes before it starts
const SAME_DAY_CUTOFF_MINUTES = 60

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/

// Current date ("YYYY-MM-DD") and minutes since midnight in Pakistan
const nowInPakistan = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date())

    const get = (type) => parts.find((part) => part.type === type).value

    return {
        date: `${get("year")}-${get("month")}-${get("day")}`,
        minutes: Number(get("hour")) * 60 + Number(get("minute")),
    }
}

const addDays = (date, days) => {
    const day = new Date(`${date}T00:00:00Z`)
    day.setUTCDate(day.getUTCDate() + days)
    return day.toISOString().slice(0, 10)
}

// The days a customer can choose from, today first
const bookableDates = () => {
    const { date } = nowInPakistan()
    return Array.from({ length: BOOKING_DAYS_AHEAD + 1 }, (_, i) => addDays(date, i))
}

const isBookableDate = (date) => DATE_FORMAT.test(String(date)) && bookableDates().includes(date)

const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

// False for today's slots that start too soon (or already passed)
const isSlotOpen = (slot, date) => {
    const now = nowInPakistan()
    if (date !== now.date) return true
    return toMinutes(slot.startTime) - now.minutes >= SAME_DAY_CUTOFF_MINUTES
}

module.exports = { nowInPakistan, bookableDates, isBookableDate, isSlotOpen }
