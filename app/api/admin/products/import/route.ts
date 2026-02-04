import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    let products: any[] = [];

    // Parse file based on type
    if (fileType === 'csv') {
      products = parseCSV(fileContent);
    } else if (fileType === 'excel' || fileType === 'xlsx') {
      // For Excel, we'll need to handle it differently
      // For now, return error suggesting CSV
      return NextResponse.json(
        { error: 'Excel import coming soon. Please use CSV format.' },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please use CSV.' },
        { status: 400 }
      );
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products found in file' },
        { status: 400 }
      );
    }

    // Validate and process products
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      try {
        // Validate required fields
        if (!productData.name || !productData.description || !productData.price) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing required fields (name, description, price)`);
          continue;
        }

        // Validate category
        let categoryId = productData.category;
        if (productData.categoryName) {
          // Try to find category by name
          const category = await Category.findOne({
            $or: [
              { name: productData.categoryName },
              { slug: productData.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
            ],
          });
          if (category) {
            categoryId = category._id.toString();
          } else {
            // Create category if it doesn't exist
            const newCategory = await Category.create({
              name: productData.categoryName,
              description: productData.categoryName,
            });
            categoryId = newCategory._id.toString();
          }
        }

        if (!categoryId) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Category is required`);
          continue;
        }

        // Prepare product data
        const images = productData.images
          ? productData.images.split(',').map((img: string) => img.trim()).filter(Boolean)
          : [];
        
        // If no images provided, use coverImage or empty array
        const finalImages = images.length > 0
          ? images
          : productData.coverImage
          ? [productData.coverImage.trim()]
          : ['https://via.placeholder.com/400']; // Placeholder image if none provided

        // Extract dynamic attributes (columns starting with "Attribute:" or just attribute keys)
        const productAttributes: Record<string, any> = {};
        Object.keys(productData).forEach((key) => {
          if (key.startsWith('Attribute:') || key.startsWith('attribute:')) {
            const attrKey = key.replace(/^attribute:/i, '').trim();
            if (attrKey && productData[key]) {
              productAttributes[attrKey] = productData[key];
            }
          } else if (!['name', 'description', 'price', 'category', 'categoryname', 'stock', 'featured', 'images', 'coverimage', 'cover image'].includes(key.toLowerCase())) {
            // Also capture any other columns that might be attributes
            productAttributes[key] = productData[key];
          }
        });

        const productToCreate = {
          name: productData.name.trim(),
          description: productData.description.trim(),
          price: parseFloat(productData.price) || 0,
          category: categoryId,
          stock: parseInt(productData.stock) || 0,
          featured: productData.featured === 'true' || productData.featured === '1' || productData.featured === 'yes',
          images: finalImages,
          coverImage: productData.coverImage?.trim() || finalImages[0] || '',
          attributes: Object.keys(productAttributes).length > 0 ? productAttributes : {},
        };

        // Check if product already exists
        const existingProduct = await Product.findOne({ name: productToCreate.name });
        if (existingProduct) {
          // Update existing product
          Object.assign(existingProduct, productToCreate);
          await existingProduct.save();
        } else {
          // Create new product
          await Product.create(productToCreate);
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error.message || 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: `Import completed. ${results.success} products imported successfully, ${results.failed} failed.`,
      success: results.success,
      failed: results.failed,
      errors: results.errors.slice(0, 10), // Limit errors to first 10
    });
  } catch (error: any) {
    console.error('Error importing products:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to import products' },
      { status: 500 }
    );
  }
}

function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const product: any = {};
    headers.forEach((header, index) => {
      product[header] = values[index]?.trim() || '';
    });
    products.push(product);
  }

  return products;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

