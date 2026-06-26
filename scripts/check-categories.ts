import { db } from "../src/lib/db";

async function main() {
    const cats = await db.category.findMany({ select: { id: true, name: true, slug: true, catalogTypeId: true }});
    console.log(cats);
}

main().catch(console.error);
