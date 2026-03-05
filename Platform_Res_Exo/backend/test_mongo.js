const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try{
        await client.connect();
        console.log("Connected to MongoDB local");

        const db = client.db("platform_res_exo");
        const collections = await db.listCollections().toArray();
        console.log("Collections existantes:", collections.map(c => c.name));
    } finally {
        await client.close();
    }
}

run().catch(console.error);