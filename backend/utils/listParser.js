// Turns a pasted WhatsApp message (or a plain typed list) into grocery list items.
// Rule based on purpose: every result is shown to the user to confirm before it is saved.

// "[21/10/26, 9:14 pm] " or "21/10/2026, 21:14 - " at the start of an exported WhatsApp line
const WHATSAPP_PREFIX = /^\[?\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?\s?m\.?)?\]?\s*(?:-\s*)?/i

// "Ammi: doodh le ana" -- a short name followed by a colon
const SENDER = /^([\p{L}][\p{L} .'_-]{0,24}):\s*(.+)$/u

// WhatsApp system lines that are never grocery items
const SYSTEM_LINES = [
    /end-to-end encrypted/i,
    /<media omitted>/i,
    /(image|video|audio|sticker|gif|document) omitted/i,
    /this message was deleted/i,
    /you deleted this message/i,
    /missed (voice|video) call/i,
]

// Separators between items: commas (English and Urdu), "and"/"aur", "&", "+", ";"
const ITEM_SEPARATOR = /\s*(?:,|،|;|&|\+|\band\b|\baur\b|\bor\b)\s*/i

const NUMBER_WORDS = {
    ek: 1, aik: 1, one: 1,
    do: 2, two: 2,
    teen: 3, three: 3,
    char: 4, chaar: 4, four: 4,
    panch: 5, paanch: 5, five: 5,
    // "chay" is left out on purpose -- it usually means tea, not six
    chhe: 6, six: 6,
    saat: 7, seven: 7,
    aath: 8, eight: 8,
    nau: 9, nine: 9,
    das: 10, ten: 10,
    aadha: 0.5, adha: 0.5, half: 0.5,
}

// Unit words: [what they measure, how many base units (kg, litre, piece) they are worth]
const KG = ["kg", 1], GRAM = ["kg", 0.001], LITRE = ["litre", 1], ML = ["litre", 0.001]
const PIECE = ["piece", 1], DOZEN = ["piece", 12]
const MEASURE_UNITS = {
    kg: KG, kgs: KG, kilo: KG, kilos: KG,
    g: GRAM, gm: GRAM, gms: GRAM, gram: GRAM, grams: GRAM,
    l: LITRE, ltr: LITRE, litre: LITRE, liter: LITRE, litres: LITRE, liters: LITRE,
    ml: ML,
    pc: PIECE, pcs: PIECE, piece: PIECE, pieces: PIECE, adad: PIECE,
    dozen: DOZEN, darjan: DOZEN, darjun: DOZEN, dozan: DOZEN,
}

// Unit words that already mean "this many of the product"
const COUNT_UNITS = ["packet", "packets", "pack", "packs", "pkt", "bottle", "bottles", "box", "boxes",
    "dabba", "dabbay", "tin", "tins", "jar", "bag", "bags", "carton", "cartons", "bori"]

// Words that carry no product meaning in Roman Urdu / English requests
const FILLER_WORDS = ["le", "lay", "lete", "ana", "aana", "aaye", "lana", "laana", "lao", "laao", "chahiye", "chahye",
    "chaiye", "chahiay", "please", "plz", "pls", "bhi", "ka", "ki", "ke", "wala", "wali", "walay", "khatam", "ho",
    "gaya", "gya", "gai", "hogaya", "hai", "hain", "nahi", "nai", "ghar", "mein", "me", "main", "kuch", "thora",
    "thoda", "zara", "beta", "bhai", "jaan", "yaar", "ye", "yeh", "wo", "woh", "sath", "saath", "liye",
    "get", "buy", "need", "some", "also", "the", "a", "of", "for", "from", "store", "shop", "dukan", "x"]

const MAX_QUANTITY = 99

const normalize = (text) => text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}.\s]/gu, " ")
    // Keep dots only inside decimals like 2.5
    .replace(/(?<!\d)\.|\.(?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const levenshtein = (a, b) => {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i)
    for (let i = 1; i <= a.length; i++) {
        let previous = row[0]
        row[0] = i
        for (let j = 1; j <= b.length; j++) {
            const current = row[j]
            row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
            previous = current
        }
    }
    return row[b.length]
}

// Splits pasted text into { from, text } chunks, one per requested item
const splitMessage = (message) => {
    const chunks = []
    let currentSender = ""

    for (let line of String(message).split(/\r?\n/)) {
        line = line.trim()
        if (!line || SYSTEM_LINES.some((pattern) => pattern.test(line))) continue

        const hasPrefix = WHATSAPP_PREFIX.test(line)
        line = line.replace(WHATSAPP_PREFIX, "")

        const senderMatch = line.match(SENDER)
        // Without a WhatsApp timestamp only treat short names (up to 3 words) as senders
        if (senderMatch && (hasPrefix || senderMatch[1].trim().split(/\s+/).length <= 3)) {
            currentSender = senderMatch[1].trim()
            line = senderMatch[2]
        }

        for (const piece of line.split(ITEM_SEPARATOR)) {
            // Drop list bullets like "-", "*", "1." or "2)"
            const text = piece.replace(/^(?:[-*•]|\d+[.)](?!\d))\s*/, "").trim()
            if (/\p{L}/u.test(text)) chunks.push({ from: currentSender, text })
        }
    }

    return chunks
}

// Reads the amount out of a chunk: "2 kg", "anday 12", "do packet", "1 darjan", "2kg"
const readAmount = (words) => {
    for (let i = 0; i < words.length; i++) {
        const glued = words[i].match(/^(\d+(?:\.\d+)?)([a-z]+)$/)
        let amount = null
        let unitWord = words[i + 1]

        if (glued) {
            amount = Number(glued[1])
            unitWord = glued[2]
        } else if (/^\d+(\.\d+)?$/.test(words[i])) {
            amount = Number(words[i])
        } else if (NUMBER_WORDS[words[i]] !== undefined && words.length > 1) {
            // A number word on its own ("do") is not an item, so it only counts next to other words
            amount = NUMBER_WORDS[words[i]]
        }

        if (amount === null) continue

        const [kind, factor] = MEASURE_UNITS[unitWord] || [null, 1]
        return { amount, kind, factor, isCount: COUNT_UNITS.includes(unitWord) }
    }

    // "darjan anday" with no number means one dozen
    const unitWord = words.find((word) => MEASURE_UNITS[word] === DOZEN)
    if (unitWord) return { amount: 1, kind: "piece", factor: 12, isCount: false }

    return { amount: null, kind: null, factor: 1, isCount: false }
}

// What one product unit holds, read from its label: "12 pcs" -> 12 pieces, "200 g" -> 0.2 kg.
// Labels like "1 loaf" or "1 packet" are plain counts.
const unitInfo = (unitLabel) => {
    const match = normalize(String(unitLabel || "")).match(/^(\d+(?:\.\d+)?)\s*([a-z]+)/)
    const [kind, factor] = (match && MEASURE_UNITS[match[2]]) || ["count", 1]
    return { kind, size: match && kind !== "count" ? Number(match[1]) * factor : 1 }
}

// Leaves only the words that can name a product
const productWords = (words) => words.filter((word) =>
    !/\d/.test(word) &&
    NUMBER_WORDS[word] === undefined &&
    MEASURE_UNITS[word] === undefined &&
    !COUNT_UNITS.includes(word) &&
    !FILLER_WORDS.includes(word)
)

// Best matching product for the remaining words, or null
const matchProduct = (words, products) => {
    const query = ` ${words.join(" ")} `
    let best = null
    let bestScore = 0

    for (const product of products) {
        const terms = [product.name, ...(product.aliases || [])].map(normalize).filter(Boolean)

        for (const term of terms) {
            let score = 0

            if (query.includes(` ${term} `)) {
                // Exact phrase match wins; longer phrases are more specific
                score = 100 + term.length
            } else if (!term.includes(" ") && term.length >= 4) {
                // Single typo or plural ("doodth", "eggs") on a long enough word
                for (const word of words) {
                    if (word.length < 4) continue
                    const distance = levenshtein(word, term)
                    const allowed = term.length >= 7 ? 2 : 1
                    if (distance <= allowed) score = Math.max(score, 50 + term.length - distance * 5)
                }
            }

            if (score > bestScore) {
                bestScore = score
                best = product
            }
        }
    }

    return best
}

const clampQuantity = (quantity) => Math.min(MAX_QUANTITY, Math.max(1, quantity))

// Converts what was asked for into a number of product units:
// "anday 12" -> 1 x "12 pcs", "atta 20 kg" -> 2 x "10 kg", "3 coke" -> 3 x "1.5 litre"
const toQuantity = ({ amount, kind, factor, isCount }, product) => {
    if (amount === null) return 1
    if (isCount || !product) return clampQuantity(Math.round(amount))

    const pack = unitInfo(product.unit)

    // A bare number means pieces for pieced products ("anday 12"), otherwise how many to buy ("doodh 2")
    const askedKind = kind || (pack.kind === "piece" ? "piece" : null)
    if (askedKind !== pack.kind) return clampQuantity(Math.round(amount))

    return clampQuantity(Math.ceil((amount * factor) / pack.size - 1e-9))
}

// Main entry: message text + store products -> [{ from, text, quantity, product }]
const parseList = (message, products) => {
    return splitMessage(message).map(({ from, text }) => {
        const words = normalize(text).split(" ").filter(Boolean)
        const product = matchProduct(productWords(words), products)
        const quantity = toQuantity(readAmount(words), product)

        return { from, text: text.slice(0, 80), quantity, product }
    })
}

module.exports = { parseList, splitMessage, matchProduct, unitInfo, levenshtein }
