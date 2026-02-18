import mongoose from 'mongoose';
import { ProductStatus } from 'constants/enums';

const variantSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sku: String,
  priceOverride: Number,
  stock: Number,
  attributes: mongoose.Schema.Types.Mixed,
});

const imageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  url: { type: String, required: true },
  order: { type: Number, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    status: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.DRAFT },
    basePrice: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    variants: [variantSchema],
    images: [imageSchema],
    meta: { title: String, description: String },
  },
  { timestamps: true }
);

// Index already defined via `unique: true` on slug field
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

export const ProductModel = mongoose.model('Product', productSchema);
