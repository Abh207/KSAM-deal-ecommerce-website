const products = require('../src/api/headerproducts.json');
const catConfig = require('../src/api/categorySection.json');

console.log('Total products in headerproducts.json:', products.length);

const cats = {};
products.forEach(p => {
  const c = p.category || p.Category || p.type || 'undefined';
  cats[c] = (cats[c] || 0) + 1;
});
console.log('Categories present in products:', cats);

console.log('\nConfigured categories in categorySection.json:');
catConfig.categories.forEach(c => {
  const matching = products.filter(p => {
    if (Array.isArray(c.productIds) && c.productIds.length > 0) {
      return c.productIds.includes(Number(p.id));
    }
    const cat = p.category || p.Category || p.type || '';
    return String(cat).toLowerCase() === String(c.id).toLowerCase();
  });
  console.log(`- ${c.name} (id: ${c.id}): ${matching.length} matching products. First image: ${matching[0]?.image || 'NONE'}`);
  if (matching.length > 0) {
    console.log(`   Sample product names: ${matching.slice(0, 5).map(p => p.name || p.title).join(', ')}`);
  }
});
