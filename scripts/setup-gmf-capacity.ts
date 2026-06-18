import { db as prisma } from '../src/lib/db';

async function main() {
  console.log("Starting Migration...");

  // 1. Create or update resource
  const resourceSlug = 'betreiber-lieferteam';
  const resourceName = 'Betreiber / Lieferteam';
  const capacity = 10;
  
  let resource = await prisma.resource.findUnique({ where: { slug: resourceSlug } });
  if (resource) {
    console.log(`Resource exists: ${resource.id}. Updating...`);
    resource = await prisma.resource.update({
      where: { id: resource.id },
      data: {
        name: resourceName,
        capacityPerDay: capacity,
        isActive: true,
        description: 'Tägliche Arbeits-/Lieferkapazität des Betreibers für Lieferung, Aufbau, Abbau und Abholung. Große Hüpfburgen verbrauchen die volle Tageskapazität am Liefer- und Abholtag.'
      }
    });
  } else {
    console.log(`Resource does not exist. Creating...`);
    resource = await prisma.resource.create({
      data: {
        slug: resourceSlug,
        name: resourceName,
        capacityPerDay: capacity,
        isActive: true,
        description: 'Tägliche Arbeits-/Lieferkapazität des Betreibers für Lieferung, Aufbau, Abbau und Abholung. Große Hüpfburgen verbrauchen die volle Tageskapazität am Liefer- und Abholtag.'
      }
    });
  }

  // 2. Configure large modules
  const largeModuleTitles = [
    'Hüpfburg Schloss',
    'Hüpfburg Minion',
    'Dinopark Rutschen-Hüpfburg',
    'Hüpfburg Dschungel',
    'Rutsche Pirateninsel'
  ];

  const allItems = await prisma.item.findMany();
  
  const largeItems = allItems.filter(i => largeModuleTitles.includes(i.title));
  for (const item of largeItems) {
    await prisma.item.update({
      where: { id: item.id },
      data: {
        deliveryAvailable: true,
        pickupAvailable: false,
        availabilityMode: 'STOCK_AND_RESOURCE',
        resource: { connect: { id: resource.id } },
        resourceUnits: 10,
        resourceAppliesTo: 'DELIVERY_ONLY',
        resourceBlockTime: 'START_AND_END_DAYS'
      }
    });
    console.log(`Updated LARGE module: ${item.title}`);
  }

  // 3. Configure STOCK_ONLY items
  const stockOnlyTitles = [
    'Candybar Set Classic',
    'Mikrofon Set',
    'Party Licht Set',
    'DJ Lichtpaket',
    'Lautsprecher Set Basic'
  ];

  const smallItems = allItems.filter(i => stockOnlyTitles.includes(i.title));
  for (const item of smallItems) {
    await prisma.item.update({
      where: { id: item.id },
      data: {
        availabilityMode: 'STOCK_ONLY',
        resource: { disconnect: true },
        resourceUnits: 1,
        resourceAppliesTo: 'BOTH',
        resourceBlockTime: 'ENTIRE_DURATION'
      }
    });
    console.log(`Updated SMALL module: ${item.title}`);
  }

  console.log("Migration Complete.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
