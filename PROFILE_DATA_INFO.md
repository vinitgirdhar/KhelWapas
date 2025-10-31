# Profile Data Information

## Current Status

✅ **Addresses and Payment Methods are now working correctly!**

### What Was Fixed

1. **API Route Issues**
   - Fixed `orderBy` parameter format in addresses route
   - Fixed `orderBy` parameter format in payment methods route
   - Fixed boolean to integer conversion for `isDefault` field
   - Fixed `updateMany` calls to use correct parameter format

2. **Data Type Conversions**
   - `isDefault`: Now correctly uses 1 (true) or 0 (false)
   - All create/update operations properly convert boolean to integer

## Test Data

✅ **All 10 user profiles now have complete data!**

Each user has been seeded with:

### Addresses (2 per user)
1. **Home** (Default)
   - Full Name: [User's name]
   - Phone: 9876543210
   - Address: Random number + MG Road, Mumbai, Maharashtra 400001

2. **Office**
   - Full Name: [User's name]
   - Phone: 9876543210
   - Address: Random number + Bandra West, Mumbai, Maharashtra 400050

### Payment Methods (2 per user)
1. **My Visa Card** (Default)
   - Type: Card
   - Card Type: Visa
   - Last 4 Digits: Random 4 digits
   - Card Holder: [User's name]
   - Expiry: 12/2025

2. **Paytm UPI**
   - Type: UPI
   - UPI ID: [username]@paytm

### Users with Complete Profiles
1. Kashmira Shah (kashmira@gmail.com)
2. Rahul Sharma (rahul.sharma@gmail.com)
3. Priya Patel (priya.patel@gmail.com)
4. Amit Kumar (amit.kumar@gmail.com)
5. Sneha Gupta (sneha.gupta@gmail.com)
6. Vikash Singh (vikash.singh@gmail.com)
7. Anjali Mehta (anjali.mehta@gmail.com)
8. Rohan Joshi (rohan.joshi@gmail.com)
9. Kavya Reddy (kavya.reddy@gmail.com)
10. Arjun Nair (arjun.nair@gmail.com)

**Total:** 20 addresses and 20 payment methods across all users

## How to Test

1. **Login as test user:**
   ```
   Email: kashmira@gmail.com
   Password: user@123
   ```

2. **Navigate to Profile Section**
   - Go to Profile → Addresses
   - Go to Profile → Payment Methods

3. **You should now see:**
   - 2 addresses listed
   - 2 payment methods listed
   - Ability to add/edit/delete addresses
   - Ability to add/edit/delete payment methods

## Testing with Any User

All users now have complete profile data! You can test with any of the 10 users:

1. Login with any user (password: `user@123`)
2. Go to Profile section
3. View existing addresses and payment methods
4. Add, edit, or delete items as needed

The data is properly stored in the SQLite database and persists across sessions.

## API Endpoints

### Addresses
- `GET /api/profile/addresses?userId={userId}` - Get all addresses
- `POST /api/profile/addresses` - Create new address
- `PUT /api/profile/addresses/[id]` - Update address
- `DELETE /api/profile/addresses/[id]` - Delete address

### Payment Methods
- `GET /api/profile/payment-methods?userId={userId}` - Get all payment methods
- `POST /api/profile/payment-methods` - Create new payment method

## Database Schema

### Addresses Table
```sql
CREATE TABLE addresses (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  fullName TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postalCode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  isDefault INTEGER NOT NULL DEFAULT 0,  -- 1 = true, 0 = false
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### Payment Methods Table
```sql
CREATE TABLE payment_methods (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'card', 'upi', 'netbanking', 'wallet'
  cardLast4 TEXT,
  cardType TEXT,  -- 'visa', 'mastercard', 'rupay', 'amex'
  cardHolder TEXT,
  expiryMonth INTEGER,
  expiryYear INTEGER,
  upiId TEXT,
  nickname TEXT,
  isDefault INTEGER NOT NULL DEFAULT 0,  -- 1 = true, 0 = false
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## Notes

- The original Prisma database didn't include addresses or payment methods in the seed data
- After migration, the database was empty for these tables
- Sample data has been added for testing purposes
- All API routes are working correctly
- Users can now add their own addresses and payment methods through the UI
