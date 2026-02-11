import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Product } from '@/lib/models/product.model';
import { Category } from '@/lib/models/category.model';
import { verifyToken } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authenticate(request);
    await connectToDatabase();
    
    const product = await Product.findById(id).populate('category', 'name _id');
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authenticate(request);
    await connectToDatabase();
    
    const formData = await request.formData();
    
    // Get existing product to handle image deletion
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Extract form fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
    const calories = formData.get('calories') ? parseInt(formData.get('calories') as string) : undefined;
    const category = formData.get('category') as string;
    const imageFile = formData.get('image') as File | null;
    const removeImage = formData.get('removeImage') === 'true';
    
    // Validate category if being updated
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        );
      }
    }
    
    // Handle image
    let imagePath = existingProduct.image;
    
    if (removeImage && imagePath) {
      // Remove existing image file
      const fileName = imagePath.replace('/uploads/', '');
      const filePath = path.join(process.cwd(), 'public/uploads', fileName);
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
      }
      imagePath = '';
    } else if (imageFile && imageFile.size > 0) {
      // Remove old image if exists
      if (imagePath) {
        const oldFileName = imagePath.replace('/uploads/', '');
        const oldFilePath = path.join(process.cwd(), 'public/uploads', oldFileName);
        if (fs.existsSync(oldFilePath)) {
          await unlink(oldFilePath);
        }
      }
      
      // Validate new file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Only JPEG, PNG, GIF, and WebP images are allowed' },
          { status: 400 }
        );
      }
      
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image size must be less than 5MB' },
          { status: 400 }
        );
      }
      
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generate unique filename and save
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);
      
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      imagePath = `/uploads/${fileName}`;
    }
    
    // Prepare update data
    const updateData: any = {
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      price: price !== undefined ? price : existingProduct.price,
      calories: calories || existingProduct.calories,
      category: category || existingProduct.category,
      image: imagePath,
      updatedAt: new Date(),
    };
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name _id');
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    
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
      { error: error.message || 'Failed to update product' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authenticate(request);
    await connectToDatabase();
    
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete image file if exists
    if (product.image) {
      const fileName = product.image.replace('/uploads/', '');
      const filePath = path.join(process.cwd(), 'public/uploads', fileName);
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
      }
    }
    
    await Product.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 400 }
    );
  }
}