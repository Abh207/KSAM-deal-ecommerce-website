/**
 * KSAM Deal - Demo Multi-Platform Deals Dataset
 * Fallback dataset matching the Supabase products + product_offers schema.
 * Seeded with 12 real Indian e-commerce products with 2-3 platform offers each.
 */

export const demoDeals = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    uid: "audio_sony_wh1000xm5",
    title: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
    name: "Sony WH-1000XM5 ANC Headphones",
    brand: "Sony",
    category: "Audio",
    description: "Industry-leading noise cancellation with two processors and 8 microphones. Magnificent sound engineered with precision and ultra-clear hands-free calling with 4 beamforming microphones.",
    key_features: [
      "Industry-leading noise cancellation with Auto NC Optimizer",
      "Up to 30 hours battery life with quick charging (3 min for 3 hours)",
      "Crystal-clear hands-free calling with 4 beamforming microphones",
      "Multipoint connection allows switching between two devices seamlessly",
      "Touch sensor controls to pause, play, skip tracks and adjust volume"
    ],
    specs: {
      "Brand": "Sony",
      "Category": "Audio",
      "Model / SKU": "WH1000XM5/B",
      "Connectivity": "Bluetooth 5.2 / 3.5mm",
      "Battery / Playback": "30 Hours ANC On",
      "Warranty": "1-Year Official Sony India Warranty",
      "Availability": "In Stock"
    },
    images: ["headphone.png"],
    image_url: "headphone.png",
    rating: 4.8,
    review_count: 12450,
    stock: 42,
    is_active: true,
    product_offers: [
      {
        id: "off-101",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 26990,
        mrp: 34990,
        discount_percent: 23,
        affiliate_url: "https://www.amazon.in/dp/B09XS7JWHH?tag=ksamdeal-21",
        in_stock: true
      },
      {
        id: "off-102",
        platform: "Croma",
        platform_slug: "croma",
        price: 28990,
        mrp: 34990,
        discount_percent: 17,
        affiliate_url: "https://www.croma.com/sony-wh-1000xm5-bluetooth-headphone/p/257123",
        in_stock: true
      },
      {
        id: "off-103",
        platform: "Flipkart",
        platform_slug: "flipkart",
        price: 27499,
        mrp: 34990,
        discount_percent: 21,
        affiliate_url: "https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itm123456789",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    uid: "laptops_macbook_air_m2",
    title: "Apple 2022 MacBook Air Laptop with M2 chip (13.6-inch Liquid Retina, 8GB RAM, 256GB SSD)",
    name: "Apple MacBook Air M2 (13.6-inch)",
    brand: "Apple",
    category: "Laptops",
    description: "Strikingly thin design with blazing-fast next-generation M2 chip. Up to 18 hours of battery life and a stunning 13.6-inch Liquid Retina display with over 500 nits of brightness.",
    key_features: [
      "M2 chip with 8-core CPU and up to 10-core GPU",
      "Up to 18 hours battery life to go all day and into the night",
      "13.6-inch Liquid Retina display with 500 nits brightness and P3 wide color",
      "1080p FaceTime HD camera, three-mic array and four-speaker sound system",
      "MagSafe 3 charging port, two Thunderbolt ports and headphone jack"
    ],
    specs: {
      "Brand": "Apple",
      "Category": "Laptops",
      "Model / SKU": "MLXW3HN/A",
      "Processor": "Apple M2 8-Core",
      "RAM / Storage": "8GB Unified / 256GB SSD",
      "Warranty": "1-Year Apple Limited Warranty",
      "Availability": "In Stock"
    },
    images: ["laptop-image.png"],
    image_url: "laptop-image.png",
    rating: 4.9,
    review_count: 8740,
    stock: 15,
    is_active: true,
    product_offers: [
      {
        id: "off-201",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 84990,
        mrp: 114900,
        discount_percent: 26,
        affiliate_url: "https://www.amazon.in/dp/B0B3C4LN8V?tag=ksamdeal-21",
        in_stock: true
      },
      {
        id: "off-202",
        platform: "Flipkart",
        platform_slug: "flipkart",
        price: 87990,
        mrp: 114900,
        discount_percent: 23,
        affiliate_url: "https://www.flipkart.com/apple-macbook-air-m2/p/itm123macbook",
        in_stock: true
      },
      {
        id: "off-203",
        platform: "Croma",
        platform_slug: "croma",
        price: 89900,
        mrp: 114900,
        discount_percent: 22,
        affiliate_url: "https://www.croma.com/apple-macbook-air-m2/p/256789",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    uid: "mobiles_samsung_s24_ultra",
    title: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)",
    name: "Samsung Galaxy S24 Ultra 5G",
    brand: "Samsung",
    category: "Mobiles",
    description: "Meet Galaxy S24 Ultra with Galaxy AI. Titanium shield exterior, 200MP camera with Quad Telephoto system, and the brightest flat Dynamic AMOLED 2X display with anti-reflective Corning Gorilla Armor.",
    key_features: [
      "Galaxy AI search like never before with Circle to Search",
      "Titanium frame durability with IP68 water and dust resistance",
      "200MP wide camera with 5x optical zoom and 100x digital zoom",
      "Snapdragon 8 Gen 3 for Galaxy processor with ray tracing",
      "5000 mAh battery with 45W super fast charging support"
    ],
    specs: {
      "Brand": "Samsung",
      "Category": "Mobiles",
      "Model / SKU": "SM-S928B",
      "Display": "6.8 inch QHD+ Dynamic AMOLED 2X 120Hz",
      "RAM / Storage": "12GB / 256GB",
      "Warranty": "1-Year Manufacturer Warranty",
      "Availability": "In Stock"
    },
    images: ["smartPhone.png"],
    image_url: "smartPhone.png",
    rating: 4.7,
    review_count: 6120,
    stock: 28,
    is_active: true,
    product_offers: [
      {
        id: "off-301",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 119999,
        mrp: 134999,
        discount_percent: 11,
        affiliate_url: "https://www.amazon.in/dp/B0CS5X8SKF?tag=ksamdeal-21",
        in_stock: true
      },
      {
        id: "off-302",
        platform: "Flipkart",
        platform_slug: "flipkart",
        price: 121999,
        mrp: 134999,
        discount_percent: 10,
        affiliate_url: "https://www.flipkart.com/samsung-galaxy-s24-ultra/p/itmgalaxys24",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000004",
    uid: "shoes_nike_air_max_270",
    title: "Nike Air Max 270 Men Casual Running and Lifestyle Sneakers",
    name: "Nike Air Max 270 Sneakers",
    brand: "Nike",
    category: "Shoes",
    description: "Boasting Nike's biggest heel Air unit yet, the Nike Air Max 270 delivers unmatched visible cushioning under every step. Breathable woven mesh upper with stretchy interior sleeve creates a snug, sock-like fit.",
    key_features: [
      "Max Air 270 unit delivers peerless, all-day cushioning",
      "Engineered woven mesh upper offers lightweight breathability",
      "Stretchy inner sleeve creates a personalized glove-like fit",
      "Solid rubber outsole provides durable traction and stability",
      "Dual-density foam midsole provides soft, responsive energy return"
    ],
    specs: {
      "Brand": "Nike",
      "Category": "Shoes",
      "Model / SKU": "AH8050-002",
      "Upper Material": "Breathable Engineered Mesh",
      "Sole": "Max Air 270 Unit + Rubber",
      "Warranty": "Manufacturer Brand Warranty",
      "Availability": "In Stock"
    },
    images: ["products/shoes/shoe1.png"],
    image_url: "products/shoes/shoe1.png",
    rating: 4.6,
    review_count: 3410,
    stock: 19,
    is_active: true,
    product_offers: [
      {
        id: "off-401",
        platform: "Myntra",
        platform_slug: "myntra",
        price: 8995,
        mrp: 14995,
        discount_percent: 40,
        affiliate_url: "https://www.myntra.com/shoes/nike/nike-air-max-270/1234567/buy",
        in_stock: true
      },
      {
        id: "off-402",
        platform: "Ajio",
        platform_slug: "ajio",
        price: 9495,
        mrp: 14995,
        discount_percent: 37,
        affiliate_url: "https://www.ajio.com/nike-air-max-270-sneakers/p/461234567",
        in_stock: true
      },
      {
        id: "off-403",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 9999,
        mrp: 14995,
        discount_percent: 33,
        affiliate_url: "https://www.amazon.in/dp/B07DNQ6Q84?tag=ksamdeal-21",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000005",
    uid: "fashion_levis_denim_jacket",
    title: "Levis Men Solid Original Cotton Trucker Denim Jacket",
    name: "Levis Classic Trucker Jacket",
    brand: "Levis",
    category: "Fashion",
    description: "The quintessential denim jacket that has defined casual style for generations. Tailored with heavyweight 100% cotton denim, point collar, button-flap chest pockets and side waist adjusters.",
    key_features: [
      "100% pure premium heavyweight cotton denim",
      "Original straight fit through the body and sleeves",
      "Shank button front closure with embossed metal hardware",
      "Chest flap pockets with button closures and side welt pockets",
      "Pre-washed for comfortable softness from day one"
    ],
    specs: {
      "Brand": "Levis",
      "Category": "Fashion",
      "Model / SKU": "72334-0136",
      "Material": "100% Heavyweight Cotton",
      "Care": "Machine Wash Cold Inside Out",
      "Warranty": "Manufacturer Brand Warranty",
      "Availability": "In Stock"
    },
    images: ["products/clothes/cloth1.png"],
    image_url: "products/clothes/cloth1.png",
    rating: 4.5,
    review_count: 1890,
    stock: 36,
    is_active: true,
    product_offers: [
      {
        id: "off-501",
        platform: "Flipkart",
        platform_slug: "flipkart",
        price: 2799,
        mrp: 5999,
        discount_percent: 53,
        affiliate_url: "https://www.flipkart.com/levis-trucker-denim-jacket/p/itmlevisdenim",
        in_stock: true
      },
      {
        id: "off-502",
        platform: "Myntra",
        platform_slug: "myntra",
        price: 2999,
        mrp: 5999,
        discount_percent: 50,
        affiliate_url: "https://www.myntra.com/jackets/levis/levis-mens-trucker-jacket/2345678/buy",
        in_stock: true
      },
      {
        id: "off-503",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 3249,
        mrp: 5999,
        discount_percent: 46,
        affiliate_url: "https://www.amazon.in/dp/B07FY7L2M9?tag=ksamdeal-21",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000006",
    uid: "audio_boat_airdopes_141_anc",
    title: "boAt Airdopes 141 ANC with 32dB Active Noise Cancellation and 42H Playtime",
    name: "boAt Airdopes 141 ANC",
    brand: "boAt",
    category: "Audio",
    description: "Escape the noise with up to 32dB Active Noise Cancellation. Featuring 42 hours of total playtime, BEAST Mode with 50ms low latency for gaming, and quad mics with ENx technology for pristine voice clarity.",
    key_features: [
      "Up to 32dB Active Noise Cancellation with Ambient Mode",
      "42 Hours total playtime with ASAP Charge (10 min = 150 min)",
      "BEAST Mode ultra-low 50ms latency for real-time mobile gaming",
      "Quad mics with ENx technology for crystal-clear calling",
      "IPX5 water and sweat resistance for heavy workouts"
    ],
    specs: {
      "Brand": "boAt",
      "Category": "Audio",
      "Model / SKU": "Airdopes 141 ANC",
      "Drivers": "10mm Dynamic Drivers",
      "Battery / Playback": "42 Hours Total (ASAP Charge)",
      "Warranty": "1-Year boAt India Warranty",
      "Availability": "In Stock"
    },
    images: ["speakers.png"],
    image_url: "speakers.png",
    rating: 4.4,
    review_count: 28900,
    stock: 75,
    is_active: true,
    product_offers: [
      {
        id: "off-601",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 1499,
        mrp: 5990,
        discount_percent: 75,
        affiliate_url: "https://www.amazon.in/dp/B0C7L7Y7W5?tag=ksamdeal-21",
        in_stock: true
      },
      {
        id: "off-602",
        platform: "Flipkart",
        platform_slug: "flipkart",
        price: 1599,
        mrp: 5990,
        discount_percent: 73,
        affiliate_url: "https://www.flipkart.com/boat-airdopes-141-anc/p/itmboat141",
        in_stock: true
      },
      {
        id: "off-603",
        platform: "Croma",
        platform_slug: "croma",
        price: 1699,
        mrp: 5990,
        discount_percent: 72,
        affiliate_url: "https://www.croma.com/boat-airdopes-141-anc/p/269874",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000007",
    uid: "home_green_soul_gaming_chair",
    title: "Green Soul Monster Ultimate Series Ergonomic Gaming and Office Chair",
    name: "Green Soul Monster Gaming Chair",
    brand: "Green Soul",
    category: "Home",
    description: "Engineered for ultimate posture and lumbar alignment during marathon work and gaming sessions. Premium breathable spandex and PU leather upholstery with high-density cold-cured foam cushioning.",
    key_features: [
      "Heavy-duty aerospace-grade metal frame with Class 4 gas lift",
      "Multi-functional tilt lock mechanism reclining up to 180 degrees",
      "4D adjustable armrests for height angle and forward-backward motion",
      "Memory foam neck pillow and magnetic magnetic lumbar cushion",
      "Industrial nylon twin caster wheels safe for hardwood floors"
    ],
    specs: {
      "Brand": "Green Soul",
      "Category": "Home",
      "Model / SKU": "GS-734U",
      "Material": "Spandex + PU Leather / Steel Frame",
      "Weight Capacity": "120 kg Max Load",
      "Warranty": "3-Year Manufacturer Warranty",
      "Availability": "In Stock"
    },
    images: ["3dChair.png"],
    image_url: "3dChair.png",
    rating: 4.7,
    review_count: 4210,
    stock: 14,
    is_active: true,
    product_offers: [
      {
        id: "off-701",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 16990,
        mrp: 29990,
        discount_percent: 43,
        affiliate_url: "https://www.amazon.in/dp/B08HRZ8Q56?tag=ksamdeal-21",
        in_stock: true
      },
      {
        id: "off-702",
        platform: "Flipkart",
        platform_slug: "flipkart",
        price: 17499,
        mrp: 29990,
        discount_percent: 42,
        affiliate_url: "https://www.flipkart.com/green-soul-monster-chair/p/itmchairgreensoul",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000008",
    uid: "gaming_sony_playstation_5_slim",
    title: "Sony PlayStation 5 Console (Slim) with 1TB Custom SSD and DualSense Controller",
    name: "Sony PlayStation 5 Slim Console",
    brand: "Sony",
    category: "Gaming",
    description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers and 3D Audio, and an all-new generation of incredible PlayStation games.",
    key_features: [
      "Slim modern form factor with 1TB ultra-fast internal NVMe SSD",
      "Haptic feedback and dynamic adaptive triggers via DualSense controller",
      "Ray tracing acceleration supporting up to 120 fps at 4K resolution",
      "Tempest 3D AudioTech soundscapes for pinpoint spatial awareness",
      "Backwards compatibility with over 4000 PlayStation 4 titles"
    ],
    specs: {
      "Brand": "Sony",
      "Category": "Gaming",
      "Model / SKU": "CFI-2000",
      "Storage": "1TB Custom High-Speed SSD",
      "Video Output": "4K 120Hz / 8K Support",
      "Warranty": "1-Year Official Sony India Warranty",
      "Availability": "In Stock"
    },
    images: ["mouse.png"],
    image_url: "mouse.png",
    rating: 4.9,
    review_count: 9840,
    stock: 11,
    is_active: true,
    product_offers: [
      {
        id: "off-801",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 49990,
        mrp: 54990,
        discount_percent: 9,
        affiliate_url: "https://www.amazon.in/dp/B0CX2995D7?tag=ksamdeal-21",
        in_stock: true
      },
      {
        id: "off-802",
        platform: "Flipkart",
        platform_slug: "flipkart",
        price: 50990,
        mrp: 54990,
        discount_percent: 7,
        affiliate_url: "https://www.flipkart.com/sony-playstation-5-slim/p/itmps5slim",
        in_stock: true
      },
      {
        id: "off-803",
        platform: "Croma",
        platform_slug: "croma",
        price: 51990,
        mrp: 54990,
        discount_percent: 5,
        affiliate_url: "https://www.croma.com/sony-playstation-5-slim/p/305891",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000009",
    uid: "watches_oneplus_watch_2",
    title: "OnePlus Watch 2 with Wear OS by Google, Dual-Engine Architecture and 100H Battery Life",
    name: "OnePlus Watch 2 Smartwatch",
    brand: "OnePlus",
    category: "Watches",
    description: "Your partner in precision. Dual-Engine Architecture powered by Snapdragon W5 and BES2700 chipsets delivers up to 100 hours of battery life with Wear OS 4. Stainless steel chassis and sapphire crystal glass.",
    key_features: [
      "Dual-Engine Architecture: Snapdragon W5 + BES2700 chipset",
      "Up to 100 hours battery life in smart mode and 12 days in power saver",
      "Wear OS by Google with Google Maps, Wallet and Assistant on wrist",
      "Dual-frequency L1+L5 GPS for precise outdoor running and cycling tracks",
      "Military-grade 5ATM + IP68 water resistance with MIL-STD-810H durability"
    ],
    specs: {
      "Brand": "OnePlus",
      "Category": "Watches",
      "Model / SKU": "OPW241",
      "Dial Glass": "Sapphire Crystal Glass",
      "Water Resistance": "5ATM + IP68 Rated",
      "Warranty": "1-Year Manufacturer Warranty",
      "Availability": "In Stock"
    },
    images: ["watch.png"],
    image_url: "watch.png",
    rating: 4.6,
    review_count: 2140,
    stock: 22,
    is_active: true,
    product_offers: [
      {
        id: "off-901",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 19999,
        mrp: 27999,
        discount_percent: 29,
        affiliate_url: "https://www.amazon.in/dp/B0CS5Q3XZM?tag=ksamdeal-21",
        in_stock: true
      },
      {
        id: "off-902",
        platform: "Flipkart",
        platform_slug: "flipkart",
        price: 20999,
        mrp: 27999,
        discount_percent: 25,
        affiliate_url: "https://www.flipkart.com/oneplus-watch-2/p/itmonepluswatch2",
        in_stock: true
      },
      {
        id: "off-903",
        platform: "Croma",
        platform_slug: "croma",
        price: 21499,
        mrp: 27999,
        discount_percent: 23,
        affiliate_url: "https://www.croma.com/oneplus-watch-2-smartwatch/p/305124",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000010",
    uid: "electronics_lg_55_oled_c3",
    title: "LG 55 inch 4K Ultra HD Smart OLED TV with Dolby Vision and webOS 23",
    name: "LG 55-inch 4K OLED TV (C3)",
    brand: "LG",
    category: "Electronics",
    description: "Infinite contrast with self-lit OLED pixels delivering deep pure blacks. Powered by the α9 AI Processor Gen6 with 4K Super Upscaling, Dolby Vision Atmos, and 0.1ms response time with Nvidia G-Sync.",
    key_features: [
      "Self-lit OLED pixels produce infinite contrast and 100% color fidelity",
      "α9 AI Processor Gen6 for intelligent picture tone mapping and audio",
      "Dolby Vision IQ and Dolby Atmos cinema sound from integrated speakers",
      "0.1ms response time with 4x HDMI 2.1 ports, G-Sync and FreeSync Premium",
      "webOS 23 with personalized user profiles and hands-free voice control"
    ],
    specs: {
      "Brand": "LG",
      "Category": "Electronics",
      "Model / SKU": "OLED55C3PSA",
      "Resolution": "4K Ultra HD (3840 x 2160) 120Hz",
      "Audio": "40W 2.2 Channel Dolby Atmos",
      "Warranty": "3-Year LG India Comprehensive Warranty",
      "Availability": "In Stock"
    },
    images: ["tv.png"],
    image_url: "tv.png",
    rating: 4.8,
    review_count: 1540,
    stock: 8,
    is_active: true,
    product_offers: [
      {
        id: "off-1001",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 114990,
        mrp: 169990,
        discount_percent: 32,
        affiliate_url: "https://www.amazon.in/dp/B0C39M5B6G?tag=ksamdeal-21",
        in_stock: true
      },
      {
        id: "off-1002",
        platform: "Croma",
        platform_slug: "croma",
        price: 119990,
        mrp: 169990,
        discount_percent: 29,
        affiliate_url: "https://www.croma.com/lg-c3-55-inch-oled-4k-tv/p/271290",
        in_stock: true
      },
      {
        id: "off-1003",
        platform: "Flipkart",
        platform_slug: "flipkart",
        price: 122490,
        mrp: 169990,
        discount_percent: 28,
        affiliate_url: "https://www.flipkart.com/lg-c3-55-inch-oled-4k-tv/p/itmlgc355",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000011",
    uid: "home_dyson_v12_detect_slim",
    title: "Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner with Laser Reveal",
    name: "Dyson V12 Detect Slim Vacuum",
    brand: "Dyson",
    category: "Home",
    description: "Dyson's lightest intelligent cordless vacuum with laser illumination that reveals invisible dust on hard floors. Piezo sensor continuously sizes and counts dust particles, automatically increasing suction when needed.",
    key_features: [
      "Fluffy Optic cleaner head reveals twice the amount of invisible dust",
      "Acoustic piezo sensor measures and counts microscopic dust particles",
      "Up to 60 minutes of run time with click-in interchangeable battery",
      "Motorized Hair screw tool de-tangles hair into the bin automatically",
      "Single-button power control for comfortable, continuous cleaning"
    ],
    specs: {
      "Brand": "Dyson",
      "Category": "Home",
      "Model / SKU": "V12 Detect Slim",
      "Weight": "2.2 kg Lightweight",
      "Suction Power": "150 AW Strong Suction",
      "Warranty": "2-Year Dyson India Warranty",
      "Availability": "In Stock"
    },
    images: ["Heater.png"],
    image_url: "Heater.png",
    rating: 4.7,
    review_count: 3120,
    stock: 17,
    is_active: true,
    product_offers: [
      {
        id: "off-1101",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 44900,
        mrp: 55900,
        discount_percent: 20,
        affiliate_url: "https://www.amazon.in/dp/B09SPZ7L2R?tag=ksamdeal-21",
        in_stock: true
      },
      {
        id: "off-1102",
        platform: "Croma",
        platform_slug: "croma",
        price: 46900,
        mrp: 55900,
        discount_percent: 16,
        affiliate_url: "https://www.croma.com/dyson-v12-detect-slim-cordless-vacuum/p/248912",
        in_stock: true
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000012",
    uid: "beauty_forest_essentials_soundarya",
    title: "Forest Essentials Soundarya Radiance Cream with 24K Gold and SPF 25",
    name: "Forest Essentials Soundarya Cream",
    brand: "Forest Essentials",
    category: "Beauty",
    description: "An exceptionally rich day cream infused with pure 24 Karat Gold bhasma, saffron and cold-pressed organic oils. Nourishes the skin with natural SPF 25 protection and restores youthful elasticity and luminous glow.",
    key_features: [
      "Infused with pure 24K Gold bhasma for cellular collagen stimulation",
      "Contains cold-pressed organic almond and sesame seed oils",
      "Natural SPF 25 protects against harmful UV photo-aging",
      "Clinically proven to improve skin elasticity, firmness and radiance",
      "100% natural Ayurvedic recipe free from parabens and mineral oils"
    ],
    specs: {
      "Brand": "Forest Essentials",
      "Category": "Beauty",
      "Model / SKU": "FE-SND-50G",
      "Volume": "50g Glass Jar",
      "Skin Type": "All Skin Types / Anti-Aging",
      "Warranty": "100% Authentic KSAM Certified",
      "Availability": "In Stock"
    },
    images: ["products/clothes/cloth3.png"],
    image_url: "products/clothes/cloth3.png",
    rating: 4.8,
    review_count: 4820,
    stock: 31,
    is_active: true,
    product_offers: [
      {
        id: "off-1201",
        platform: "Myntra",
        platform_slug: "myntra",
        price: 3995,
        mrp: 5995,
        discount_percent: 33,
        affiliate_url: "https://www.myntra.com/face-cream/forest-essentials/forest-essentials-soundarya-radiance-cream/3456789/buy",
        in_stock: true
      },
      {
        id: "off-1202",
        platform: "Ajio",
        platform_slug: "ajio",
        price: 4295,
        mrp: 5995,
        discount_percent: 28,
        affiliate_url: "https://www.ajio.com/forest-essentials-soundarya-cream/p/462345678",
        in_stock: true
      },
      {
        id: "off-1203",
        platform: "Amazon",
        platform_slug: "amazon",
        price: 4450,
        mrp: 5995,
        discount_percent: 26,
        affiliate_url: "https://www.amazon.in/dp/B00KAE6VFE?tag=ksamdeal-21",
        in_stock: true
      }
    ]
  }
];

// Alias for backwards compatibility
export const deals = demoDeals;
