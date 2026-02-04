# Project Structure

This document outlines the complete project structure for the e-commerce platform.

## Root Directory Structure

```
teezee/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── products/                # Product pages
│   │   ├── [id]/
│   │   └── page.tsx
│   ├── cart/                    # Shopping cart
│   ├── wishlist/                # Wishlist
│   ├── checkout/                # Checkout process
│   ├── orders/                  # Order management
│   │   └── [id]/
│   ├── profile/                 # User profile
│   │   └── addresses/
│   ├── admin/                   # Admin dashboard
│   │   ├── dashboard/
│   │   ├── products/
│   │   │   ├── create/
│   │   │   └── [id]/edit/
│   │   ├── orders/
│   │   │   └── [id]/
│   │   ├── users/
│   │   ├── analytics/
│   │   ├── inventory/
│   │   └── layout.tsx
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   └── register/
│   │   ├── products/
│   │   │   ├── [id]/
│   │   │   ├── search/
│   │   │   ├── categories/
│   │   │   └── upload-image/
│   │   ├── cart/
│   │   │   └── [id]/
│   │   ├── wishlist/
│   │   │   └── [id]/
│   │   ├── orders/
│   │   │   ├── [id]/
│   │   │   └── [id]/status/
│   │   ├── payments/
│   │   │   ├── create-intent/
│   │   │   ├── webhook/
│   │   │   └── verify/
│   │   ├── users/
│   │   │   ├── profile/
│   │   │   └── addresses/
│   │   │       └── [id]/
│   │   └── admin/
│   │       ├── products/
│   │       │   └── [id]/
│   │       ├── orders/
│   │       │   └── [id]/
│   │       ├── users/
│   │       ├── analytics/
│   │       └── inventory/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                  # React components
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Pagination.tsx
│   │   ├── Select.tsx
│   │   └── Textarea.tsx
│   ├── shared/                 # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AdminRoute.tsx
│   ├── auth/                   # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthButton.tsx
│   ├── products/               # Product components
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductSearch.tsx
│   │   ├── ProductImage.tsx
│   │   ├── ProductReviews.tsx
│   │   └── ProductRating.tsx
│   ├── cart/                   # Cart components
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CartIcon.tsx
│   ├── wishlist/               # Wishlist components
│   │   ├── WishlistItem.tsx
│   │   └── WishlistIcon.tsx
│   ├── checkout/               # Checkout components
│   │   ├── CheckoutForm.tsx
│   │   ├── AddressForm.tsx
│   │   ├── OrderSummary.tsx
│   │   └── PaymentForm.tsx
│   ├── orders/                 # Order components
│   │   ├── OrderCard.tsx
│   │   ├── OrderStatus.tsx
│   │   └── OrderTracking.tsx
│   ├── profile/                # Profile components
│   │   ├── ProfileForm.tsx
│   │   ├── AddressCard.tsx
│   │   └── OrderHistory.tsx
│   └── admin/                  # Admin components
│       ├── AdminSidebar.tsx
│       ├── ProductForm.tsx
│       ├── ProductTable.tsx
│       ├── OrderTable.tsx
│       ├── UserTable.tsx
│       ├── AnalyticsCard.tsx
│       ├── InventoryAlert.tsx
│       └── ImageUpload.tsx
├── contexts/                   # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── WishlistContext.tsx
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useWishlist.ts
│   ├── useProducts.ts
│   └── useOrders.ts
├── lib/                        # Library utilities
│   ├── mongodb.ts              # MongoDB connection
│   ├── auth.ts                # Auth utilities
│   ├── cloudinary.ts          # Cloudinary integration
│   ├── stripe.ts              # Stripe integration
│   ├── api.ts                 # API client
│   └── utils.ts               # General utilities
├── models/                     # Mongoose models
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   ├── Cart.ts
│   ├── Wishlist.ts
│   ├── Address.ts
│   └── Review.ts
├── types/                      # TypeScript type definitions
│   ├── user.ts
│   ├── product.ts
│   ├── order.ts
│   ├── cart.ts
│   ├── wishlist.ts
│   ├── address.ts
│   ├── review.ts
│   ├── payment.ts
│   └── auth.ts
├── utils/                      # Utility functions
│   ├── validators.ts
│   ├── formatters.ts
│   ├── helpers.ts
│   └── constants.ts
├── config/                     # Configuration files
│   ├── nextauth.ts
│   ├── database.ts
│   ├── stripe.ts
│   └── cloudinary.ts
├── public/                     # Static assets
├── middleware.ts              # Next.js middleware
├── .env.example               # Environment variables template
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── README.md
```

## Key Directories Explained

### `/app`
Next.js 15 App Router structure with:
- Route groups `(auth)` for authentication pages
- Dynamic routes `[id]` for product and order details
- API routes under `/api` for backend endpoints
- Layout files for shared page structure

### `/components`
Organized by feature:
- `ui/` - Reusable UI primitives
- `shared/` - Common layout components
- Feature-specific folders (auth, products, cart, etc.)

### `/contexts`
React Context providers for global state management (Auth, Cart, Wishlist)

### `/hooks`
Custom React hooks for reusable logic

### `/lib`
Library integrations and utilities:
- Database connections
- Third-party service integrations (Stripe, Cloudinary)
- API client utilities

### `/models`
Mongoose schemas for MongoDB collections

### `/types`
TypeScript type definitions for type safety

### `/utils`
Helper functions, validators, formatters, and constants

### `/config`
Configuration files for various services

## API Routes Structure

- `/api/auth` - Authentication endpoints
- `/api/products` - Product CRUD and search
- `/api/cart` - Shopping cart operations
- `/api/wishlist` - Wishlist operations
- `/api/orders` - Order management
- `/api/payments` - Payment processing
- `/api/users` - User profile and addresses
- `/api/admin` - Admin-only endpoints

## Page Routes Structure

- `/` - Homepage
- `/login`, `/register` - Authentication
- `/products` - Product listing
- `/products/[id]` - Product details
- `/cart` - Shopping cart
- `/wishlist` - User wishlist
- `/checkout` - Checkout process
- `/orders` - Order history
- `/orders/[id]` - Order details
- `/profile` - User profile
- `/admin/*` - Admin dashboard routes

