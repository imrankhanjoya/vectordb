"use client";

import { useEffect, useState, type FormEvent } from "react";

interface VectorItem {
  _id: string;
  name: string;
  summary?: string;
  category?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  embeddingCount?: number;
  score?: number;
}

export default function ListPage() {
  const [items, setItems] = useState<VectorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  async function load(reset = false, cat = category) {
    try {
      const params = new URLSearchParams();
      if (cat) params.set("category", cat);
      if (!reset) params.set("skip", String(items.length));

      const res = await fetch(`/api/vectors?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");

      setTotal(data.total);
      setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [listRes, categoriesRes] = await Promise.all([
          fetch("/api/vectors"),
          fetch("/api/vectors/categories"),
        ]);
        const [data, categoriesData] = await Promise.all([
          listRes.json(),
          categoriesRes.json(),
        ]);
        if (!listRes.ok) throw new Error(data.error ?? "Failed to load");
        if (!cancelled) {
          setTotal(data.total);
          setItems(data.items);
          setCategories(categoriesData.categories ?? []);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCategorySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearched(false);
    setLoading(true);
    setError("");
    load(true, category);
  }

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setError("");
    try {
      const embedRes = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: [query] }),
      });
      const embedData = await embedRes.json();
      if (!embedRes.ok)
        throw new Error(embedData.error ?? "Embedding generation failed");

      const searchRes = await fetch("/api/vectors/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: embedData.embeddings[0],
          topK: 20,
          filter: category ? { category } : undefined,
        }),
      });
      const searchData = await searchRes.json();
      if (!searchRes.ok) throw new Error(searchData.error ?? "Search failed");

      setItems(searchData.results);
      setTotal(searchData.results.length);
      setSearched(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  }

  const hasMore = !searched && items.length < total;

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 py-12 font-sans dark:bg-black">
      <main className="w-full max-w-4xl px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {searched ? "Search results" : `Vectors (${total})`}
          </h1>
          <form onSubmit={handleCategorySubmit} className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Filter
            </button>
          </form>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex flex-col gap-2 sm:flex-row">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by meaning... e.g. tropical fruits"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {searching ? "Searching..." : "Search"}
          </button>
          {searched && (
            <button
              type="button"
              onClick={() => {
                setSearched(false);
                setSearchQuery("");
                setLoading(true);
                setError("");
                load(true);
              }}
              className="rounded-lg border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Clear
            </button>
          )}
        </form>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {items.length === 0 && !loading && !searching ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            {searched ? "No matching results." : "No vectors found."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                      {item.name}
                    </h2>
                    {item.summary && (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {item.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.category && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                        {item.category}
                      </span>
                    )}
                    {item.score !== undefined && (
                      <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                        {(item.score * 100).toFixed(1)}%
                      </span>
                    )}
                    <span>{item.embeddingCount ?? 0} dims</span>
                  </div>
                </div>
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    {JSON.stringify(item.metadata, null, 2)}
                  </pre>
                )}
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  id: {item._id}
                  {item.createdAt
                    ? ` · ${new Date(item.createdAt).toLocaleString()}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              load(false);
            }}
            disabled={loading}
            className="mt-6 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        )}
      </main>
    </div>
  );
}
