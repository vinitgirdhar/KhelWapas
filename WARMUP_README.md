# 🔥 Route Warmup - Make Pages Load Instantly

This feature pre-compiles and caches all routes on development server startup, eliminating the "cold start" delay when first visiting a page.

## 📋 What It Does

- Visits all important routes in your app
- Triggers Next.js compilation for each page
- Caches compiled pages in memory
- Makes subsequent visits instant!

## 🚀 Usage

### Method 1: Manual Warmup (Recommended)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Wait 10-15 seconds for server to fully start, then:
npm run warmup
```

### Method 2: PowerShell Script (Windows - Automatic)

```bash
# Double-click or run:
.\dev-with-warmup.ps1
```

This automatically:
1. Starts the dev server
2. Waits 15 seconds
3. Warms up all routes
4. Press any key to stop

### Method 3: Manual PowerShell Commands

```powershell
# Start dev server
npm run dev

# In another terminal (wait 10-15 seconds first):
npm run warmup
```

## ✅ What Gets Warmed Up

### Public Pages
- Home page (`/`)
- Shop pages (`/shop/new`, `/shop/preowned`)
- Sell page (`/sell`)
- Cart & Checkout (`/cart`, `/checkout`)
- Auth pages (`/login`, `/register`)

### User Profile Pages
- Profile dashboard (`/profile`)
- Orders (`/profile/orders`)
- Addresses (`/profile/addresses`)
- Payment methods (`/profile/payment`)
- Sell requests (`/profile/requests`)

### Admin Pages
- Dashboard (`/admin/dashboard`)
- Orders management (`/admin/orders`)
- Products management (`/admin/products`)
- Revenue analytics (`/admin/revenue`)
- User management (`/admin/users`)
- Pickup management (`/admin/pickups`)
- Sell requests (`/admin/requests`)

## 📊 Expected Results

Before warmup:
- First page load: **2-10 seconds** ⏳
- Subsequent loads: instant ⚡

After warmup:
- All page loads: **instant** ⚡⚡⚡

## 🔧 Configuration

To add/remove routes, edit `scripts/warmup-routes.ts`:

```typescript
const routes = [
  `${BASE_URL}/your-new-route`,
  // ... add more routes
];
```

## 💡 Tips

1. **Wait for server to start**: Give the dev server 10-15 seconds to fully start before running warmup
2. **Run after changes**: If you make significant code changes, run warmup again
3. **Skip auth routes**: The script handles auth failures gracefully (admin routes may show as skipped if not logged in)
4. **Check output**: The warmup script shows timing for each route - use this to identify slow pages

## 🐛 Troubleshooting

### "Skipped" routes
This is normal for:
- Admin routes (require authentication)
- Routes that don't exist yet
- Server not fully started

### Warmup takes too long
- Reduce the number of routes in `warmup-routes.ts`
- Focus on most-used pages first

### Server crashes during warmup
- Increase wait time in PowerShell script (line with `Start-Sleep`)
- Check for errors in server terminal

## 📝 Example Output

```
🔥 Warming up routes...

✅ Warmed: http://localhost:9002/ (234ms)
✅ Warmed: http://localhost:9002/shop/new (456ms)
✅ Warmed: http://localhost:9002/shop/preowned (123ms)
⚠️  401: http://localhost:9002/admin/dashboard
...

🎉 Warmup complete!
   ✅ Success: 15
   ⏭️  Skipped: 5

💡 Tip: All successfully warmed pages will now load instantly!
```

## 🎯 When to Use

- **During development**: Run once when starting your dev session
- **After big changes**: Re-run if you modify many files
- **Before demo/presentation**: Ensure all pages load instantly
- **Performance testing**: Warm up before measuring load times
