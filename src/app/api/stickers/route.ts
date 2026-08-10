import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const STICKER_STYLE =
  "a cute sticker in simple line-art style, bold clean black outlines, thick uniform strokes, flat minimal coloring, soft pastel palette, sticker-like illustration, centered subject, clean solid white background, no text, no watermark";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "'prompt' (string) is required" },
        { status: 400 }
      );
    }

    const response = await client.images.generate({
      model: "gpt-image-1-mini",
      prompt: `${prompt.trim()}, ${STICKER_STYLE}`,
      n: 1,
      size: "1024x1024",
      output_format: "png",
    });

    const image = response.data?.[0];
    if (!image?.b64_json) {
      return NextResponse.json(
        { error: "No image was returned" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      image: `data:image/png;base64,${image.b64_json}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
