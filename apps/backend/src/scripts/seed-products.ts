/* eslint-disable no-console */
/**
 * Seed script to create HomeDecor and Lifestyle categories and products.
 *
 * Usage:
 *   npx tsx src/scripts/seed-products.ts
 *   # or with npm script:
 *   npm run seed:products
 *
 * Environment variables (loaded from .env automatically):
 *   MONGODB_URI - MongoDB connection string
 *
 * Options:
 *   --clear - Clear existing categories and products before seeding
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { ProductStatus } from '@lunaz/types';

// Load .env from project root (3 levels up from this script)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// Import models (recreate schemas to avoid import issues in standalone script)
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    imageUrl: String,
    order: Number,
  },
  { timestamps: true }
);

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
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
    },
    basePrice: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    variants: [variantSchema],
    images: [imageSchema],
    meta: { title: String, description: String },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model('Category', categorySchema);
const ProductModel = mongoose.model('Product', productSchema);

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Placeholder image URLs (using picsum for demo purposes)
const getPlaceholderImage = (seed: number, width = 800, height = 600) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

// ============================================================================
// SEED DATA
// ============================================================================

interface CategorySeed {
  name: string;
  slug: string;
  imageUrl?: string;
  order: number;
  subcategories?: Array<{
    name: string;
    slug: string;
    imageUrl?: string;
    order: number;
  }>;
}

interface ProductSeed {
  name: string;
  slug: string;
  description: string;
  categorySlug: string; // Reference to category by slug
  basePrice: number;
  status: ProductStatus;
  variants: Array<{
    name: string;
    sku: string;
    priceOverride?: number;
    stock: number;
    attributes?: Record<string, string>;
  }>;
  imageCount: number; // Number of placeholder images to generate
  meta?: { title: string; description: string };
}

const categories: CategorySeed[] = [
  {
    name: 'Home Decor',
    slug: 'home-decor',
    imageUrl: getPlaceholderImage(100),
    order: 1,
    subcategories: [
      {
        name: 'Wall Art',
        slug: 'wall-art',
        imageUrl: getPlaceholderImage(101),
        order: 1,
      },
      {
        name: 'Candles & Holders',
        slug: 'candles-holders',
        imageUrl: getPlaceholderImage(102),
        order: 2,
      },
      {
        name: 'Vases & Planters',
        slug: 'vases-planters',
        imageUrl: getPlaceholderImage(103),
        order: 3,
      },
      {
        name: 'Cushions & Throws',
        slug: 'cushions-throws',
        imageUrl: getPlaceholderImage(104),
        order: 4,
      },
      {
        name: 'Mirrors',
        slug: 'mirrors',
        imageUrl: getPlaceholderImage(105),
        order: 5,
      },
      {
        name: 'Rugs & Carpets',
        slug: 'rugs-carpets',
        imageUrl: getPlaceholderImage(106),
        order: 6,
      },
    ],
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    imageUrl: getPlaceholderImage(200),
    order: 2,
    subcategories: [
      {
        name: 'Journals & Stationery',
        slug: 'journals-stationery',
        imageUrl: getPlaceholderImage(201),
        order: 1,
      },
      {
        name: 'Wellness',
        slug: 'wellness',
        imageUrl: getPlaceholderImage(202),
        order: 2,
      },
      {
        name: 'Bags & Accessories',
        slug: 'bags-accessories',
        imageUrl: getPlaceholderImage(203),
        order: 3,
      },
      {
        name: 'Kitchen & Dining',
        slug: 'kitchen-dining',
        imageUrl: getPlaceholderImage(204),
        order: 4,
      },
      {
        name: 'Gift Sets',
        slug: 'gift-sets',
        imageUrl: getPlaceholderImage(205),
        order: 5,
      },
    ],
  },
];

const products: ProductSeed[] = [
  // ========== HOME DECOR - Wall Art ==========
  {
    name: 'Abstract Ocean Canvas Print',
    slug: 'abstract-ocean-canvas-print',
    description:
      'Transform your space with this stunning abstract ocean canvas print. Featuring calming blue tones and fluid brushstrokes, this piece brings a sense of tranquility to any room. Printed on premium gallery-wrapped canvas with fade-resistant inks.',
    categorySlug: 'wall-art',
    basePrice: 9900,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Small (18x24)', sku: 'AOCP-S', stock: 25, attributes: { size: '18x24 inches' } },
      {
        name: 'Medium (24x36)',
        sku: 'AOCP-M',
        priceOverride: 14500,
        stock: 20,
        attributes: { size: '24x36 inches' },
      },
      {
        name: 'Large (36x48)',
        sku: 'AOCP-L',
        priceOverride: 21000,
        stock: 15,
        attributes: { size: '36x48 inches' },
      },
    ],
    imageCount: 4,
    meta: {
      title: 'Abstract Ocean Canvas Print | Modern Wall Art',
      description:
        'Shop our abstract ocean canvas print. Available in multiple sizes. Free shipping on orders over ৳5000.',
    },
  },
  {
    name: 'Minimalist Botanical Line Art Set',
    slug: 'minimalist-botanical-line-art-set',
    description:
      'Elevate your walls with this elegant set of 3 minimalist botanical line art prints. Each piece features delicate plant illustrations in a contemporary single-line style. Perfect for creating a cohesive gallery wall.',
    categorySlug: 'wall-art',
    basePrice: 6600,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Set of 3 - 8x10', sku: 'MBLA-S3', stock: 30 },
      { name: 'Set of 3 - 11x14', sku: 'MBLA-M3', priceOverride: 8800, stock: 25 },
    ],
    imageCount: 3,
  },
  {
    name: 'Vintage Map World Poster',
    slug: 'vintage-map-world-poster',
    description:
      'A beautifully aged vintage-style world map poster that adds character and wanderlust to any space. Printed on archival matte paper with rich sepia tones and intricate cartographic details.',
    categorySlug: 'wall-art',
    basePrice: 3850,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Standard (24x36)', sku: 'VMWP-24', stock: 50 },
      { name: 'Large (36x48)', sku: 'VMWP-36', priceOverride: 6000, stock: 30 },
    ],
    imageCount: 2,
  },

  // ========== HOME DECOR - Candles & Holders ==========
  {
    name: 'Soy Wax Aromatherapy Candle Collection',
    slug: 'soy-wax-aromatherapy-candle-collection',
    description:
      'Handcrafted soy wax candles infused with pure essential oils. Each candle burns cleanly for up to 45 hours and comes in a reusable glass jar. Choose from our signature scents designed to promote relaxation and well-being.',
    categorySlug: 'candles-holders',
    basePrice: 3200,
    status: ProductStatus.PUBLISHED,
    variants: [
      {
        name: 'Lavender Dreams',
        sku: 'SWAC-LAV',
        stock: 40,
        attributes: { scent: 'Lavender & Chamomile' },
      },
      {
        name: 'Eucalyptus Mint',
        sku: 'SWAC-EUC',
        stock: 35,
        attributes: { scent: 'Eucalyptus & Peppermint' },
      },
      {
        name: 'Vanilla Amber',
        sku: 'SWAC-VAN',
        stock: 45,
        attributes: { scent: 'Vanilla & Amber' },
      },
      {
        name: 'Citrus Grove',
        sku: 'SWAC-CIT',
        stock: 30,
        attributes: { scent: 'Orange & Bergamot' },
      },
    ],
    imageCount: 5,
  },
  {
    name: 'Geometric Brass Candle Holder Set',
    slug: 'geometric-brass-candle-holder-set',
    description:
      'Add a touch of modern elegance with this set of 3 geometric brass candle holders. Each piece features a unique angular design with a brushed brass finish. Perfect for taper or pillar candles.',
    categorySlug: 'candles-holders',
    basePrice: 5000,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Brushed Brass', sku: 'GBCH-BB', stock: 20 },
      { name: 'Matte Black', sku: 'GBCH-MB', stock: 25 },
      { name: 'Rose Gold', sku: 'GBCH-RG', priceOverride: 5800, stock: 15 },
    ],
    imageCount: 3,
  },
  {
    name: 'Hand-Poured Beeswax Pillar Candles',
    slug: 'hand-poured-beeswax-pillar-candles',
    description:
      '100% pure beeswax pillar candles, hand-poured in small batches. These natural candles emit a subtle honey scent and a warm, golden glow. Set of 3 in graduating sizes.',
    categorySlug: 'candles-holders',
    basePrice: 4300,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Natural Honey', sku: 'HPBP-NAT', stock: 30 },
      { name: 'Ivory White', sku: 'HPBP-WHT', stock: 25 },
    ],
    imageCount: 2,
  },

  // ========== HOME DECOR - Vases & Planters ==========
  {
    name: 'Handcrafted Ceramic Bud Vase Set',
    slug: 'handcrafted-ceramic-bud-vase-set',
    description:
      'A collection of 5 artisan ceramic bud vases in varying heights and organic shapes. Each piece is handcrafted with subtle imperfections that make it unique. Perfect for displaying single stems or small flower arrangements.',
    categorySlug: 'vases-planters',
    basePrice: 7100,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Matte White', sku: 'HCBV-WHT', stock: 20 },
      { name: 'Sage Green', sku: 'HCBV-SGR', stock: 18 },
      { name: 'Terracotta', sku: 'HCBV-TER', stock: 22 },
      { name: 'Charcoal', sku: 'HCBV-CHR', stock: 15 },
    ],
    imageCount: 4,
  },
  {
    name: 'Woven Seagrass Plant Basket',
    slug: 'woven-seagrass-plant-basket',
    description:
      'Sustainably sourced seagrass basket planter with a waterproof liner. Hand-woven by skilled artisans using traditional techniques. Perfect for indoor plants or as decorative storage.',
    categorySlug: 'vases-planters',
    basePrice: 3600,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Small (8 inch)', sku: 'WSPB-S', stock: 40 },
      { name: 'Medium (10 inch)', sku: 'WSPB-M', priceOverride: 4700, stock: 35 },
      { name: 'Large (12 inch)', sku: 'WSPB-L', priceOverride: 6000, stock: 25 },
    ],
    imageCount: 3,
  },
  {
    name: 'Modern Concrete Planter',
    slug: 'modern-concrete-planter',
    description:
      'Sleek and minimalist concrete planter with drainage hole and rubber plug. Features a smooth finish with subtle natural variations. Perfect for succulents, cacti, or small houseplants.',
    categorySlug: 'vases-planters',
    basePrice: 2750,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Natural Grey', sku: 'MCP-GRY', stock: 50 },
      { name: 'White Wash', sku: 'MCP-WHT', stock: 45 },
      { name: 'Black', sku: 'MCP-BLK', stock: 40 },
    ],
    imageCount: 3,
  },

  // ========== HOME DECOR - Cushions & Throws ==========
  {
    name: 'Moroccan-Inspired Tufted Throw Pillow',
    slug: 'moroccan-inspired-tufted-throw-pillow',
    description:
      'Add bohemian flair with this hand-tufted decorative pillow. Features intricate geometric patterns and soft cotton tassels. Includes a plush feather-down insert for ultimate comfort.',
    categorySlug: 'cushions-throws',
    basePrice: 5500,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Cream & Mustard', sku: 'MITP-CM', stock: 30 },
      { name: 'Navy & Gold', sku: 'MITP-NG', stock: 25 },
      { name: 'Rust & Cream', sku: 'MITP-RC', stock: 28 },
    ],
    imageCount: 4,
  },
  {
    name: 'Chunky Knit Throw Blanket',
    slug: 'chunky-knit-throw-blanket',
    description:
      'Luxuriously soft chunky knit throw blanket made from premium acrylic yarn. This statement piece adds texture and warmth to any sofa or bed. Machine washable for easy care.',
    categorySlug: 'cushions-throws',
    basePrice: 8800,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Ivory', sku: 'CKTB-IVY', stock: 20 },
      { name: 'Dusty Rose', sku: 'CKTB-DRS', stock: 18 },
      { name: 'Slate Grey', sku: 'CKTB-SGR', stock: 22 },
      { name: 'Sage', sku: 'CKTB-SAG', stock: 15 },
    ],
    imageCount: 3,
  },
  {
    name: 'Linen Blend Cushion Cover Set',
    slug: 'linen-blend-cushion-cover-set',
    description:
      'Set of 2 premium linen-cotton blend cushion covers with hidden zipper closure. Features a beautiful natural texture and pre-washed softness. Inserts not included.',
    categorySlug: 'cushions-throws',
    basePrice: 4400,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Natural (18x18)', sku: 'LBCC-N18', stock: 35 },
      { name: 'Oatmeal (18x18)', sku: 'LBCC-O18', stock: 30 },
      { name: 'Charcoal (20x20)', sku: 'LBCC-C20', priceOverride: 4950, stock: 25 },
    ],
    imageCount: 2,
  },

  // ========== HOME DECOR - Mirrors ==========
  {
    name: 'Sunburst Rattan Wall Mirror',
    slug: 'sunburst-rattan-wall-mirror',
    description:
      'Make a statement with this gorgeous sunburst mirror featuring hand-woven natural rattan rays. The warm, organic texture brings coastal-boho charm to any wall. Includes mounting hardware.',
    categorySlug: 'mirrors',
    basePrice: 13200,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Natural Rattan', sku: 'SRWM-NAT', stock: 15 },
      { name: 'Whitewash', sku: 'SRWM-WW', stock: 12 },
    ],
    imageCount: 3,
  },
  {
    name: 'Arch Floor Mirror',
    slug: 'arch-floor-mirror',
    description:
      'Elegant full-length arched mirror with slim metal frame. This timeless piece makes any room feel larger and brighter. Can be leaned against wall or mounted.',
    categorySlug: 'mirrors',
    basePrice: 22000,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Matte Black', sku: 'AFM-BLK', stock: 10 },
      { name: 'Brass', sku: 'AFM-BRS', priceOverride: 25300, stock: 8 },
      { name: 'White', sku: 'AFM-WHT', stock: 12 },
    ],
    imageCount: 4,
  },

  // ========== HOME DECOR - Rugs & Carpets ==========
  {
    name: 'Vintage-Inspired Persian Area Rug',
    slug: 'vintage-inspired-persian-area-rug',
    description:
      'Bring timeless elegance to your space with this vintage-inspired Persian rug. Machine-woven with distressed finishing for an authentic antique look. Low pile makes it perfect for high-traffic areas.',
    categorySlug: 'rugs-carpets',
    basePrice: 16500,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: '5x7 ft - Ivory/Blue', sku: 'VIPR-57IB', stock: 15 },
      { name: '5x7 ft - Rust/Gold', sku: 'VIPR-57RG', stock: 12 },
      { name: '8x10 ft - Ivory/Blue', sku: 'VIPR-810IB', priceOverride: 30800, stock: 8 },
      { name: '8x10 ft - Rust/Gold', sku: 'VIPR-810RG', priceOverride: 30800, stock: 10 },
    ],
    imageCount: 4,
  },
  {
    name: 'Handwoven Jute Runner',
    slug: 'handwoven-jute-runner',
    description:
      'Natural jute runner handwoven by skilled artisans. Features a beautiful braided texture and adds organic warmth to hallways, entryways, or kitchens. Non-slip backing included.',
    categorySlug: 'rugs-carpets',
    basePrice: 7600,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: '2x6 ft', sku: 'HJR-26', stock: 25 },
      { name: '2.5x8 ft', sku: 'HJR-258', priceOverride: 9900, stock: 20 },
      { name: '2.5x10 ft', sku: 'HJR-2510', priceOverride: 12100, stock: 15 },
    ],
    imageCount: 2,
  },

  // ========== LIFESTYLE - Journals & Stationery ==========
  {
    name: 'Leather-Bound Gratitude Journal',
    slug: 'leather-bound-gratitude-journal',
    description:
      'Start each day with intention using this beautifully crafted gratitude journal. Features genuine leather cover, 365 guided prompts, and acid-free paper. Includes ribbon bookmark and elastic closure.',
    categorySlug: 'journals-stationery',
    basePrice: 3850,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Cognac Brown', sku: 'LBGJ-COG', stock: 40 },
      { name: 'Forest Green', sku: 'LBGJ-FOR', stock: 35 },
      { name: 'Navy Blue', sku: 'LBGJ-NAV', stock: 38 },
    ],
    imageCount: 4,
  },
  {
    name: 'Minimalist Desk Organizer Set',
    slug: 'minimalist-desk-organizer-set',
    description:
      'Declutter your workspace with this elegant 5-piece desk organizer set. Includes pen holder, paper tray, business card holder, memo pad holder, and clip dish. Made from sustainable bamboo.',
    categorySlug: 'journals-stationery',
    basePrice: 6000,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Natural Bamboo', sku: 'MDOS-NAT', stock: 25 },
      { name: 'White Bamboo', sku: 'MDOS-WHT', stock: 20 },
    ],
    imageCount: 3,
  },
  {
    name: 'Botanical Stationery Collection',
    slug: 'botanical-stationery-collection',
    description:
      'Express yourself with this charming botanical stationery set. Includes 20 flat cards, 20 lined envelopes, and a matching notepad. Printed on recycled paper with soy-based inks.',
    categorySlug: 'journals-stationery',
    basePrice: 3200,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Wildflower', sku: 'BSC-WF', stock: 30 },
      { name: 'Eucalyptus', sku: 'BSC-EUC', stock: 28 },
      { name: 'Fern', sku: 'BSC-FRN', stock: 32 },
    ],
    imageCount: 3,
  },

  // ========== LIFESTYLE - Wellness ==========
  {
    name: 'Premium Cork Yoga Mat',
    slug: 'premium-cork-yoga-mat',
    description:
      'Elevate your practice with this eco-friendly cork yoga mat. Natural cork surface provides excellent grip that improves with moisture. Backed with natural rubber for cushioning and stability.',
    categorySlug: 'wellness',
    basePrice: 9900,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Standard (68x24 inches)', sku: 'PCYM-STD', stock: 30 },
      { name: 'Long (72x26 inches)', sku: 'PCYM-LNG', priceOverride: 11000, stock: 20 },
    ],
    imageCount: 4,
  },
  {
    name: 'Meditation Cushion Set',
    slug: 'meditation-cushion-set',
    description:
      'Create your perfect meditation space with this set including a zafu cushion and zabuton mat. Filled with organic buckwheat hulls for adjustable support. Removable covers are machine washable.',
    categorySlug: 'wellness',
    basePrice: 8200,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Dusty Lavender', sku: 'MCS-LAV', stock: 18 },
      { name: 'Sage Green', sku: 'MCS-SGR', stock: 20 },
      { name: 'Charcoal', sku: 'MCS-CHR', stock: 22 },
      { name: 'Natural Linen', sku: 'MCS-NLN', stock: 15 },
    ],
    imageCount: 3,
  },
  {
    name: 'Essential Oil Diffuser & Starter Kit',
    slug: 'essential-oil-diffuser-starter-kit',
    description:
      'Transform your space with aromatherapy. This ceramic ultrasonic diffuser features 7 LED color options and auto shut-off. Includes 4 pure essential oils: lavender, eucalyptus, peppermint, and sweet orange.',
    categorySlug: 'wellness',
    basePrice: 5500,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'White Ceramic', sku: 'EODK-WHT', stock: 35 },
      { name: 'Grey Stone', sku: 'EODK-GRY', stock: 30 },
      { name: 'Terracotta', sku: 'EODK-TER', stock: 25 },
    ],
    imageCount: 4,
  },
  {
    name: 'Weighted Sleep Blanket',
    slug: 'weighted-sleep-blanket',
    description:
      'Experience deeper, more restful sleep with our premium weighted blanket. Features evenly distributed glass beads and breathable cotton cover. Reduces anxiety and promotes relaxation.',
    categorySlug: 'wellness',
    basePrice: 13200,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: '10 lbs - Grey', sku: 'WSB-10G', stock: 20 },
      { name: '15 lbs - Grey', sku: 'WSB-15G', stock: 25 },
      { name: '20 lbs - Grey', sku: 'WSB-20G', priceOverride: 15400, stock: 15 },
      { name: '15 lbs - Navy', sku: 'WSB-15N', stock: 18 },
    ],
    imageCount: 3,
  },

  // ========== LIFESTYLE - Bags & Accessories ==========
  {
    name: 'Canvas & Leather Tote Bag',
    slug: 'canvas-leather-tote-bag',
    description:
      'The perfect everyday tote crafted from durable organic canvas with genuine leather handles and accents. Features interior pockets, magnetic closure, and reinforced bottom. Fits laptops up to 15 inches.',
    categorySlug: 'bags-accessories',
    basePrice: 8700,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Natural/Tan', sku: 'CLTB-NT', stock: 22 },
      { name: 'Navy/Brown', sku: 'CLTB-NB', stock: 20 },
      { name: 'Olive/Tan', sku: 'CLTB-OT', stock: 18 },
    ],
    imageCount: 4,
  },
  {
    name: 'Woven Market Basket',
    slug: 'woven-market-basket',
    description:
      'Handwoven from sustainable palm leaves by skilled artisans. This versatile basket is perfect for farmers markets, beach trips, or home storage. Features sturdy leather handles.',
    categorySlug: 'bags-accessories',
    basePrice: 5000,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Natural', sku: 'WMB-NAT', stock: 25 },
      { name: 'Natural with Pom-Poms', sku: 'WMB-POM', priceOverride: 5800, stock: 18 },
    ],
    imageCount: 3,
  },
  {
    name: 'Minimalist Leather Wallet',
    slug: 'minimalist-leather-wallet',
    description:
      'Slim, functional, and beautifully crafted from full-grain leather. Holds 6 cards plus cash without the bulk. Features RFID-blocking technology and develops a beautiful patina over time.',
    categorySlug: 'bags-accessories',
    basePrice: 6000,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Black', sku: 'MLW-BLK', stock: 30 },
      { name: 'Cognac', sku: 'MLW-COG', stock: 28 },
      { name: 'Navy', sku: 'MLW-NAV', stock: 25 },
    ],
    imageCount: 3,
  },

  // ========== LIFESTYLE - Kitchen & Dining ==========
  {
    name: 'Artisan Stoneware Dinnerware Set',
    slug: 'artisan-stoneware-dinnerware-set',
    description:
      'Elevate your table with this handcrafted 16-piece stoneware set. Includes 4 dinner plates, 4 salad plates, 4 bowls, and 4 mugs. Each piece features a reactive glaze finish making it uniquely beautiful.',
    categorySlug: 'kitchen-dining',
    basePrice: 20900,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Speckled White', sku: 'ASD-SW', stock: 12 },
      { name: 'Sage Green', sku: 'ASD-SG', stock: 10 },
      { name: 'Ocean Blue', sku: 'ASD-OB', stock: 8 },
    ],
    imageCount: 5,
  },
  {
    name: 'Bamboo Serving Board Collection',
    slug: 'bamboo-serving-board-collection',
    description:
      'Set of 3 sustainably sourced bamboo serving boards in varying sizes and shapes. Perfect for cheese boards, charcuterie, or as stylish trivets. Food-safe finish and easy to clean.',
    categorySlug: 'kitchen-dining',
    basePrice: 5500,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Natural', sku: 'BSBC-NAT', stock: 30 },
      { name: 'Walnut Stain', sku: 'BSBC-WAL', stock: 25 },
    ],
    imageCount: 3,
  },
  {
    name: 'Linen Table Runner',
    slug: 'linen-table-runner',
    description:
      'Add effortless elegance to your dining table with this premium linen runner. Pre-washed for a soft, relaxed texture. Features frayed edges for a modern, organic look.',
    categorySlug: 'kitchen-dining',
    basePrice: 4300,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Natural (14x72)', sku: 'LTR-N72', stock: 25 },
      { name: 'Sage (14x72)', sku: 'LTR-S72', stock: 20 },
      { name: 'Charcoal (14x72)', sku: 'LTR-C72', stock: 22 },
      { name: 'Terracotta (14x90)', sku: 'LTR-T90', priceOverride: 4950, stock: 18 },
    ],
    imageCount: 3,
  },
  {
    name: 'Hand-Blown Glass Carafe Set',
    slug: 'hand-blown-glass-carafe-set',
    description:
      'Stunning hand-blown borosilicate glass carafe with matching glasses. Set includes 1 carafe (1.2L) and 4 tumblers. Perfect for water, wine, or cocktails. Dishwasher safe.',
    categorySlug: 'kitchen-dining',
    basePrice: 7100,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Clear', sku: 'HBGC-CLR', stock: 20 },
      { name: 'Smoke Grey', sku: 'HBGC-SMK', stock: 15 },
      { name: 'Amber', sku: 'HBGC-AMB', stock: 18 },
    ],
    imageCount: 4,
  },

  // ========== LIFESTYLE - Gift Sets ==========
  {
    name: 'Self-Care Spa Gift Box',
    slug: 'self-care-spa-gift-box',
    description:
      'The ultimate gift of relaxation. This curated box includes a soy candle, bath salts, body lotion, lip balm, and silk eye mask. Beautifully packaged in a reusable keepsake box.',
    categorySlug: 'gift-sets',
    basePrice: 8800,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Lavender Bliss', sku: 'SCSG-LAV', stock: 20 },
      { name: 'Rose Garden', sku: 'SCSG-RSE', stock: 18 },
      { name: 'Citrus Sunrise', sku: 'SCSG-CIT', stock: 22 },
    ],
    imageCount: 4,
  },
  {
    name: 'Cozy Night In Bundle',
    slug: 'cozy-night-in-bundle',
    description:
      'Everything you need for the perfect cozy evening. Includes a chunky knit throw blanket, soy candle, gourmet hot chocolate mix, and ceramic mug. Gift-wrapped and ready to give.',
    categorySlug: 'gift-sets',
    basePrice: 11000,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Ivory & Vanilla', sku: 'CNIB-IV', stock: 15 },
      { name: 'Grey & Cinnamon', sku: 'CNIB-GC', stock: 12 },
    ],
    imageCount: 3,
  },
  {
    name: 'New Home Essentials Kit',
    slug: 'new-home-essentials-kit',
    description:
      'The perfect housewarming gift! This thoughtfully curated set includes a scented candle, linen tea towels (set of 2), olive wood coasters, and a small potted faux plant.',
    categorySlug: 'gift-sets',
    basePrice: 7600,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Classic', sku: 'NHEK-CLS', stock: 18 },
      { name: 'Modern', sku: 'NHEK-MOD', stock: 15 },
    ],
    imageCount: 4,
  },
  {
    name: 'Mindfulness Starter Set',
    slug: 'mindfulness-starter-set',
    description:
      'Begin your mindfulness journey with this comprehensive starter kit. Includes a meditation cushion, gratitude journal, essential oil roller, and guided meditation card deck.',
    categorySlug: 'gift-sets',
    basePrice: 9900,
    status: ProductStatus.PUBLISHED,
    variants: [
      { name: 'Sage & Natural', sku: 'MSS-SN', stock: 20 },
      { name: 'Dusty Rose & Cream', sku: 'MSS-DRC', stock: 18 },
    ],
    imageCount: 4,
  },

  // ========== DRAFT PRODUCTS (for testing different statuses) ==========
  {
    name: 'Macrame Wall Hanging - Coming Soon',
    slug: 'macrame-wall-hanging-coming-soon',
    description:
      'Beautiful handcrafted macrame wall hanging made from 100% cotton rope. Features intricate knotwork and natural wooden dowel. Coming soon!',
    categorySlug: 'wall-art',
    basePrice: 7250,
    status: ProductStatus.DRAFT,
    variants: [
      { name: 'Natural White', sku: 'MWH-NW', stock: 0 },
      { name: 'Sage Dipped', sku: 'MWH-SD', stock: 0 },
    ],
    imageCount: 2,
  },
  {
    name: 'Ceramic Oil Burner - Preview',
    slug: 'ceramic-oil-burner-preview',
    description:
      'Elegant ceramic oil burner for essential oils. Features a removable dish and space for tea light candle. Available soon.',
    categorySlug: 'wellness',
    basePrice: 3300,
    status: ProductStatus.DRAFT,
    variants: [
      { name: 'Matte White', sku: 'COB-MW', stock: 0 },
      { name: 'Terracotta', sku: 'COB-TER', stock: 0 },
    ],
    imageCount: 2,
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function clearData() {
  console.log('🗑️  Clearing existing categories and products...');
  await ProductModel.deleteMany({});
  await CategoryModel.deleteMany({});
  console.log('✅ Cleared existing data');
}

async function seedCategories(): Promise<Map<string, mongoose.Types.ObjectId>> {
  console.log('\n📁 Seeding categories...');
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();

  for (const cat of categories) {
    // Create parent category
    const parent = await CategoryModel.create({
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      order: cat.order,
      parentId: null,
    });

    categoryMap.set(cat.slug, parent._id as mongoose.Types.ObjectId);
    console.log(`   ✅ Created category: ${cat.name}`);

    // Create subcategories
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        const child = await CategoryModel.create({
          name: sub.name,
          slug: sub.slug,
          imageUrl: sub.imageUrl,
          order: sub.order,
          parentId: parent._id,
        });

        categoryMap.set(sub.slug, child._id as mongoose.Types.ObjectId);
        console.log(`      ✅ Created subcategory: ${sub.name}`);
      }
    }
  }

  return categoryMap;
}

async function createProducts(categoryMap: Map<string, mongoose.Types.ObjectId>): Promise<void> {
  console.log('\n📦 Seeding products...');
  let created = 0;
  let imageSeed = 1000;

  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) {
      console.log(`   ⚠️  Category not found for product: ${product.name}`);
      continue;
    }

    // Generate variants with IDs
    const variants = product.variants.map((v) => ({
      id: generateId(),
      name: v.name,
      sku: v.sku,
      priceOverride: v.priceOverride,
      stock: v.stock,
      attributes: v.attributes || {},
    }));

    // Generate placeholder images
    const images = Array.from({ length: product.imageCount }, (_, idx) => ({
      id: generateId(),
      url: getPlaceholderImage(imageSeed++),
      order: idx,
    }));

    await ProductModel.create({
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId,
      status: product.status,
      basePrice: product.basePrice,
      currency: 'BDT',
      variants,
      images,
      meta: product.meta || {
        title: product.name,
        description: product.description.substring(0, 160),
      },
    });

    const statusIcon = product.status === ProductStatus.PUBLISHED ? '🟢' : '⚪';
    console.log(`   ${statusIcon} Created: ${product.name}`);
    created++;
  }

  console.log(`\n✅ Created ${created} products`);
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const shouldClear = process.argv.includes('--clear');

  console.log('🌱 Lunaz Product Seed Script');
  console.log('============================\n');

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  try {
    if (shouldClear) {
      await clearData();
    }

    // Check for existing data
    const existingCategories = await CategoryModel.countDocuments();
    const existingProducts = await ProductModel.countDocuments();

    if (existingCategories > 0 || existingProducts > 0) {
      console.log(
        `\nℹ️  Found existing data: ${existingCategories} categories, ${existingProducts} products`
      );
      console.log('   Run with --clear flag to remove existing data before seeding\n');
    }

    // Seed data
    const categoryMap = await seedCategories();
    await createProducts(categoryMap);

    // Summary
    const totalCategories = await CategoryModel.countDocuments();
    const totalProducts = await ProductModel.countDocuments();
    const publishedProducts = await ProductModel.countDocuments({
      status: ProductStatus.PUBLISHED,
    });
    const draftProducts = await ProductModel.countDocuments({
      status: ProductStatus.DRAFT,
    });

    console.log('\n============================');
    console.log('📊 Seeding Complete!');
    console.log('============================');
    console.log(`   Categories: ${totalCategories}`);
    console.log(`   Products:   ${totalProducts}`);
    console.log(`     - Published: ${publishedProducts}`);
    console.log(`     - Draft:     ${draftProducts}`);
    console.log('');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main().catch((err) => {
  console.error('❌ Error seeding products:', err);
  process.exit(1);
});
