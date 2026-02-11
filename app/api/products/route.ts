import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Product } from '@/lib/models/product.model';
import { Category } from '@/lib/models/category.model';
import { verifyToken } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function authenticate(request: NextRequest): Promise<string> {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    throw new Error('Invalid token');
  }

  return decoded.userId;
}

export async function GET(request: NextRequest) {
  try {
    await authenticate(request);
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let query = Product.find();
    
    if (category) {
      query = query.where('category').equals(category);
    }
    
    if (search) {
      query = query.where({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      });
    }
    
    const products = await query
      .populate('category', 'name _id')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await authenticate(request);
    await connectToDatabase();
    
    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const calories = (formData.get('calories') as string);
    const category = formData.get('category') as string;
    const imageFile = formData.get('image') as File | null;
    
    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }
    
    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }
    
    // Handle image upload
    let imagePath = '';
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Only JPEG, PNG, GIF, and WebP images are allowed' },
          { status: 400 }
        );
      }
      
      // Validate file size (5MB max)
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image size must be less than 5MB' },
          { status: 400 }
        );
      }
      
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      const fs = await import('fs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generate unique filename
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Convert file to buffer and save
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      imagePath = `/uploads/${fileName}`;
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      calories,
      category,
      image: imagePath || '',
    });
    
    await product.populate('category', 'name _id');
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'SKU must be unique' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 400 }
    );
  }
}