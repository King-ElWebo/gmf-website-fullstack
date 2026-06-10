const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined in environment variables");
  process.exit(1);
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const REPLACEMENTS = [
  { bad: /H\?\?pfburg/g, good: 'Hüpfburg' },
  { bad: /H├╝pfburg/g, good: 'Hüpfburg' },
  { bad: /H\?\?pfburgen/g, good: 'Hüpfburgen' },
  { bad: /H├╝pfburgen/g, good: 'Hüpfburgen' },
  { bad: /f\?\?r/g, good: 'für' },
  { bad: /f├╝r/g, good: 'für' },
  { bad: /H\?\?he/g, good: 'Höhe' },
  { bad: /H├Âhe/g, good: 'Höhe' },
  { bad: /Spa\?\?/g, good: 'Spaß' },
  { bad: /Spa├ƒ/g, good: 'Spaß' },
  { bad: /f├ñllig/g, good: 'fällig' },
  { bad: /N├ñsse/g, good: 'Nässe' },
  { bad: /ab 149 \?\?\?/g, good: 'ab 149 €' },
  { bad: /ab 149 Ôé¼/g, good: 'ab 149 €' },
  { bad: /Ôé¼/g, good: '€' },
  { bad: /\?\?\?/g, good: '€' }, // Generic replacement if three question marks are found (like in price labels)
  { bad: /Trocknungsgeb\?\?hr/g, good: 'Trocknungsgebühr' },
  { bad: /Trocknungsgeb├╝hr/g, good: 'Trocknungsgebühr' },
  { bad: /Mietvertr\?\?g/g, good: 'Mietvertrag' },
  { bad: /Mietvertr├ñg/g, good: 'Mietvertrag' },
  { bad: /M\?\?rz/g, good: 'März' },
  { bad: /M├ñrz/g, good: 'März' },
  { bad: /Zur\?\?ck/g, good: 'Zurück' },
  { bad: /Zur├╝ck/g, good: 'Zurück' },
  { bad: /Anfr\?\?ge/g, good: 'Anfrage' },
  { bad: /Anfr├ñge/g, good: 'Anfrage' },
  { bad: /verf\?\?gbar/g, good: 'verfügbar' },
  { bad: /verf├╝gbar/g, good: 'verfügbar' }
];

function repairString(val) {
  if (typeof val !== 'string') return val;
  let current = val;
  let modified = false;
  for (const r of REPLACEMENTS) {
    if (r.bad.test(current)) {
      current = current.replace(r.bad, r.good);
      modified = true;
    }
  }
  return { val: current, modified };
}

function repairValue(val) {
  if (typeof val === 'string') {
    return repairString(val);
  } else if (val && typeof val === 'object' && !Array.isArray(val)) {
    // Check JSON object values recursively
    let modified = false;
    const repairedObj = {};
    for (const key in val) {
      const fieldVal = val[key];
      const res = repairValue(fieldVal);
      repairedObj[key] = res.val;
      if (res.modified) modified = true;
    }
    return { val: repairedObj, modified };
  } else if (Array.isArray(val)) {
    let modified = false;
    const repairedArr = val.map(item => {
      const res = repairValue(item);
      if (res.modified) modified = true;
      return res.val;
    });
    return { val: repairedArr, modified };
  }
  return { val, modified: false };
}

async function repair() {
  const models = [
    { name: 'Category', fields: ['name', 'description'] },
    { name: 'CatalogType', fields: ['name', 'description', 'navLabel'] },
    { name: 'Item', fields: ['title', 'description', 'priceLabel', 'shortDescription', 'longDescription', 'depositLabel', 'depositInfo', 'cleaningFeeLabel', 'cleaningFeeInfo', 'dryingFeeLabel', 'dryingFeeInfo', 'additionalCostsInfo', 'deliveryInfo', 'usageInfo', 'rentalNotes', 'setupRequirements', 'accessRequirements'] },
    { name: 'ItemImage', fields: ['alt'] },
    { name: 'SiteSettings', fields: ['phone', 'email', 'address', 'openingHours', 'noticeText', 'heroTitle', 'heroText', 'additionalInfo', 'deliveryTerms'] },
    { name: 'SiteSocialLink', fields: ['platform', 'label', 'url'] },
    { name: 'CalendarBlocker', fields: ['title', 'description', 'contactName'] },
    { name: 'GlobalImage', fields: ['alt'] },
    { name: 'Faq', fields: ['question', 'answer'] },
    { name: 'Booking', fields: ['referenceCode', 'status', 'deliveryType', 'customerMessage'], jsonFields: ['billingAddress'] },
    { name: 'BookingCustomer', fields: ['firstName', 'lastName', 'email', 'phone', 'addressLine1', 'zip', 'city'] },
    { name: 'BookingItem', fields: ['resourceTitle', 'priceType', 'priceLabel', 'displayPrice', 'pricingMode', 'pricingReason'] },
    { name: 'InternalNote', fields: ['content'] }
  ];

  console.log("Starting database repair of encoding corruptions...");

  for (const m of models) {
    const delegateName = m.name.charAt(0).toLowerCase() + m.name.slice(1);
    const delegate = prisma[delegateName];
    if (!delegate) continue;

    const records = await delegate.findMany();
    for (const r of records) {
      const updates = {};
      let hasUpdates = false;

      // Repair string fields
      for (const field of m.fields || []) {
        const val = r[field];
        if (typeof val === 'string') {
          const res = repairString(val);
          if (res.modified) {
            updates[field] = res.val;
            hasUpdates = true;
            console.log(`[REPAIR] ${m.name} (ID: ${r.id}) -> Field "${field}": "${val}" -> "${res.val}"`);
          }
        }
      }

      // Repair JSON fields
      for (const field of m.jsonFields || []) {
        const val = r[field];
        if (val) {
          const res = repairValue(val);
          if (res.modified) {
            updates[field] = res.val;
            hasUpdates = true;
            console.log(`[REPAIR JSON] ${m.name} (ID: ${r.id}) -> Field "${field}": ${JSON.stringify(val)} -> ${JSON.stringify(res.val)}`);
          }
        }
      }

      if (hasUpdates) {
        await delegate.update({
          where: { id: r.id },
          data: updates
        });
      }
    }
  }

  console.log("Database repair complete.");
}

repair()
  .catch(console.error)
  .finally(() => prisma.$disconnect().then(() => pool.end()));
