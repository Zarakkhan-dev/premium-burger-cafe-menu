import mongoose from 'mongoose';
import { CategoryType } from './category.model';

interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  calories: string;
  category: mongoose.Types.ObjectId | CategoryType;
  image?: string;
  isActive: boolean;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
  stockStatus: string;
}

const productSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
    get: (v: number) => parseFloat(v.toFixed(2)),
    set: (v: number) => parseFloat(v.toFixed(2)),
  },
  calories: {
    type: String,
    required: [true, 'Calories is required'],
    trim: true,
    min: [0, 'Calories must be positive'],
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
    index: true,
  },
  image: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sku: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
});

// Generate SKU before saving
productSchema.pre('save', async function() {
  if (!this.sku) {
    this.sku = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  
  // If image is set, make sure it has the full path
  if (this.image && !this.image.startsWith('http') && !this.image.startsWith('/')) {
    this.image = `/uploads/${this.image}`;
  }
});

// Populate category by default
productSchema.pre(/^find/, function() {
  (this as any).populate({
    path: 'category',
    select: 'name _id',
  });
});

// Add indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ calories: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });

export const Product = mongoose.models.Product as mongoose.Model<IProduct> || mongoose.model<IProduct>('Product', productSchema);
export type ProductType = IProduct;