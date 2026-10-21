// Starter catalogue, prices in rupees

const categories = [
    { name: "Dairy & Eggs", icon: "🥛", description: "Milk, yogurt, butter, cheese and eggs", sortOrder: 1 },
    { name: "Fruits", icon: "🍎", description: "Fresh seasonal fruit", sortOrder: 2 },
    { name: "Vegetables", icon: "🥕", description: "Sabzi, fresh every morning", sortOrder: 3 },
    { name: "Atta, Rice & Daal", icon: "🌾", description: "Flour, rice and lentils", sortOrder: 4 },
    { name: "Oil & Ghee", icon: "🫒", description: "Cooking oil, banaspati and desi ghee", sortOrder: 5 },
    { name: "Masala & Spices", icon: "🌶️", description: "Salt, mirch, haldi and ready masalay", sortOrder: 6 },
    { name: "Tea & Drinks", icon: "☕", description: "Chai patti, juices and soft drinks", sortOrder: 7 },
    { name: "Bakery & Breakfast", icon: "🍞", description: "Bread, rusk, jam and cereal", sortOrder: 8 },
    { name: "Snacks", icon: "🍪", description: "Biscuits, chips and nimko", sortOrder: 9 },
    { name: "Cleaning & Household", icon: "🧼", description: "Soap, surf and dishwash", sortOrder: 10 },
]

// [name, category, price, unit, aliases, stock]
const products = [
    ["Fresh Milk", "Dairy & Eggs", 230, "1 litre", ["doodh", "dudh", "milk", "doodh ka packet"], 120],
    ["Eggs", "Dairy & Eggs", 360, "12 pcs", ["anday", "anda", "ande", "andey", "egg", "eggs", "anday darjan"], 80],
    ["Plain Yogurt", "Dairy & Eggs", 260, "1 kg", ["dahi", "dahee", "yogurt", "curd"], 60],
    ["Butter", "Dairy & Eggs", 300, "200 g", ["makhan", "makkhan", "butter"], 40],
    ["Cheddar Cheese Slices", "Dairy & Eggs", 520, "200 g", ["cheese", "paneer slice", "cheese slice"], 30],
    ["Cream", "Dairy & Eggs", 210, "200 ml", ["malai", "cream"], 35],

    ["Bananas", "Fruits", 220, "12 pcs", ["kela", "kelay", "kele", "banana"], 50],
    ["Apples", "Fruits", 380, "1 kg", ["saib", "seb", "apple", "apples"], 45],
    ["Oranges (Kinnow)", "Fruits", 300, "12 pcs", ["kinnow", "kinno", "malta", "orange", "santra"], 40],
    ["Mangoes", "Fruits", 400, "1 kg", ["aam", "mango", "mangoes"], 30],
    ["Guava", "Fruits", 180, "1 kg", ["amrood", "amrud", "guava"], 25],
    ["Lemons", "Fruits", 80, "250 g", ["nimbu", "lemon", "lemons", "leemu"], 60],

    ["Potatoes", "Vegetables", 120, "1 kg", ["aloo", "alu", "potato", "potatoes"], 150],
    ["Onions", "Vegetables", 140, "1 kg", ["pyaz", "piaz", "pyaaz", "onion", "onions"], 150],
    ["Tomatoes", "Vegetables", 160, "1 kg", ["tamatar", "timatar", "tomato", "tomatoes"], 120],
    ["Green Chillies", "Vegetables", 60, "250 g", ["hari mirch", "hari mirchein", "green chilli", "mirchi"], 80],
    ["Garlic", "Vegetables", 150, "250 g", ["lehsan", "lehsun", "garlic"], 70],
    ["Ginger", "Vegetables", 140, "250 g", ["adrak", "ginger"], 70],
    ["Coriander", "Vegetables", 30, "1 bunch", ["dhania", "hara dhania", "dhaniya", "coriander"], 90],
    ["Mint", "Vegetables", 30, "1 bunch", ["podina", "pudina", "mint"], 90],
    ["Spinach", "Vegetables", 80, "1 kg", ["palak", "spinach", "saag"], 40],
    ["Cucumber", "Vegetables", 100, "1 kg", ["kheera", "khira", "cucumber"], 50],

    ["Chakki Atta", "Atta, Rice & Daal", 1350, "10 kg", ["atta", "aata", "flour", "chakki atta"], 60],
    ["Basmati Rice", "Atta, Rice & Daal", 1600, "5 kg", ["chawal", "chaawal", "rice", "basmati"], 45],
    ["Sugar", "Atta, Rice & Daal", 165, "1 kg", ["cheeni", "chini", "sugar", "shakar"], 200],
    ["Daal Masoor", "Atta, Rice & Daal", 330, "1 kg", ["masoor", "daal masoor", "dal masoor", "masoor ki daal"], 70],
    ["Daal Chana", "Atta, Rice & Daal", 300, "1 kg", ["chana daal", "daal chana", "dal chana"], 70],
    ["Daal Moong", "Atta, Rice & Daal", 340, "1 kg", ["moong", "daal moong", "dal moong", "moong ki daal"], 70],
    ["White Chickpeas", "Atta, Rice & Daal", 380, "1 kg", ["kabuli chana", "safaid chana", "chanay", "chickpeas", "cholay"], 50],

    ["Cooking Oil", "Oil & Ghee", 2700, "5 litre", ["oil", "tail", "tel", "cooking oil"], 40],
    ["Banaspati Ghee", "Oil & Ghee", 560, "1 kg", ["ghee", "banaspati", "ghee ka dabba"], 50],
    ["Desi Ghee", "Oil & Ghee", 2400, "1 kg", ["desi ghee", "khalis ghee"], 15],

    ["Salt", "Masala & Spices", 60, "800 g", ["namak", "salt"], 120],
    ["Red Chilli Powder", "Masala & Spices", 280, "200 g", ["lal mirch", "laal mirch", "red chilli", "mirch powder"], 80],
    ["Turmeric Powder", "Masala & Spices", 190, "200 g", ["haldi", "haldee", "turmeric"], 80],
    ["Garam Masala", "Masala & Spices", 240, "100 g", ["garam masala"], 60],
    ["Biryani Masala", "Masala & Spices", 140, "1 packet", ["biryani masala", "biryani ka masala"], 90],
    ["Cumin Seeds", "Masala & Spices", 260, "100 g", ["zeera", "zira", "jeera", "cumin"], 60],

    ["Tea Leaves", "Tea & Drinks", 1100, "900 g", ["chai", "chae", "chay", "chai patti", "patti", "tea"], 60],
    ["Green Tea", "Tea & Drinks", 330, "30 bags", ["green tea", "sabz chai", "kehwa"], 40],
    ["Mango Juice", "Tea & Drinks", 330, "1 litre", ["juice", "mango juice", "jus"], 50],
    ["Cola", "Tea & Drinks", 220, "1.5 litre", ["cola", "coke", "pepsi", "cold drink", "botal"], 70],
    ["Mineral Water", "Tea & Drinks", 120, "1.5 litre", ["paani", "pani", "water", "mineral water"], 150],

    ["Bread", "Bakery & Breakfast", 180, "1 loaf", ["double roti", "bread", "dabal roti", "dubble roti"], 60],
    ["Rusk", "Bakery & Breakfast", 260, "1 packet", ["rusk", "russ", "rus"], 50],
    ["Mixed Fruit Jam", "Bakery & Breakfast", 480, "440 g", ["jam", "jaam"], 30],
    ["Corn Flakes", "Bakery & Breakfast", 750, "500 g", ["corn flakes", "cornflakes", "cereal"], 25],
    ["Honey", "Bakery & Breakfast", 900, "500 g", ["shehad", "shahad", "honey"], 20],

    ["Tea Biscuits", "Snacks", 120, "1 family pack", ["biscuit", "biscuits", "biskut", "chai biscuit"], 90],
    ["Potato Chips", "Snacks", 100, "1 packet", ["chips", "lays", "crisps"], 90],
    ["Nimko Mix", "Snacks", 280, "400 g", ["nimko", "namkeen", "nimco"], 40],
    ["Instant Noodles", "Snacks", 70, "1 packet", ["noodles", "maggi", "noodle"], 120],

    ["Washing Powder", "Cleaning & Household", 650, "1 kg", ["surf", "sarf", "washing powder", "detergent"], 50],
    ["Dishwash Bar", "Cleaning & Household", 120, "1 bar", ["dishwash", "bartan sabun", "bartan wala sabun", "vim"], 80],
    ["Bath Soap", "Cleaning & Household", 140, "1 bar", ["sabun", "nahane ka sabun", "soap"], 100],
    ["Toilet Cleaner", "Cleaning & Household", 420, "500 ml", ["harpic", "toilet cleaner"], 30],
    ["Tissue Box", "Cleaning & Household", 220, "1 box", ["tissue", "tishu", "tissues"], 60],
]

const slots = [
    { label: "Morning (9 am - 12 pm)", startTime: "09:00", endTime: "12:00", capacity: 20 },
    { label: "Afternoon (12 pm - 3 pm)", startTime: "12:00", endTime: "15:00", capacity: 20 },
    { label: "Evening (5 pm - 8 pm)", startTime: "17:00", endTime: "20:00", capacity: 25 },
    { label: "Night (8 pm - 10 pm)", startTime: "20:00", endTime: "22:00", capacity: 15 },
]

module.exports = { categories, products, slots }
