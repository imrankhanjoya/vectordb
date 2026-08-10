import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve } from "path";

const envContent = readFileSync(resolve(".env.local"), "utf8");
const match = envContent.match(/MONGO_URI="?([^"\n]+)"?/);
if (!match) throw new Error("MONGO_URI not found in .env.local");

const uri = match[1];
const client = new MongoClient(uri);

const COLLECTION = "vectors";
const NUM_DIMENSIONS = Number(process.argv[2] ?? 384);
const INDEX_NAME = "vector_index";

async function main() {
  await client.connect();
  const db = client.db();

  const exists = !!(await db.listCollections({ name: COLLECTION }).toArray()).length;
  if (!exists) {
    await db.createCollection(COLLECTION);
    console.log(`Created collection "${COLLECTION}"`);
  } else {
    console.log(`Collection "${COLLECTION}" already exists`);
  }

  const indexes = await db.collection(COLLECTION).listSearchIndexes().toArray();
  const hasIndex = indexes.some((i) => i.name === INDEX_NAME);

  if (!hasIndex) {
    const definition = {
      name: INDEX_NAME,
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: NUM_DIMENSIONS,
            similarity: "cosine",
          },
        ],
      },
    };
    await db.collection(COLLECTION).createSearchIndex(definition);
    console.log(`Created vector search index "${INDEX_NAME}" (${NUM_DIMENSIONS} dims)`);
  } else {
    console.log(`Vector search index "${INDEX_NAME}" already exists`);
  }

  console.log("Done.");
  await client.close();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
