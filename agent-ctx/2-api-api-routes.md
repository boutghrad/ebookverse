# Task 2-API: EbookVerse API Routes

## Summary
Created all 10 API route files for the EbookVerse eBook Store platform, covering books, categories, orders, reviews, newsletter, admin dashboard, and user registration.

## Files Created

### 1. `/src/app/api/books/route.ts`
- **GET** - List books with full filtering support:
  - `category` - Filter by category slug
  - `search` - Search in title, author, description
  - `sort` - Sort by: newest, popular, price-low, price-high, rating
  - `page` / `limit` - Pagination (defaults: page=1, limit=12)
  - `featured` / `trending` - Boolean filters
  - Returns books with category info and pagination metadata
- **POST** - Create book (admin only):
  - Validates required fields (title, slug, description, author, coverImage, categoryId, price)
  - Checks slug uniqueness
  - Verifies category exists
  - Returns created book with category relation

### 2. `/src/app/api/books/[slug]/route.ts`
- **GET** - Get single book by slug:
  - Includes category details and all reviews with user info
  - Returns 404 if not found

### 3. `/src/app/api/categories/route.ts`
- **GET** - List all categories with book count:
  - Uses `_count` aggregation for efficient counting
  - Returns categories sorted alphabetically with `bookCount` field

### 4. `/src/app/api/orders/route.ts`
- **GET** - List user's orders (auth required):
  - Includes order items with book details (title, slug, coverImage, author)
  - Sorted by newest first
- **POST** - Create order (auth required):
  - Accepts `items` array with `bookId` and `quantity`
  - Validates all books exist
  - Calculates total using discount price when available
  - Creates order with order items
  - Increments `totalSales` on purchased books
  - Clears user's cart after order creation

### 5. `/src/app/api/orders/[id]/route.ts`
- **GET** - Get single order details (auth required):
  - Includes order items with book details and user info
  - Access control: only order owner or admin can view

### 6. `/src/app/api/reviews/route.ts`
- **POST** - Create review (auth required):
  - Validates required fields (bookId, rating, comment)
  - Validates rating range (1-5)
  - Checks book existence
  - Prevents duplicate reviews (one per user per book)
  - Auto-updates book's `rating` (average) and `totalReviews`

### 7. `/src/app/api/newsletter/route.ts`
- **POST** - Subscribe email:
  - Validates email format
  - Returns friendly message if already subscribed (200)
  - Creates new subscription (201)

### 8. `/src/app/api/admin/stats/route.ts`
- **GET** - Dashboard stats (admin only):
  - Returns: totalUsers, totalBooks, totalOrders, totalRevenue, totalReviews, totalNewsletterSubs
  - Includes 5 most recent orders with user and book details
  - Includes top 5 selling books
  - Monthly revenue data for last 6 months

### 9. `/src/app/api/admin/users/route.ts`
- **GET** - List all users (admin only):
  - Supports `search` (name/email), `page`, `limit` query params
  - Includes order count and review count per user
  - Excludes password field

### 10. `/src/app/api/auth/register/route.ts`
- **POST** - Register new user:
  - Validates email format and password length (min 6 chars)
  - Checks email uniqueness
  - Hashes password with bcryptjs (12 salt rounds)
  - Returns user without password field

## Authentication & Authorization
- All protected routes use `getServerSession(authOptions)` for session validation
- Admin routes check `role === "ADMIN"` from the session
- Order detail route enforces owner-or-admin access control

## Error Handling
- All routes have try/catch with console.error logging
- Consistent JSON error responses with appropriate HTTP status codes:
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (no session)
  - 403: Forbidden (insufficient permissions)
  - 404: Not Found
  - 409: Conflict (duplicate entries)
  - 500: Internal Server Error

## Lint Status
All new API routes pass lint checks. The only lint error is a pre-existing issue in `ThemeToggle.tsx` unrelated to this task.
