// node --test backend/tests -- runs against the seed catalogue, no database needed
const test = require("node:test")
const assert = require("node:assert/strict")
const { parseList, unitInfo } = require("../utils/listParser")
const { products } = require("../scripts/seedData")

const catalogue = products.map(([name, category, price, unit, aliases]) => ({ name, unit, aliases }))

// Shorthand: message -> [[productName or null, quantity, from], ...]
const parse = (message) => parseList(message, catalogue).map((item) => [item.product?.name ?? null, item.quantity, item.from])

test("reads the pitch example", () => {
    assert.deepEqual(parse("ammi: doodh, anday 12"), [
        ["Fresh Milk", 1, "ammi"],
        ["Eggs", 1, "ammi"],
    ])
})

test("strips exported WhatsApp timestamps and keeps the sender", () => {
    const message = [
        "[21/10/26, 9:14 pm] Ammi: doodh 2 aur double roti",
        "21/10/2026, 21:20 - Talha: atta 20 kg",
        "21/10/2026, 21:21 - Talha: <Media omitted>",
    ].join("\n")

    assert.deepEqual(parse(message), [
        ["Fresh Milk", 2, "Ammi"],
        ["Bread", 1, "Ammi"],
        ["Chakki Atta", 2, "Talha"],
    ])
})

test("continuation lines inherit the last sender", () => {
    assert.deepEqual(parse("Abbu: cheeni 2 kg\nchai patti"), [
        ["Sugar", 2, "Abbu"],
        ["Tea Leaves", 1, "Abbu"],
    ])
})

test("converts amounts into packs", () => {
    assert.deepEqual(parse("2 darjan anday, aadha kilo dahi, makhan 400 gram, 3 coke, 3 litre coke"), [
        ["Eggs", 2, ""],
        ["Plain Yogurt", 1, ""],
        ["Butter", 2, ""],
        ["Cola", 3, ""],
        ["Cola", 2, ""],
    ])
})

test("counts packets as they are", () => {
    assert.deepEqual(parse("lal mirch 2 packet, do biscuit"), [
        ["Red Chilli Powder", 2, ""],
        ["Tea Biscuits", 2, ""],
    ])
})

test("prefers the more specific phrase", () => {
    assert.deepEqual(parse("sabz chai, chai biscuit, chai"), [
        ["Green Tea", 1, ""],
        ["Tea Biscuits", 1, ""],
        ["Tea Leaves", 1, ""],
    ])
})

test("forgives one typo and ignores filler words", () => {
    assert.deepEqual(parse("doodth khatam ho gaya hai, tamater le ana please"), [
        ["Fresh Milk", 1, ""],
        ["Tomatoes", 1, ""],
    ])
})

test("keeps unknown items unlinked instead of guessing", () => {
    const [item] = parseList("achaar", catalogue)
    assert.equal(item.product, null)
    assert.equal(item.text, "achaar")
})

test("handles numbered lists and 'chay' as tea, not six", () => {
    assert.deepEqual(parse("1. chay\n2. 2.5 kg aloo"), [
        ["Tea Leaves", 1, ""],
        ["Potatoes", 3, ""],
    ])
})

test("reads pack sizes from unit labels", () => {
    assert.deepEqual(unitInfo("12 pcs"), { kind: "piece", size: 12 })
    assert.deepEqual(unitInfo("200 g"), { kind: "kg", size: 0.2 })
    assert.deepEqual(unitInfo("1.5 litre"), { kind: "litre", size: 1.5 })
    assert.deepEqual(unitInfo("1 loaf"), { kind: "count", size: 1 })
})
