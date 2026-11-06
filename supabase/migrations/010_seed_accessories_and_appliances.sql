-- =============================================================================
-- Migration 010: Seed 34 Products for Accessories & Lifestyle and Home Appliances
-- =============================================================================

insert into public.products (
  id,
  name,
  title,
  brand,
  category,
  description,
  image_url,
  price,
  old_price,
  discount,
  discount_percent,
  rating,
  reviews,
  availability,
  is_active,
  is_featured
) values
-- Accessories & Lifestyle (901 - 917)
('90000000-0000-0000-0000-000000000901', 'Full-Grain Leather Cardholder', 'Full-Grain Leather Cardholder', 'Saddle & Stitch', 'Accessories & Lifestyle', 'Slim minimalist RFID-blocking cardholder wallet handcrafted with genuine vegetable-tanned full-grain leather.', 'images/products/lifestyle/leather-cardholder.webp', 999, 1899, 47, 47, 4.8, 89, 'In Stock', true, true),
('90000000-0000-0000-0000-000000000902', 'Matte Black UV400 Polarized Sunglasses', 'Matte Black UV400 Polarized Sunglasses', 'Solaris', 'Accessories & Lifestyle', 'Ultralight aerospace TR90 frame sunglasses with TAC polarized anti-glare scratch-resistant lenses and 100% UV400 protection.', 'images/products/lifestyle/polarized-sunglasses.webp', 1499, 2999, 50, 50, 4.9, 156, 'In Stock', true, true),
('90000000-0000-0000-0000-000000000903', 'Heavy-Duty Waxed Canvas Weekender Duffle', 'Heavy-Duty Waxed Canvas Weekender Duffle', 'RoamCraft', 'Accessories & Lifestyle', 'Water-resistant 16oz waxed canvas overnight duffle bag with brass hardware, shoe compartment, and padded shoulder strap.', 'images/products/lifestyle/travel-duffle.webp', 3299, 5499, 40, 40, 4.7, 64, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000904', 'Double-Wall Vacuum Insulated Tumbler 750ml', 'Double-Wall Vacuum Insulated Tumbler 750ml', 'HydroShield', 'Accessories & Lifestyle', 'Food-grade 18/8 stainless steel thermal travel mug keeps liquids cold for 24 hours or piping hot for 12 hours with leakproof lid.', 'images/products/lifestyle/insulated-tumbler.webp', 799, 1499, 47, 47, 4.8, 230, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000905', '3-in-1 Fast Wireless Magnetic Charging Stand', '3-in-1 Fast Wireless Magnetic Charging Stand', 'VoltAir', 'Accessories & Lifestyle', 'Foldable Qi-certified 15W wireless charging station designed to rapidly power smartphone, smartwatch, and wireless earbuds simultaneously.', 'images/products/lifestyle/wireless-charger.webp', 1999, 3499, 43, 43, 4.7, 112, 'In Stock', true, true),
('90000000-0000-0000-0000-000000000906', 'Vegan Leather Waterproof Dual-Sided Desk Mat', 'Vegan Leather Waterproof Dual-Sided Desk Mat', 'NovaSpace', 'Accessories & Lifestyle', 'Extra-large 90x45cm desk pad made with premium PU leather, smooth mouse gliding surface, waterproof coating, and non-slip backing.', 'images/products/lifestyle/desk-mat.webp', 899, 1599, 44, 44, 4.9, 310, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000907', 'Waterproof Canvas Messenger Bag', 'Waterproof Canvas Messenger Bag', 'UrbanForge', 'Accessories & Lifestyle', 'Durable water-repellent canvas commuter messenger bag featuring padded 15.6-inch laptop compartment and magnetic quick-snap closures.', 'images/products/lifestyle/messenger-bag.webp', 2499, 4299, 42, 42, 4.8, 148, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000908', 'Compact Minimalist Key Organizer', 'Compact Minimalist Key Organizer', 'KeyCraft', 'Accessories & Lifestyle', 'Pocket-friendly quiet key holder system holding up to 8 keys with anti-loosening stainless steel hardware and car fob loop.', 'images/products/lifestyle/key-organizer.webp', 599, 1199, 50, 50, 4.7, 92, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000909', 'Pro Insulated Sports Water Bottle 1L', 'Pro Insulated Sports Water Bottle 1L', 'HydroShield', 'Accessories & Lifestyle', 'Double-wall copper-plated vacuum flask with leak-proof spout lid, powder-coat finish, and integrated carrying loop.', 'images/products/lifestyle/water-bottle.webp', 1099, 1999, 45, 45, 4.9, 274, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000910', 'Ergonomic Memory Foam Travel Neck Pillow', 'Ergonomic Memory Foam Travel Neck Pillow', 'CloudRest', 'Accessories & Lifestyle', '360-degree head and chin support travel pillow crafted from high-density memory foam with breathable, machine-washable magnetic velour cover.', 'images/products/lifestyle/neck-pillow.webp', 899, 1699, 47, 47, 4.8, 163, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000911', 'Artisan Refillable Leather Journal Notebook', 'Artisan Refillable Leather Journal Notebook', 'Saddle & Stitch', 'Accessories & Lifestyle', 'Hand-stitched vintage crazy-horse leather bound notebook containing 240 pages of thick 120gsm ink-proof fountain-pen friendly paper.', 'images/products/lifestyle/leather-journal.webp', 1199, 2299, 48, 48, 4.9, 118, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000912', '14-in-1 Titanium EDC Pocket Multi-Tool', '14-in-1 Titanium EDC Pocket Multi-Tool', 'ApexGear', 'Accessories & Lifestyle', 'Everyday carry multi-functional stainless steel pliers, wire cutter, serrated blade, screwdrivers, bottle opener, and safety lock.', 'images/products/lifestyle/multi-tool.webp', 1299, 2499, 48, 48, 4.7, 205, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000913', 'Dual-Layer Tech & Cable Organizer Pouch', 'Dual-Layer Tech & Cable Organizer Pouch', 'VoltAir', 'Accessories & Lifestyle', 'Shockproof travel electronics accessories case for chargers, flash drives, earphones, cables, power banks, and memory cards.', 'images/products/lifestyle/cable-pouch.webp', 699, 1299, 46, 46, 4.8, 187, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000914', 'Ceramic-Lined Matte Insulated Travel Mug 450ml', 'Ceramic-Lined Matte Insulated Travel Mug 450ml', 'AromaCraft', 'Accessories & Lifestyle', 'Pure taste ceramic interior coating prevents metallic flavor, combined with stainless steel vacuum insulation and splash-proof slide lid.', 'images/products/lifestyle/ceramic-mug.webp', 849, 1499, 43, 43, 4.9, 142, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000915', 'Aerospace Aluminum Carabiner Keychain', 'Aerospace Aluminum Carabiner Keychain', 'ApexGear', 'Accessories & Lifestyle', 'Heavy-duty spring-loaded anodized aluminum locking carabiner with integrated bottle opener and dual keyring loop.', 'images/products/lifestyle/carabiner.webp', 399, 799, 50, 50, 4.6, 79, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000916', 'Anti-Blue Light Computer Gaming Glasses', 'Anti-Blue Light Computer Gaming Glasses', 'OptiShield', 'Accessories & Lifestyle', 'Lightweight frame blue-light filtering lenses reducing digital eye strain, headache, and glare during prolonged screen sessions.', 'images/products/lifestyle/blue-light-glasses.webp', 999, 1999, 50, 50, 4.8, 224, 'In Stock', true, false),
('90000000-0000-0000-0000-000000000917', 'Foldable Ergonomic Aluminum Laptop Stand', 'Foldable Ergonomic Aluminum Laptop Stand', 'NovaSpace', 'Accessories & Lifestyle', '6-level adjustable height portable riser made from sand-blasted aluminum alloy with anti-slip silicone cushions and hollow heat dissipation.', 'images/products/lifestyle/laptop-stand.webp', 1399, 2599, 46, 46, 4.9, 312, 'In Stock', true, true),

-- Home Appliances (801 - 817)
('80000000-0000-0000-0000-000000000801', 'Smart True HEPA Air Purifier', 'Smart True HEPA Air Purifier', 'AuraClean', 'Home Appliances', 'High-efficiency True HEPA H13 air purifier with real-time PM2.5 air quality monitoring, whisper-quiet sleep mode, and smart app control.', 'images/products/appliances/air-purifier.webp', 4999, 8999, 44, 44, 4.8, 142, 'In Stock', true, true),
('80000000-0000-0000-0000-000000000802', 'Compact 15-Bar Espresso Maker', 'Compact 15-Bar Espresso Maker', 'BaristaPro', 'Home Appliances', 'Italian 15-bar pump espresso machine with stainless steel milk frother steam wand for barista-style cappuccino and latte at home.', 'images/products/appliances/espresso-machine.webp', 7499, 12999, 42, 42, 4.9, 98, 'In Stock', true, true),
('80000000-0000-0000-0000-000000000803', 'Laser-Guided Robotic Vacuum', 'Laser-Guided Robotic Vacuum', 'RoboNav', 'Home Appliances', 'LiDAR 360-degree precision mapping robot vacuum with 3000Pa cyclone suction and electronic 2-in-1 mopping system.', 'images/products/appliances/robotic-vacuum.webp', 14999, 24999, 40, 40, 4.7, 215, 'In Stock', true, true),
('80000000-0000-0000-0000-000000000804', 'Digital Rapid-Air Convection Air Fryer 5.5L', 'Digital Rapid-Air Convection Air Fryer 5.5L', 'CrispWave', 'Home Appliances', '360-degree rapid air circulation air fryer with touch screen panel, 8 preset cooking modes, and non-stick dishwasher-safe basket.', 'images/products/appliances/air-fryer.webp', 3899, 6999, 44, 44, 4.8, 310, 'In Stock', true, true),
('80000000-0000-0000-0000-000000000805', 'Ultra-Light Handheld Cordless Vacuum', 'Ultra-Light Handheld Cordless Vacuum', 'AuraClean', 'Home Appliances', 'Cordless stick vacuum cleaner with brushless motor, 45 minutes runtime, multi-surface brush attachments, and LED headlights.', 'images/products/appliances/cordless-vacuum.webp', 5299, 8999, 41, 41, 4.6, 84, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000806', 'Electric 8-in-1 Smart Multi-Cooker', 'Electric 8-in-1 Smart Multi-Cooker', 'CookMaster', 'Home Appliances', 'Versatile all-in-one programmable pressure cooker, slow cooker, rice cooker, steamer, and yogurt maker with 12 safety protections.', 'images/products/appliances/multi-cooker.webp', 3499, 5999, 42, 42, 4.7, 175, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000807', 'Borosilicate Glass Rapid Electric Kettle 1.7L', 'Borosilicate Glass Rapid Electric Kettle 1.7L', 'AromaCraft', 'Home Appliances', 'Fast-boiling cordless electric kettle with blue LED illumination, food-grade 304 stainless steel base, and auto shut-off protection.', 'images/products/appliances/electric-kettle.webp', 1499, 2799, 46, 46, 4.8, 210, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000808', 'Stainless Steel 2-Slice Smart Toaster', 'Stainless Steel 2-Slice Smart Toaster', 'CookMaster', 'Home Appliances', 'Extra-wide slot toaster with 6 shade settings, defrost, bagel, and cancel functions, complete with removable crumb tray.', 'images/products/appliances/smart-toaster.webp', 1899, 3299, 42, 42, 4.7, 115, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000809', 'Ultrasonic Cool Mist Humidifier 4L', 'Ultrasonic Cool Mist Humidifier 4L', 'AuraClean', 'Home Appliances', 'Whisper-quiet top-fill bedroom humidifier with essential oil aroma tray, 360-degree rotating nozzle, and auto low-water shutdown.', 'images/products/appliances/ultrasonic-humidifier.webp', 2299, 3999, 43, 43, 4.8, 188, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000810', '1200W High-Speed Pro Blender & Smoothie Maker', '1200W High-Speed Pro Blender & Smoothie Maker', 'PowerPulse', 'Home Appliances', 'Commercial-grade countertop smoothie blender with 6 stainless steel extractor blades, pulse control, and BPA-free Tritan pitcher.', 'images/products/appliances/high-speed-blender.webp', 3699, 6499, 43, 43, 4.9, 245, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000811', 'Continuous Steam Handheld Garment Steamer 1500W', 'Continuous Steam Handheld Garment Steamer 1500W', 'AuraClean', 'Home Appliances', '25-second fast heat-up travel iron and clothes steamer with leak-proof design and detachable 280ml water reservoir.', 'images/products/appliances/garment-steamer.webp', 1999, 3499, 43, 43, 4.7, 134, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000812', 'Fast Countertop Bullet Ice Maker Machine', 'Fast Countertop Bullet Ice Maker Machine', 'FrostLine', 'Home Appliances', 'Produces 9 bullet ice cubes in just 6 minutes with quiet compressor cooling, 26 lbs daily capacity, and transparent viewing window.', 'images/products/appliances/ice-maker.webp', 8999, 14999, 40, 40, 4.8, 98, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000813', 'Smokeless Non-Stick Indoor Electric Grill', 'Smokeless Non-Stick Indoor Electric Grill', 'CookMaster', 'Home Appliances', 'Indoor barbecue grill with water drip tray technology for virtually smoke-free cooking, adjustable thermostat, and dishwasher-safe plate.', 'images/products/appliances/electric-grill.webp', 3999, 6999, 43, 43, 4.7, 162, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000814', 'PTC Ceramic Oscillating Space Tower Heater', 'PTC Ceramic Oscillating Space Tower Heater', 'ThermalLux', 'Home Appliances', '2000W fast ceramic heating tower with 70-degree oscillation, remote control, 12-hour timer, tip-over safety switch, and eco mode.', 'images/products/appliances/space-heater.webp', 2899, 4999, 42, 42, 4.8, 147, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000815', 'WiFi Precision Sous Vide Cooker 1100W', 'WiFi Precision Sous Vide Cooker 1100W', 'BaristaPro', 'Home Appliances', 'Immersion circulator cooker maintaining 0.1C accuracy with digital touch interface, app notifications, and quiet water circulation.', 'images/products/appliances/sous-vide.webp', 4799, 7999, 40, 40, 4.9, 88, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000816', '5-Tier Digital Food Dehydrator for Jerky & Fruit', '5-Tier Digital Food Dehydrator for Jerky & Fruit', 'CrispWave', 'Home Appliances', 'Adjustable digital temperature controller (35-70C) with 360-degree heat distribution and BPA-free stackable drying trays.', 'images/products/appliances/food-dehydrator.webp', 3299, 5799, 43, 43, 4.7, 119, 'In Stock', true, false),
('80000000-0000-0000-0000-000000000817', '4-in-1 Automatic Electric Milk Frother & Steamer', '4-in-1 Automatic Electric Milk Frother & Steamer', 'BaristaPro', 'Home Appliances', 'Creates warm dense foam, warm airy foam, hot milk, or cold foam in under 2 minutes with non-stick scratch-resistant interior coating.', 'images/products/appliances/milk-frother.webp', 1899, 3299, 42, 42, 4.9, 194, 'In Stock', true, true)
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  brand = excluded.brand,
  category = excluded.category,
  description = excluded.description,
  image_url = excluded.image_url,
  price = excluded.price,
  old_price = excluded.old_price,
  discount = excluded.discount,
  discount_percent = excluded.discount_percent,
  rating = excluded.rating,
  reviews = excluded.reviews,
  availability = excluded.availability,
  is_active = excluded.is_active;

notify pgrst, 'reload schema';

