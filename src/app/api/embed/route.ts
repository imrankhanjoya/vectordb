import { NextResponse } from "next/server";
import { generateEmbeddings } from "@/lib/embedding";

export async function POST(request: Request) {
  try {
    const { texts } = await request.json();

    if (!Array.isArray(texts) || !texts.length || texts.some((t) => !t)) {
      return NextResponse.json(
        { error: "'texts' must be a non-empty array of strings" },
        { status: 400 }
      );
    }

    const embeddings = await generateEmbeddings(texts);
    return NextResponse.json({ embeddings });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
