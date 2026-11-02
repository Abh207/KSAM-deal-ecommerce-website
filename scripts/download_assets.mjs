import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES = [
  // Deals carousel images (Task 2)
  {
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80",
    dest: "public/images/deals/headphones-deal.webp",
    width: 800,
    author: "Paul Esch-Laurent",
    source: "https://unsplash.com/photos/black-wireless-headphones-Ugt58Cw4uxQ",
    license: "Unsplash License (Free commercial use)",
    description: "Premium Wireless Over-Ear Headphones"
  },
  {
    url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80",
    dest: "public/images/deals/ethnicwear-deal.webp",
    width: 800,
    author: "Prashant Sharma",
    source: "https://unsplash.com/photos/man-in-traditional-indian-ethnic-attire-Xv_j2lH0y6o",
    license: "Unsplash License (Free commercial use)",
    description: "Elegant Traditional Indian Ethnicwear"
  },
  {
    url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&q=80",
    dest: "public/images/deals/laptop-zenbook-deal.webp",
    width: 800,
    author: "Kari Shea",
    source: "https://unsplash.com/photos/silver-laptop-on-desk-1SAnrIxw5OY",
    license: "Unsplash License (Free commercial use)",
    description: "Sleek Ultra-Thin Premium Zenbook Laptop"
  },
  {
    url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=900&q=80",
    dest: "public/images/deals/kitchen-appliances-deal.webp",
    width: 800,
    author: "Alex Loup",
    source: "https://unsplash.com/photos/blender-smoothie-kitchen-2w3om982d",
    license: "Unsplash License (Free commercial use)",
    description: "Modern Kitchen Blender and Appliances"
  },
  {
    url: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=900&q=80",
    dest: "public/images/deals/home-essentials-deal.webp",
    width: 800,
    author: "Volha Flaxeco",
    source: "https://unsplash.com/photos/home-cleaning-essentials-setup-fV7XjQ",
    license: "Unsplash License (Free commercial use)",
    description: "Eco-Friendly Home Essentials & Cleaning Tools"
  },
  {
    url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&q=80",
    dest: "public/images/deals/pc-accessories-deal.webp",
    width: 800,
    author: "Jay Zhang",
    source: "https://unsplash.com/photos/mechanical-keyboard-and-mouse-desk-setup-ZSPBhokqP8",
    license: "Unsplash License (Free commercial use)",
    description: "PC Accessories and Ergonomic Workspace Setup"
  },

  // Category Hero Banners (Task 5)
  {
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&q=80",
    dest: "public/images/categories/home-appliances-hero.webp",
    width: 900,
    author: "Jason Leung",
    source: "https://unsplash.com/photos/modern-kitchen-appliances-poI7DelFiVA",
    license: "Unsplash License (Free commercial use)",
    description: "Modern Kitchen and Home Appliances"
  },
  {
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80",
    dest: "public/images/categories/accessories-lifestyle-hero.webp",
    width: 900,
    author: "Giorgio Trovato",
    source: "https://unsplash.com/photos/lifestyle-watch-and-accessories-K9QHL526BGg",
    license: "Unsplash License (Free commercial use)",
    description: "Premium Lifestyle Accessories & Daily Essentials"
  },

  // Home Appliances Demo Products (Task 5)
  {
    url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=700&q=80",
    dest: "public/images/products/appliances/air-purifier.webp",
    width: 600,
    author: "Maxim Hopman",
    source: "https://unsplash.com/photos/smart-air-purifier-home-appliances",
    license: "Unsplash License (Free commercial use)",
    description: "Smart True HEPA Air Purifier"
  },
  {
    url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=700&q=80",
    dest: "public/images/products/appliances/espresso-machine.webp",
    width: 600,
    author: "Demir Ergün",
    source: "https://unsplash.com/photos/stainless-espresso-machine-barista",
    license: "Unsplash License (Free commercial use)",
    description: "Compact 15-Bar Espresso & Cappuccino Maker"
  },
  {
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80",
    dest: "public/images/products/appliances/robotic-vacuum.webp",
    width: 600,
    author: "Alexandre Debiève",
    source: "https://unsplash.com/photos/smart-robot-cleaner-tech",
    license: "Unsplash License (Free commercial use)",
    description: "Laser-Guided Robotic Vacuum Cleaner"
  },
  {
    url: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=700&q=80",
    dest: "public/images/products/appliances/air-fryer.webp",
    width: 600,
    author: "Nathan Dumlao",
    source: "https://unsplash.com/photos/kitchen-air-fryer-cooker",
    license: "Unsplash License (Free commercial use)",
    description: "Digital Rapid-Air Convection Air Fryer 5.5L"
  },
  {
    url: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=700&q=80",
    dest: "public/images/products/appliances/cordless-vacuum.webp",
    width: 600,
    author: "The Blowup",
    source: "https://unsplash.com/photos/cordless-cleaning-device",
    license: "Unsplash License (Free commercial use)",
    description: "Ultra-Light Handheld Cordless Vacuum"
  },
  {
    url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&q=80",
    dest: "public/images/products/appliances/multi-cooker.webp",
    width: 600,
    author: "Edgar Castrejon",
    source: "https://unsplash.com/photos/smart-multi-cooker-kitchen-pot",
    license: "Unsplash License (Free commercial use)",
    description: "Electric 8-in-1 Smart Multi-Cooker"
  },

  // Accessories & Lifestyle Demo Products (Task 5)
  {
    url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&q=80",
    dest: "public/images/products/lifestyle/leather-cardholder.webp",
    width: 600,
    author: "Claudio Schwarz",
    source: "https://unsplash.com/photos/minimalist-leather-card-holder-wallet",
    license: "Unsplash License (Free commercial use)",
    description: "Handcrafted Full-Grain Leather Cardholder"
  },
  {
    url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&q=80",
    dest: "public/images/products/lifestyle/polarized-sunglasses.webp",
    width: 600,
    author: "Ethan Robertson",
    source: "https://unsplash.com/photos/classic-polarized-sunglasses",
    license: "Unsplash License (Free commercial use)",
    description: "Matte Black UV400 Polarized Sunglasses"
  },
  {
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80",
    dest: "public/images/products/lifestyle/travel-duffle.webp",
    width: 600,
    author: "Sun Lingyan",
    source: "https://unsplash.com/photos/canvas-travel-duffle-bag",
    license: "Unsplash License (Free commercial use)",
    description: "Heavy-Duty Waxed Canvas Weekender Duffle"
  },
  {
    url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&q=80",
    dest: "public/images/products/lifestyle/insulated-tumbler.webp",
    width: 600,
    author: "Bluewater Sweden",
    source: "https://unsplash.com/photos/stainless-insulated-water-bottle",
    license: "Unsplash License (Free commercial use)",
    description: "Double-Wall Vacuum Insulated Tumbler 750ml"
  },
  {
    url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=700&q=80",
    dest: "public/images/products/lifestyle/wireless-charger.webp",
    width: 600,
    author: "Steve Johnson",
    source: "https://unsplash.com/photos/wireless-charging-dock-stand",
    license: "Unsplash License (Free commercial use)",
    description: "3-in-1 Fast Wireless Magnetic Charging Stand"
  },
  {
    url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&q=80",
    dest: "public/images/products/lifestyle/desk-mat.webp",
    width: 600,
    author: "Grover Holt",
    source: "https://unsplash.com/photos/minimalist-leather-desk-pad-workspace",
    license: "Unsplash License (Free commercial use)",
    description: "Vegan Leather Waterproof Dual-Sided Desk Mat"
  }
];

async function main() {
  console.log(`Starting download and WebP conversion for ${IMAGES.length} images...`);
  const credits = [];

  for (const item of IMAGES) {
    const fullDest = path.resolve(process.cwd(), item.dest);
    fs.mkdirSync(path.dirname(fullDest), { recursive: true });

    console.log(`Fetching: ${item.description} -> ${item.dest}`);
    try {
      const res = await fetch(item.url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from ${item.url}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());

      // Resize and convert to WebP
      await sharp(buffer)
        .resize({ width: item.width, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toFile(fullDest);

      const stats = fs.statSync(fullDest);
      const kb = (stats.size / 1024).toFixed(1);
      console.log(`  ✓ Saved: ${item.dest} (${kb} KB)`);

      credits.push({
        file: item.dest,
        description: item.description,
        author: item.author,
        source: item.source,
        license: item.license,
        sizeKb: kb
      });
    } catch (err) {
      console.error(`  ✗ Failed: ${item.description}`, err.message);
    }
  }

  // Generate CREDITS.md
  let creditsMd = `# Image Credits & Commercial Licenses\n\n`;
  creditsMd += `All images downloaded and converted to WebP for KSAM Deal use free commercial licenses (Unsplash License or Pexels License) which grant irrevocable, nonexclusive worldwide copyright license to download, copy, modify, distribute, perform, and use photos for free, including for commercial purposes, without permission or attribution.\n\n`;
  creditsMd += `| Image File | Description | Author / Photographer | Source URL | License | File Size |\n`;
  creditsMd += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const c of credits) {
    creditsMd += `| \`${c.file}\` | ${c.description} | ${c.author} | [Link](${c.source}) | ${c.license} | ${c.sizeKb} KB |\n`;
  }

  fs.writeFileSync(path.resolve(process.cwd(), "CREDITS.md"), creditsMd, "utf8");
  console.log(`\nGenerated CREDITS.md with ${credits.length} entries!`);
}

main().catch(console.error);

