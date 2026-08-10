"use client";

import { useState, type FormEvent } from "react";

export default function InsertPage() {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [metadata, setMetadata] = useState("");
  const [embedding, setEmbedding] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [generatingEmbedding, setGeneratingEmbedding] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    let parsedEmbedding: number[];
    if (embedding.trim()) {
      try {
        parsedEmbedding = embedding
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map(Number);
        if (!parsedEmbedding.length) throw new Error("empty");
        if (parsedEmbedding.some((n) => Number.isNaN(n)))
          throw new Error("nan");
      } catch {
        setStatus({
          type: "error",
          message: "Embedding must be a comma-separated list of numbers",
        });
        setLoading(false);
        return;
      }
    } else {
      const sourceText = (summary || name).trim();
      if (!sourceText) {
        setStatus({
          type: "error",
          message: "Provide an embedding or a summary/name to generate one",
        });
        setLoading(false);
        return;
      }
      setStatus({ type: null, message: "Generating embedding..." });
      try {
        const res = await fetch("/api/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: [sourceText] }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Embedding generation failed");
        parsedEmbedding = data.embeddings[0];
      } catch (error) {
        setStatus({ type: "error", message: (error as Error).message });
        setLoading(false);
        return;
      }
    }

    let parsedMetadata: Record<string, unknown> = {};
    if (metadata.trim()) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch {
        setStatus({ type: "error", message: "Metadata must be valid JSON" });
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/vectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          summary,
          category,
          metadata: parsedMetadata,
          embedding: parsedEmbedding,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error ?? "Insert failed" });
      } else {
        setStatus({
          type: "success",
          message: `Inserted successfully (id: ${data.insertedId})`,
        });
        setName("");
        setSummary("");
        setCategory("");
        setMetadata("");
        setEmbedding("");
      }
    } catch (error) {
      setStatus({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 py-12 font-sans dark:bg-black">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Insert Vector
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name *
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. apples"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="summary" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Summary
            </label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short text summary"
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Category
            </label>
            <input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. fruit"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="metadata" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Metadata (JSON)
            </label>
            <textarea
              id="metadata"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder='{"source": "book", "page": 42}'
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="embedding" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Embedding (optional — leave empty to auto-generate from summary/name)
            </label>
            <textarea
              id="embedding"
              value={embedding}
              onChange={(e) => setEmbedding(e.target.value)}
              placeholder="0.1, -0.2, 0.3, ..."
              rows={4}
              className={`${inputClass} font-mono text-xs`}
            />
            <button
              type="button"
              onClick={async () => {
                const sourceText = (summary || name).trim();
                if (!sourceText) {
                  setStatus({ type: "error", message: "Enter a summary or name first" });
                  return;
                }
                setGeneratingEmbedding(true);
                setStatus({ type: null, message: "" });
                try {
                  const res = await fetch("/api/embed", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ texts: [sourceText] }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error ?? "Generation failed");
                  setEmbedding(data.embeddings[0].join(", "));
                  setStatus({ type: "success", message: "Embedding generated" });
                } catch (error) {
                  setStatus({ type: "error", message: (error as Error).message });
                } finally {
                  setGeneratingEmbedding(false);
                }
              }}
              disabled={generatingEmbedding || loading}
              className="mt-1 w-fit rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {generatingEmbedding ? "Generating..." : "Generate embedding"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Inserting..." : "Insert"}
          </button>
        </form>

        {status.type && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
            }`}
          >
            {status.message}
          </div>
        )}
      </main>
    </div>
  );
}
