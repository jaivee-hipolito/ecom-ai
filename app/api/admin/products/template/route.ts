import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';

    // Sample product data
    const sampleProducts = [
      {
        Name: 'Sample Product 1',
        Description: 'This is a sample product description',
        Price: '29.99',
        Category: 'Electronics',
        Stock: '100',
        Featured: 'true',
        Images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
        'Cover Image': 'https://example.com/image1.jpg',
      },
      {
        Name: 'Sample Product 2',
        Description: 'Another sample product description',
        Price: '49.99',
        Category: 'Clothing',
        Stock: '50',
        Featured: 'false',
        Images: 'https://example.com/image3.jpg',
        'Cover Image': 'https://example.com/image3.jpg',
      },
      {
        Name: 'Sample Product 3',
        Description: 'Third sample product description',
        Price: '19.99',
        Category: 'Accessories',
        Stock: '200',
        Featured: 'true',
        Images: 'https://example.com/image4.jpg,https://example.com/image5.jpg',
        'Cover Image': 'https://example.com/image4.jpg',
      },
    ];

    if (format === 'csv') {
      const headers = Object.keys(sampleProducts[0]);
      const rows = sampleProducts.map((product) =>
        headers.map((header) => `"${String(product[header as keyof typeof product]).replace(/"/g, '""')}"`)
      );

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="product_import_template.csv"',
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Template format not supported. Use csv.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error generating template:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to generate template' },
      { status: 500 }
    );
  }
}

