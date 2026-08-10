import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";

const COLLECTION = "vectors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 200);
    const skip = Number(searchParams.get("skip") ?? 0) || 0;
    const category = searchParams.get("category");

    const client = await getClient();
    const collection = client.db().collection(COLLECTION);

    const filter = category ? { category } : {};

    const [items, total] = await Promise.all([
      collection
        .find(filter, {
          projection: {
            name: 1,
            summary: 1,
            category: 1,
            metadata: 1,
            createdAt: 1,
            embeddingCount: { $size: "$embedding" },
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return NextResponse.json({ items, total, limit, skip });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, embedding, metadata, summary, category } = await request.json();

    if (!name || !Array.isArray(embedding)) {
      return NextResponse.json(
        { error: "'name' (string) and 'embedding' (number array) are required" },
        { status: 400 }
      );
    }

    const client = await getClient();
    const collection = client.db().collection(COLLECTION);

    const result = await collection.insertOne({
      name,
      embedding,
      metadata: metadata ?? {},
      summary: summary ?? "",
      category: category ?? "",
      createdAt: new Date(),
    });

    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
