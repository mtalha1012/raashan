// Seed database with products, slots and demo family: npm run seed
// Deletes existing data first, use --keep-users to keep accounts
const dotenv = require("dotenv")
const mongoose = require("mongoose")

dotenv.config({ path: "backend/config/config.env", quiet: true })

const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const DeliverySlot = require("../models/deliverySlotModel")
const Household = require("../models/householdModel")
const ListItem = require("../models/listItemModel")
const Address = require("../models/addressModel")
const Cart = require("../models/cartModel")
const Order = require("../models/orderModel")
const data = require("./seedData")

// Demo accounts
const DEMO_PASSWORD = "raashan-demo-2026"
const DEMO_USERS = [
    { name: "Raashan Admin", email: "admin@raashan.test", role: "admin" },
    { name: "Talha", email: "talha@raashan.test", nickname: "Talha" },
    { name: "Ayesha", email: "ammi@raashan.test", nickname: "Ammi" },
]

const seed = async () => {
    const keepUsers = process.argv.includes("--keep-users")

    await mongoose.connect(process.env.DB_URI)
    console.log(`Seeding ${mongoose.connection.name}...`)

    await Promise.all([
        Category.deleteMany(), Product.deleteMany(), DeliverySlot.deleteMany(), Household.deleteMany(),
        ListItem.deleteMany(), Address.deleteMany(), Cart.deleteMany(), Order.deleteMany(),
    ])

    if (keepUsers) await User.updateMany({}, { $set: { household: null } })
    else await User.deleteMany()

    // Users (one by one so passwords get hashed)
    const users = {}
    for (const demo of DEMO_USERS) {
        users[demo.email] = await User.findOne({ email: demo.email }) ||
            await User.create({ name: demo.name, email: demo.email, password: DEMO_PASSWORD, role: demo.role || "user" })
    }
    const admin = users["admin@raashan.test"]

    // Catalogue
    const categories = await Category.insertMany(data.categories)
    const categoryId = Object.fromEntries(categories.map((category) => [category.name, category._id]))

    const products = await Product.insertMany(data.products.map(([name, category, price, unit, aliases, stock]) => ({
        name, price, unit, aliases, stock,
        category: categoryId[category],
        description: `${name}, ${unit}`,
        user: admin._id,
    })))
    const productId = Object.fromEntries(products.map((product) => [product.name, product._id]))

    await DeliverySlot.insertMany(data.slots)

    // Demo household
    const familyMembers = DEMO_USERS.filter((demo) => demo.nickname)
    const household = await Household.create({
        name: "Talha's Family",
        inviteCode: "KHAN26",
        owner: users[familyMembers[0].email]._id,
        members: familyMembers.map((demo) => ({ user: users[demo.email]._id, nickname: demo.nickname })),
    })
    await User.updateMany({ email: { $in: familyMembers.map((demo) => demo.email) } }, { $set: { household: household._id } })

    const ammi = users["ammi@raashan.test"]
    await ListItem.insertMany([
        { text: "doodh 2", product: productId["Fresh Milk"], quantity: 2, requestedBy: "Ammi", addedBy: ammi._id },
        { text: "anday 12", product: productId["Eggs"], quantity: 1, requestedBy: "Ammi", addedBy: ammi._id },
        { text: "double roti", product: productId["Bread"], quantity: 1, requestedBy: "Talha", addedBy: users["talha@raashan.test"]._id },
        { text: "achaar", product: null, quantity: 1, requestedBy: "Ammi", addedBy: ammi._id },
    ].map((item) => ({ ...item, household: household._id })))

    await Address.create({
        user: users["talha@raashan.test"]._id,
        label: "Home",
        line1: "House 12, Street 4",
        area: "G-11/2",
        city: "Islamabad",
        phone: "0300 1234567",
        isDefault: true,
    })

    console.log(`${categories.length} categories, ${products.length} products, ${data.slots.length} delivery slots`)
    console.log(`Demo household "${household.name}" -- invite code ${household.inviteCode}`)
    console.log(`Demo logins: ${DEMO_USERS.map((demo) => demo.email).join(", ")} (password in backend/scripts/seed.js)`)

    await mongoose.disconnect()
}

seed().catch((err) => {
    console.log(`Error: ${err.message}`)
    process.exit(1)
})
