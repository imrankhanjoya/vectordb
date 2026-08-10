import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const COLLECTION = "vectors";
const INDEX = "vector_index";

export async function POST(request: Request) {
  try {
    const { query, topK = 5, filter } = await request.json();

    if (!Array.isArray(query)) {
      return NextResponse.json(
        { error: "'query' must be a number array (embedding vector)" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const collection = client.db().collection(COLLECTION);

    const pipeline = [
      {
        $vectorSearch: {
          index: INDEX,
          path: "embedding",
          queryVector: query,
          numCandidates: Math.max(topK * 10, 50),
          limit: topK,
          ...(filter ? { filter } : {}),
        },
      },
      { $project: { name: 1, metadata: 1, summary: 1, category: 1, score: { $meta: "vectorSearchScore" } } },
    ];

    const results = await collection.aggregate(pipeline).toArray();
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
