const DeliverySlot = require("../models/deliverySlotModel")
const Order = require("../models/orderModel")
const ErrorHandler = require("../utils/errorHandler")
const asyncError = require("../middleware/asyncError")
const { bookableDates, isBookableDate, isSlotOpen } = require("../utils/deliveryDates")

const pickSlotFields = (body) => {
    const fields = {}
    for (const key of ["label", "startTime", "endTime", "capacity", "isActive"]) {
        if (body[key] !== undefined) fields[key] = body[key]
    }
    return fields
}

// How many active orders each slot already has on a date
const bookedCounts = async (date) => {
    const rows = await Order.aggregate([
        { $match: { "deliverySlot.date": date, orderStatus: { $ne: "Cancelled" } } },
        { $group: { _id: "$deliverySlot.slot", count: { $sum: 1 } } },
    ])
    return Object.fromEntries(rows.map((row) => [String(row._id), row.count]))
}

// Active slots for a date with remaining capacity -- ?date=YYYY-MM-DD (defaults to today)
exports.getSlotAvailability = asyncError(async (req, res, next) => {
    const dates = bookableDates()
    const date = req.query.date || dates[0]

    if (!isBookableDate(date)) {
        return next(new ErrorHandler(`Delivery date must be between ${dates[0]} and ${dates[dates.length - 1]}`, 400))
    }

    const slots = await DeliverySlot.find({ isActive: true }).sort({ startTime: 1 }).lean()
    const booked = await bookedCounts(date)

    res.status(200).json({
        success: true,
        date,
        dates,
        slots: slots.map((slot) => {
            const remaining = Math.max(0, slot.capacity - (booked[String(slot._id)] || 0))
            const open = isSlotOpen(slot, date)
            return { ...slot, remaining, available: open && remaining > 0, reason: !open ? "Too late for today" : remaining === 0 ? "Full" : "" }
        }),
    })
})

// All slots including inactive ones -- Admin
exports.getAllSlots = asyncError(async (req, res, next) => {
    const slots = await DeliverySlot.find().sort({ startTime: 1 })

    res.status(200).json({
        success: true,
        slots,
    })
})

// Create slot -- Admin
exports.createSlot = asyncError(async (req, res, next) => {
    const slot = await DeliverySlot.create(pickSlotFields(req.body))

    res.status(201).json({
        success: true,
        slot,
    })
})

// Update slot -- Admin (save() so the start/end check runs)
exports.updateSlot = asyncError(async (req, res, next) => {
    const slot = await DeliverySlot.findById(req.params.id)
    if (!slot) return next(new ErrorHandler("Delivery slot not found", 404))

    Object.assign(slot, pickSlotFields(req.body))
    await slot.save()

    res.status(200).json({
        success: true,
        slot,
    })
})

// Delete slot -- Admin (blocked while upcoming orders still use it)
exports.deleteSlot = asyncError(async (req, res, next) => {
    const slot = await DeliverySlot.findById(req.params.id)
    if (!slot) return next(new ErrorHandler("Delivery slot not found", 404))

    const upcoming = await Order.countDocuments({
        "deliverySlot.slot": slot._id,
        "deliverySlot.date": { $gte: bookableDates()[0] },
        orderStatus: { $nin: ["Delivered", "Cancelled"] },
    })

    if (upcoming > 0) {
        return next(new ErrorHandler(`${upcoming} upcoming order(s) use this slot. Deactivate it instead`, 400))
    }

    await slot.deleteOne()

    res.status(200).json({
        success: true,
        message: "Delivery slot deleted",
    })
})

exports.bookedCounts = bookedCounts
