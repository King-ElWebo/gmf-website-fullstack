import { db } from "../src/lib/db";

async function main() {
    const res = await db.item.updateMany({
        where: {
            published: false, 
            category: {slug: {in: ['tontechnik', 'lichttechnik', 'zubehoer-technik', 'partylicht-effekte']}}
        }, 
        data: {
            deliveryAvailable: true, 
            pickupAvailable: true
        }
    });
    console.log('Updated', res.count);
}
main().catch(console.error);
