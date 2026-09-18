import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  ["Classic Blue Straight Jeans","UrbanEdge","Jeans","Men",999,1499,"Premium everyday denim with a clean straight fit.","#4b6b8a","28,30,32,34,36,38",42],
  ["Oversized Cotton T-Shirt","StreetFlex","T-Shirts","Men",599,899,"Soft cotton oversized tee for casual everyday styling.","#111111,#f5f5f5,#777777","S,M,L,XL,XXL",65],
  ["Regular Fit Formal Shirt","Arrowline","Shirts","Men",899,1399,"Smart regular-fit shirt for office and occasions.","#ffffff,#1f3a5f,#d8d1c4","S,M,L,XL,XXL",31],
  ["Comfort Joggers","StreetFlex","Joggers","Men",799,1199,"Stretchable joggers with relaxed ankle fit.","#111111,#27374d,#6b7280","S,M,L,XL,XXL",52],
  ["Cotton Casual Lower","DailyWear","Lowers","Men",549,799,"Breathable cotton lower for daily comfort.","#111111,#334155,#e5e7eb","M,L,XL,XXL,3XL",48],
  ["Denim Half Jeans","BluePeak","Half Jeans","Men",699,999,"Casual denim shorts with a modern finish.","#315b83,#111111","28,30,32,34,36",27],
  ["Cargo Half Pant","UrbanEdge","Shorts","Men",649,999,"Utility cargo shorts with multiple pockets.","#7c6f52,#111111,#556b2f","M,L,XL,XXL",39],
  ["Puffer Winter Jacket","NorthPeak","Winter Wear","Men",1799,2999,"Warm quilted jacket designed for winter layering.","#111111,#1d3557,#7f1d1d","M,L,XL,XXL",18],
  ["Cable Knit Sweater","CozyWear","Sweaters","Men",999,1599,"Classic knit sweater with a soft winter feel.","#9a3412,#334155,#f1e7d0","M,L,XL,XXL",23],
  ["Comfort Cotton Boxer","ComfortFit","Innerwear","Men",399,599,"Soft cotton boxer with comfortable waistband.","#111111,#e5e7eb,#64748b","M,L,XL,XXL",74],
  ["Classic Silk Saree","Rangoli","Sarees","Women",1499,2499,"Elegant festive saree with a rich drape.","#8b1e3f,#166534,#7c2d12","Free Size",26],
  ["Printed Daily Saree","Rangoli","Sarees","Women",899,1399,"Lightweight printed saree for everyday wear.","#db2777,#2563eb,#15803d","Free Size",34],
  ["Embroidered Kurti","EthnicAura","Kurtis","Women",899,1399,"Elegant embroidered kurti for casual and festive styling.","#ec4899,#4338ca,#166534","S,M,L,XL,XXL",41],
  ["Wide Leg Denim","DenimCo","Jeans","Women",1299,1899,"High-rise wide-leg denim with relaxed silhouette.","#315b83,#111111","26,28,30,32,34",29],
  ["Ribbed Crop Top","TrendHub","Tops","Women",499,799,"Stretch ribbed top with modern cropped fit.","#111111,#ffffff,#e11d48","S,M,L,XL",45],
  ["Floral Midi Dress","TrendHub","Dresses","Women",1099,1699,"Flowy floral midi dress with an easy fit.","#f472b6,#93c5fd,#fef3c7","S,M,L,XL,XXL",22],
  ["Women's Winter Cardigan","CozyWear","Winter Wear","Women",1199,1799,"Soft cardigan for warm and stylish winter layering.","#a78bfa,#be8b5b,#334155","S,M,L,XL",25],
  ["Women's Leggings","SoftLine","Leggings","Women",449,699,"Stretch leggings for everyday comfort.","#111111,#374151,#7c3aed","S,M,L,XL,XXL",58],
  ["Cotton Brief Set","SoftLine","Innerwear","Women",699,999,"Comfort-focused cotton innerwear set.","#111111,#f5d0fe,#fce7f3","S,M,L,XL",36],
  ["Lounge Shorts","DailyWear","Shorts","Women",499,749,"Relaxed lounge shorts with soft elastic waist.","#111111,#f1f5f9,#be123c","S,M,L,XL,XXL",44],
  ["Kids Graphic T-Shirt","LittleLoop","T-Shirts","Kids",349,549,"Fun graphic tee made for active kids.","#2563eb,#f97316,#22c55e","4Y,6Y,8Y,10Y,12Y",33],
  ["Kids Denim Jeans","LittleLoop","Jeans","Kids",699,999,"Durable denim with comfortable stretch.","#315b83,#111111","4Y,6Y,8Y,10Y,12Y",21],
  ["Unisex Hoodie","StreetFlex","Winter Wear","Unisex",999,1499,"Heavyweight hoodie with relaxed unisex fit.","#111111,#475569,#d1d5db","S,M,L,XL,XXL",37],
  ["Unisex Track Pants","DailyWear","Lowers","Unisex",699,999,"Everyday track pants for travel and lounging.","#111111,#1e293b,#6b7280","S,M,L,XL,XXL",51]
];

async function main() {
  await prisma.product.deleteMany();
  for (const p of products) {
    const [name,brand,category,gender,price,mrp,description,colors,sizes,stock] = p as any[];
    await prisma.product.create({
      data: {
        name, brand, category, gender, price, mrp, description,
        image: `https://placehold.co/800x1000/png?text=${encodeURIComponent(name)}`,
        colors, sizes, stock,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      }
    });
  }
  console.log(`Seeded ${products.length} demo products.`);
}
main().finally(() => prisma.$disconnect());
