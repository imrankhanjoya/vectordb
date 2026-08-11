import { pipeline, env } from "@huggingface/transformers";

const DIMENSIONS = 384;

env.cacheDir = "/tmp/transformers-cache";

type FeatureExtractionFn = (
  texts: string | string[],
  options: { pooling: string; normalize: boolean }
) => Promise<{ dims: number[]; data: number[] | Float32Array } | Array<{ dims: number[]; data: number[] | Float32Array }>>;

let extractorPromise: Promise<FeatureExtractionFn> | null = null;

function getExtractor(): Promise<FeatureExtractionFn> {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    ) as Promise<FeatureExtractionFn>;
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
    const data = Array.from(tensor.data as ArrayLike<number>);
    for (let i = 0; i < data.length; i += size) {
      embeddings.push(data.slice(i, i + size));
    }
  }

  return embeddings;
}

export { DIMENSIONS };
