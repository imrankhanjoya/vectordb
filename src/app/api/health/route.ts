import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await getClient();
    const db = client.db();
    await db.command({ ping: 1 });
    return NextResponse.json({ status: "ok", database: db.databaseName });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
