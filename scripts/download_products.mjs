import fs from "fs";
import path from "path";
import sharp from "sharp";

async function downloadOrFallback(url, dest, title, bg1, bg2) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      await sharp(buf).resize(600, 600, { fit: "cover" }).webp({ quality: 80 }).toFile(dest);
      console.log("Downloaded:", dest);
      return;
    }
  } catch (err) {
    console.log("Fetch failed, generating SVG fallback for:", title);
  }
  const svg = `<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="600" fill="url(#g)"/>
    <rect x="40" y="40" width="520" height="520" rx="28" fill="#ffffff" fill-opacity="0.08"/>
    <text x="300" y="280" font-size="30" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="300" y="330" font-size="18" font-family="sans-serif" font-weight="bold" fill="#84FF00" text-anchor="middle">KSAM CERTIFIED DEAL</text>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile(dest);
  console.log("Created fallback:", dest);
}

async function main() {
  const lifestyle = [
    { name: "messenger-bag.webp", title: "Canvas Messenger Bag", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", b1: "#1e293b", b2: "#0f172a" },
    { name: "key-organizer.webp", title: "Minimalist Key Organizer", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", b1: "#334155", b2: "#1e293b" },
    { name: "water-bottle.webp", title: "Stainless Steel Flask", url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80", b1: "#0f766e", b2: "#115e59" },
    { name: "neck-pillow.webp", title: "Memory Foam Neck Pillow", url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80", b1: "#3730a3", b2: "#1e1b4b" },
    { name: "leather-journal.webp", title: "Leather Journal Notebook", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", b1: "#78350f", b2: "#451a03" },
    { name: "multi-tool.webp", title: "Titanium Multi-Tool", url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80", b1: "#3f3f46", b2: "#18181b" },
    { name: "cable-pouch.webp", title: "Tech Organizer Pouch", url: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&q=80", b1: "#1e1b4b", b2: "#0f172a" },
    { name: "ceramic-mug.webp", title: "Ceramic Travel Mug", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80", b1: "#831843", b2: "#500724" },
    { name: "carabiner.webp", title: "Metal Carabiner Clip", url: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600&q=80", b1: "#14532d", b2: "#052e16" },
    { name: "blue-light-glasses.webp", title: "Blue Light Glasses", url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80", b1: "#1e3a8a", b2: "#172554" },
    { name: "laptop-stand.webp", title: "Aluminum Laptop Stand", url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80", b1: "#334155", b2: "#0f172a" }
  ];

  for (const item of lifestyle) {
    const dest = path.join("public", "images", "products", "lifestyle", item.name);
    await downloadOrFallback(item.url, dest, item.title, item.b1, item.b2);
  }

  const appliances = [
    { name: "electric-kettle.webp", title: "Glass Electric Kettle", url: "https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=600&q=80", b1: "#1e293b", b2: "#0f172a" },
    { name: "smart-toaster.webp", title: "Smart 2-Slice Toaster", url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80", b1: "#854d0e", b2: "#451a03" },
    { name: "ultrasonic-humidifier.webp", title: "Ultrasonic Humidifier", url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80", b1: "#0284c7", b2: "#0369a1" },
    { name: "high-speed-blender.webp", title: "High-Speed Blender", url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80", b1: "#be123c", b2: "#881337" },
    { name: "garment-steamer.webp", title: "Handheld Garment Steamer", url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80", b1: "#4338ca", b2: "#312e81" },
    { name: "ice-maker.webp", title: "Countertop Ice Maker", url: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&q=80", b1: "#0e7490", b2: "#155e75" },
    { name: "electric-grill.webp", title: "Smokeless Electric Grill", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", b1: "#991b1b", b2: "#7f1d1d" },
    { name: "space-heater.webp", title: "Ceramic Space Tower Heater", url: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80", b1: "#b45309", b2: "#78350f" },
    { name: "sous-vide.webp", title: "Sous Vide Precision Cooker", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80", b1: "#1f2937", b2: "#111827" },
    { name: "food-dehydrator.webp", title: "Digital Food Dehydrator", url: "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=600&q=80", b1: "#15803d", b2: "#14532d" },
    { name: "milk-frother.webp", title: "Automatic Milk Frother", url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80", b1: "#581c87", b2: "#3b0764" }
  ];

  for (const item of appliances) {
    const dest = path.join("public", "images", "products", "appliances", item.name);
    await downloadOrFallback(item.url, dest, item.title, item.b1, item.b2);
  }
}

main().catch(console.error);

