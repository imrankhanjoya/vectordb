"use client";

import { useState, type FormEvent } from "react";

const EXAMPLES = [
  "sleepy cat holding a coffee mug",
  "happy avocado doing yoga",
  "crying blob waving goodbye",
  "alien eating ramen",
  "dog in a raincoat",
  "croissant wearing sunglasses",
];

export default function StickerPage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  async function handleGenerate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });
    setImage(null);

    try {
      const res = await fetch("/api/stickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error ?? "Generation failed" });
      } else {
        setImage(data.image);
        setStatus({ type: "success", message: "Sticker generated" });
      }
    } catch (error) {
      setStatus({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 py-12 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Line-Art Sticker Generator
        </h1>

        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="prompt"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Prompt
            </label>
            <input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              placeholder="e.g. sleepy cat holding a coffee mug"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
              >
                {example}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Generating..." : "Generate Sticker"}
          </button>
        </form>

        {status.type && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
            }`}
          >
            {status.message}
          </div>
        )}

        {image && (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Generated line-art sticker"
              className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800"
            />
            <a
              href={image}
              download="sticker.png"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Download PNG
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
