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
    const format = searchParams.get('format') || 'csv';

    // Fetch all products
    const products = await Product.find({}).lean();
    const categories = await Category.find({}).lean();

    // Create category map for quick lookup
    const categoryMap = new Map();
    categories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), cat.name);
    });

    if (format === 'csv') {
      return exportCSV(products, categoryMap);
    } else if (format === 'excel' || format === 'xlsx') {
      // For Excel, return CSV for now (can be enhanced later)
      return exportCSV(products, categoryMap);
    } else if (format === 'pdf') {
      return exportPDF(products, categoryMap);
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use csv, excel, or pdf.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error exporting products:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to export products' },
      { status: 500 }
    );
  }
}

function exportCSV(products: any[], categoryMap: Map<string, string>) {
  // Collect all unique attribute keys from all products
  const attributeKeys = new Set<string>();
  products.forEach((product) => {
    if (product.attributes && typeof product.attributes === 'object') {
      Object.keys(product.attributes).forEach((key) => attributeKeys.add(key));
    }
  });

  const headers = [
    'Name',
    'Description',
    'Price',
    'Category',
    'Stock',
    'Featured',
    'Images',
    'Cover Image',
    ...Array.from(attributeKeys).map((key) => `Attribute: ${key}`),
  ];

  const rows = products.map((product) => {
    const categoryName = categoryMap.get(product.category?.toString()) || product.category || '';
    const attributes = product.attributes || {};
    return [
      product.name || '',
      product.description || '',
      product.price || 0,
      categoryName,
      product.stock || 0,
      product.featured ? 'true' : 'false',
      (product.images || []).join(';'),
      product.coverImage || '',
      ...Array.from(attributeKeys).map((key) => {
        const value = attributes[key];
        return value !== undefined && value !== null ? String(value) : '';
      }),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="products_export_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

function exportPDF(products: any[], categoryMap: Map<string, string>) {
  // Simple PDF export using text format
  // For better PDF generation, consider using pdfkit or similar library
  let pdfContent = 'PRODUCTS EXPORT\n';
  pdfContent += `Generated: ${new Date().toLocaleString()}\n`;
  pdfContent += `Total Products: ${products.length}\n\n`;
  pdfContent += '='.repeat(80) + '\n\n';

  products.forEach((product, index) => {
    const categoryName = categoryMap.get(product.category?.toString()) || product.category || '';
    pdfContent += `Product ${index + 1}:\n`;
    pdfContent += `Name: ${product.name || 'N/A'}\n`;
    pdfContent += `Description: ${product.description || 'N/A'}\n`;
    pdfContent += `Price: $${product.price || 0}\n`;
    pdfContent += `Category: ${categoryName}\n`;
    pdfContent += `Stock: ${product.stock || 0}\n`;
    pdfContent += `Featured: ${product.featured ? 'Yes' : 'No'}\n`;
    pdfContent += `Images: ${(product.images || []).length} image(s)\n`;
    pdfContent += '-'.repeat(80) + '\n\n';
  });

  return new NextResponse(pdfContent, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="products_export_${new Date().toISOString().split('T')[0]}.pdf"`,
    },
  });
}

