import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";

const COLLECTION = "vectors";

export async function GET() {
  try {
    const client = await getClient();
    const categories = await client
      .db()
      .collection(COLLECTION)
      .distinct("category");

    return NextResponse.json({
      categories: categories.filter((c) => typeof c === "string" && c !== "").sort(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
