import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node", "onnxruntime-web"],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/onnxruntime-node/bin/**/*",
      "./node_modules/onnxruntime-node/**/*.node",
    ],
  },
};

export default nextConfig;
