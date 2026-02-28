import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const minViews = parseInt(searchParams.get('minViews') || '0');

    // Fetch most viewed products using aggregation
    // This handles products without the views field (treats them as 0)
    const pipeline: any[] = [
      {
        $addFields: {
          viewsCount: { $ifNull: ['$views', 0] },
        },
      },
    ];

    // Add filter if minViews > 0
    if (minViews > 0) {
      pipeline.push({
        $match: { viewsCount: { $gte: minViews } },
      });
    }


    // Sort by views highest to lowest, then by createdAt for stable order
    pipeline.push(
      {
        $sort: { viewsCount: -1, createdAt: -1 },
      },
      {
        $limit: limit,
      }
    );

    const products = await Product.aggregate(pipeline);
    
    // Fetch all categories to map IDs to names
    const categories = await Category.find().lean();
    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      const catId = cat._id.toString();
      categoryMap.set(catId, cat.name);
      categoryMap.set(cat.name, cat.name); // Also map by name in case category is stored as name
    });
    
    console.log(`Most Viewed Products: Found ${products.length} products`);

    const formattedProducts = products.map((p) => {
      // Try to find category name from map
      // Handle different category formats: ObjectId object, string ID, or name
      let categoryName = p.category;
      
      if (p.category) {
        // If category is an ObjectId object, convert to string
        const categoryId = p.category.toString ? p.category.toString() : String(p.category);
        
        // Try to find by ID first
        if (categoryMap.has(categoryId)) {
          categoryName = categoryMap.get(categoryId)!;
        } 
        // Try to find by the original value (might be name)
        else if (categoryMap.has(String(p.category))) {
          categoryName = categoryMap.get(String(p.category))!;
        }
        // If not found, use the original value (might already be a name)
        else {
          categoryName = String(p.category);
        }
      }
      
      return {
        ...p,
        _id: p._id.toString(),
        views: p.views || 0,
        category: categoryName, // Use mapped category name
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length,
    });
  } catch (error: any) {
    console.error('Error fetching most viewed products:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch most viewed products' },
      { status: 500 }
    );
  }
}

