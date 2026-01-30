import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    imageUrl: String,
    order: Number,
  },
  { timestamps: true }
);

// Index already defined via `unique: true` on slug field
categorySchema.index({ parentId: 1 });
categorySchema.index({ order: 1 });

export const CategoryModel = mongoose.model('Category', categorySchema);
