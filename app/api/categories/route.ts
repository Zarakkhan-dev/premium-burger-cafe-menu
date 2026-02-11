import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Category } from '@/lib/models/category.model';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all active categories sorted by display order
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .populate({
        path: 'parentCategory',
        select: 'name',
      })
      .lean();
    
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    
    // Validate
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Create category
    const category = new Category({
      name: data.name.trim(),
      description: data.description?.trim() || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      parentCategory: data.parentCategory || null,
      displayOrder: data.displayOrder || 0,
    });
    
    await category.save();
    
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 400 }
    );
  }
}