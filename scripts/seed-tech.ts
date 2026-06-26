import { db } from "../src/lib/db";

async function main() {
    const categories = {
        tontechnik: 'cmossle4g000914iloz10bz8p',
        lichttechnik: 'cmossle4k000a14ilh4ovm3lr',
        zubehoer: 'cmqjcdunz0009kgil8vybdmaw',
        partyLicht: 'cmqjcdu170004kgilht0p75zk',
    };

    const items = [
        { title: 'TW Audio Sys One', price: 79000, cat: categories.tontechnik, desc: '2x Topteil T24N, 4x Bass B30, Amprack T, 2x Powersoft T602' },
        { title: 'TW Audio Sys Two', price: 42000, cat: categories.tontechnik, desc: '2x Topteil B8, 2x Bass B15, Amprack, 4x Powersoft K3000' },
        { title: 'Mackie Thumb 15', price: 3500, cat: categories.tontechnik, desc: 'PA Lautsprecher aktiv' },
        { title: 'Mackie SRM450', price: 3500, cat: categories.tontechnik, desc: 'PA Lautsprecher aktiv' },
        { title: 'Yamaha 16/4', price: 2500, cat: categories.tontechnik, desc: 'Mischpult' },
        { title: 'Yamaha DM3', price: 9500, cat: categories.tontechnik, desc: 'Digital-Mischpult' },
        { title: 'Yamaha 32/8', price: 3500, cat: categories.tontechnik, desc: 'Mischpult' },
        { title: 'Multicore zu 32/8', price: 2000, cat: categories.zubehoer, desc: 'Kabelage' },
        { title: 'Stagebox TIO1608-D2', price: 7500, cat: categories.zubehoer, desc: 'Stagebox' },
        { title: 'Akkuscheinwerfer', price: 1800, cat: categories.lichttechnik, desc: 'Akkubetriebener LED-Scheinwerfer' },
        { title: 'LED Scheinwerfer flach', price: 900, cat: categories.lichttechnik, desc: 'Flacher LED-Scheinwerfer' },
        { title: 'LED Blinder RGB', price: 2400, cat: categories.lichttechnik, desc: 'LED Blinder RGB' },
        { title: 'LED Par', price: 500, cat: categories.lichttechnik, desc: 'Klassischer LED-Scheinwerfer' },
        { title: 'LED UV Balken', price: 700, cat: categories.lichttechnik, desc: 'UV Schwarzlicht Balken' },
        { title: 'Bodennebel Theater', price: 13500, cat: categories.partyLicht, desc: 'Professionelle Bodennebelmaschine' },
        { title: 'Nebelmaschine 1,5KW', price: 5500, cat: categories.partyLicht, desc: 'Nebelmaschine 1.500 Watt' },
        { title: 'Bodennebelmaschine klein', price: 4500, cat: categories.partyLicht, desc: 'Bodennebelmaschine für kleine Events' },
        { title: 'Nebelmaschine klein 0,4KW', price: 2500, cat: categories.partyLicht, desc: 'Kompakte Nebelmaschine 400 Watt' },
        { title: '1l Fluid', price: 2400, cat: categories.partyLicht, desc: 'Nebelfluid 1 Liter' },
    ];

    for (const item of items) {
        let slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // ensure unique slug
        let existing = await db.item.findUnique({ where: { slug } });
        let counter = 1;
        let originalSlug = slug;
        while (existing) {
            slug = `${originalSlug}-${counter}`;
            existing = await db.item.findUnique({ where: { slug } });
            counter++;
        }

        await db.item.create({
            data: {
                title: item.title,
                slug,
                published: false,
                categoryId: item.cat,
                priceType: "FIXED",
                basePriceCents: item.price,
                shortDescription: item.desc,
            }
        });
        console.log(`Created: ${item.title}`);
    }

    console.log("Seeding complete!");
}

main().catch(console.error);
