import mongoose, { Schema, type InferSchemaType } from "mongoose";

const vectorSchema = new Schema(
  {
    name: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    summary: { type: String, default: "" },
    category: { type: String, default: "" },
  },
  { timestamps: true }
);

export type VectorDocument = InferSchemaType<typeof vectorSchema>;

export const Vector =
  (mongoose.models.Vector as mongoose.Model<VectorDocument>) ||
  mongoose.model<VectorDocument>("Vector", vectorSchema);
