import { pipeline } from "@xenova/transformers";

const DIMENSIONS = 384;

let extractorPromise: Promise<Awaited<ReturnType<typeof pipeline>>> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorPromise;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text]);
  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const extractor = await getExtractor();
  const output = await extractor(texts, { pooling: "mean", normalize: true });

  const tensors = Array.isArray(output) ? output : [output];
  const embeddings: number[][] = [];

  for (const tensor of tensors) {
    const dims = tensor.dims ?? [texts.length, DIMENSIONS];
    const size = dims[dims.length - 1] ?? DIMENSIONS;
    const data = tensor.data as number[];
    for (let i = 0; i < data.length; i += size) {
      embeddings.push(Array.from(data.slice(i, i + size)));
    }
  }

  return embeddings;
}

export { DIMENSIONS };
