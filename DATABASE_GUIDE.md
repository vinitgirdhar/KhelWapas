# SQLite Database Guide

## Quick Reference

### Database Location
- **File:** `database.db` (project root)
- **Driver:** better-sqlite3
- **Mode:** WAL (Write-Ahead Logging)

### Importing the DAL

```typescript
import { userDAL, productDAL, orderDAL, sellRequestDAL, addressDAL, paymentMethodDAL, reviewDAL } from '@/lib/dal'
```

## Common Operations

### Users

```typescript
// Find by email
const user = userDAL.findUnique({ email: 'user@example.com' })

// Find by ID
const user = userDAL.findUnique({ id: 'user-id' })

// Find many with filters
const users = userDAL.findMany({
  where: { role: 'user' },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0
})

// Create user
const newUser = userDAL.create({
  fullName: 'John Doe',
  email: 'john@example.com',
  passwordHash: hashedPassword,
  role: 'user',
  phone: null,
  profilePicture: null,
  status: 'Active',
  rating: 5
})

// Update user
const updated = userDAL.update(
  { id: userId },
  { fullName: 'Jane Doe', email: 'jane@example.com' }
)

// Count users
const count = userDAL.count({ role: 'user' })
```

### Products

```typescript
// Find by ID
const product = productDAL.findUnique({ id: 'product-id' })

// Find many with filters
const products = productDAL.findMany({
  where: { 
    category: 'Badminton',
    type: 'new',
    isAvailable: 1  // Note: Use 1/0 for boolean
  },
  orderBy: { createdAt: 'desc' },
  take: 20
})

// Create product
const newProduct = productDAL.create({
  name: 'Product Name',
  category: 'Badminton',
  type: 'new',
  price: '1999.99',  // Note: String format
  originalPrice: '2499.99',
  grade: 'A',
  imageUrls: JSON.stringify(['/images/product1.jpg']),  // Note: JSON string
  description: 'Product description',
  specs: JSON.stringify({ weight: '85g' }),  // Note: JSON string
  badge: 'New Arrival',
  isAvailable: 1  // Note: 1 for true, 0 for false
})

// Update product
const updated = productDAL.update(
  { id: productId },
  { 
    price: '1799.99',
    isAvailable: 0
  }
)

// Count products
const count = productDAL.count({ isAvailable: 1 })
```

### Orders

```typescript
// Find by ID with user
const order = orderDAL.findUnique({ id: 'order-id' }, { user: true })

// Find many with user data
const orders = orderDAL.findMany({
  where: { paymentStatus: 'paid' },
  include: { user: true },
  orderBy: { createdAt: 'desc' },
  take: 20
})

// Create order
const newOrder = orderDAL.create({
  userId: 'user-id',
  items: JSON.stringify([{ productId: 'p1', quantity: 1, price: 1999 }]),
  totalPrice: '1999.00',
  paymentStatus: 'pending',
  fulfillmentStatus: 'Pending'
})

// Update order
const updated = orderDAL.update(
  { id: orderId },
  { paymentStatus: 'paid', fulfillmentStatus: 'Confirmed' }
)

// Count orders
const count = orderDAL.count({ paymentStatus: 'paid' })

// Aggregate (sum of totalPrice)
const result = orderDAL.aggregate({ _sum: { totalPrice: true } })
const totalRevenue = result._sum.totalPrice
```

### Sell Requests

```typescript
// Find by ID with user
const request = sellRequestDAL.findUnique({ id: 'request-id' }, { user: true })

// Find first matching
const latest = sellRequestDAL.findFirst({
  where: { status: 'Pending' },
  orderBy: { createdAt: 'desc' },
  include: { user: true }
})

// Find many
const requests = sellRequestDAL.findMany({
  where: { status: 'Pending' },
  orderBy: { createdAt: 'desc' }
})

// Create sell request
const newRequest = sellRequestDAL.create({
  userId: 'user-id',
  fullName: 'John Doe',
  email: 'john@example.com',
  category: 'Cricket',
  title: 'Cricket Bat',
  description: 'Lightly used',
  price: '5000.00',
  contactMethod: 'Email',
  contactDetail: 'john@example.com',
  imageUrls: JSON.stringify(['/uploads/img1.jpg']),
  status: 'Pending'
})

// Update sell request
const updated = sellRequestDAL.update(
  { id: requestId },
  { status: 'Approved' }
)

// Count sell requests
const count = sellRequestDAL.count({ status: 'Pending' })
```

### Addresses

```typescript
// Find by ID
const address = addressDAL.findUnique({ id: 'address-id' })

// Find many for user
const addresses = addressDAL.findMany({
  where: { userId: 'user-id' },
  orderBy: { createdAt: 'desc' }
})

// Create address
const newAddress = addressDAL.create({
  userId: 'user-id',
  title: 'Home',
  fullName: 'John Doe',
  phone: '1234567890',
  street: '123 Main St',
  city: 'Mumbai',
  state: 'Maharashtra',
  postalCode: '400001',
  country: 'India',
  isDefault: 1
})

// Update address
const updated = addressDAL.update(
  { id: addressId },
  { isDefault: 1 }
)

// Update many (e.g., unset all defaults)
addressDAL.updateMany(
  { userId: 'user-id', isDefault: 1 },
  { isDefault: 0 }
)

// Delete address
addressDAL.delete({ id: addressId })
```

### Payment Methods

```typescript
// Find by ID
const method = paymentMethodDAL.findUnique({ id: 'method-id' })

// Find many for user
const methods = paymentMethodDAL.findMany({
  where: { userId: 'user-id' }
})

// Create payment method
const newMethod = paymentMethodDAL.create({
  userId: 'user-id',
  type: 'card',
  cardLast4: '1234',
  cardType: 'visa',
  cardHolder: 'John Doe',
  expiryMonth: 12,
  expiryYear: 2025,
  upiId: null,
  nickname: 'My Visa Card',
  isDefault: 1
})

// Update payment method
const updated = paymentMethodDAL.update(
  { id: methodId },
  { isDefault: 1 }
)

// Delete payment method
paymentMethodDAL.delete({ id: methodId })
```

### Reviews

```typescript
// Find many for product
const reviews = reviewDAL.findMany({
  where: { productId: 'product-id' },
  orderBy: { createdAt: 'desc' }
})

// Create review
const newReview = reviewDAL.create({
  rating: 5,
  comment: 'Great product!',
  productId: 'product-id',
  userId: 'user-id',
  reviewerName: 'John Doe',
  reviewerImage: '/images/avatar.jpg'
})
```

## Important Notes

### Data Type Conversions

1. **Prices (Decimal → String)**
   ```typescript
   // When creating/updating
   price: '1999.99'
   
   // When reading
   const price = Number(product.price)
   ```

2. **Booleans (Boolean → Integer)**
   ```typescript
   // When creating/updating
   isAvailable: 1  // true
   isAvailable: 0  // false
   
   // When reading
   const isAvailable = product.isAvailable === 1
   ```

3. **JSON Fields (Object → String)**
   ```typescript
   // When creating/updating
   imageUrls: JSON.stringify(['img1.jpg', 'img2.jpg'])
   specs: JSON.stringify({ weight: '85g' })
   items: JSON.stringify([{ productId: 'p1', quantity: 1 }])
   
   // When reading
   const imageUrls = JSON.parse(product.imageUrls)
   const specs = JSON.parse(product.specs)
   const items = JSON.parse(order.items)
   ```

4. **Dates (DateTime → String)**
   ```typescript
   // Dates are stored as ISO strings
   createdAt: '2024-01-15T10:30:00.000Z'
   
   // Convert to Date object if needed
   const date = new Date(product.createdAt)
   
   // Format for display
   const displayDate = product.createdAt.split('T')[0]  // '2024-01-15'
   ```

### Filtering by Date

```typescript
// Get orders from this month
const now = new Date()
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

const orders = orderDAL.findMany()
  .filter(o => new Date(o.createdAt) >= monthStart)
```

### Aggregations

```typescript
// Sum of order totals
const orders = orderDAL.findMany({ where: { paymentStatus: 'paid' } })
const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0)

// Count by status
const pendingCount = orderDAL.count({ paymentStatus: 'pending' })
const paidCount = orderDAL.count({ paymentStatus: 'paid' })
```

## Database Schema

### Tables
- `users` - User accounts
- `products` - Product catalog
- `orders` - Customer orders
- `sell_requests` - Sell requests from users
- `addresses` - User addresses
- `payment_methods` - User payment methods
- `reviews` - Product reviews

### Indexes
All tables have proper indexes on:
- Primary keys (id)
- Foreign keys (userId, productId, etc.)
- Frequently queried fields (email, status, createdAt, etc.)
- Composite indexes for common query patterns

### Foreign Keys
Foreign key constraints are enabled and enforced:
- `orders.userId` → `users.id`
- `sell_requests.userId` → `users.id`
- `addresses.userId` → `users.id` (CASCADE on delete)
- `payment_methods.userId` → `users.id` (CASCADE on delete)
- `reviews.productId` → `products.id`
- `reviews.userId` → `users.id`

## Performance Tips

1. **Use indexes** - All common query patterns are indexed
2. **Limit results** - Use `take` parameter to limit results
3. **Avoid N+1 queries** - Use `include` to fetch related data
4. **Filter in SQL** - Use `where` clauses instead of filtering in JavaScript
5. **WAL mode** - Already enabled for better concurrency

## Backup & Restore

### Backup
```bash
# Copy the database file
cp database.db database.backup.db
```

### Restore
```bash
# Replace with backup
cp database.backup.db database.db
```

### Export to JSON
```bash
node --import tsx export-data.ts
```

### Import from JSON
```bash
node --import tsx import-data.ts
```
