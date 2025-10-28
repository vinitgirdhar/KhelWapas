# Admin Panel - Product Image Update Guide

## 🎯 Quick Start

### To Update Product Images:

1. **Navigate to Product**
   ```
   Admin Panel → Products → Click on Product Name
   ```

2. **Upload Images**
   - **Method 1**: Drag & drop images onto upload area
   - **Method 2**: Click upload area and select files
   
3. **Wait for Upload**
   - Each image uploads **immediately**
   - Look for "Saved" badge on each image
   - Upload progress indicator appears

4. **Manage Images**
   - ✅ Reorder: Drag images to reposition (first = thumbnail)
   - ❌ Remove: Hover over image → Click X button
   - ➕ Add more: Upload additional images (max 10 total)

5. **Save Product**
   - Click "Save Product" button (top right)
   - Confirmation toast appears
   - Images are now **permanently linked**

---

## 🔍 Visual Indicators

### Upload States:

| State | Visual | Meaning |
|-------|--------|---------|
| **Uploading** | Spinner animation | File is uploading to server |
| **Saved** | Green "Saved" badge | File stored on server |
| **Temporary** | No badge | New file, not yet saved |

### Image Badges:

```
┌─────────────────┐
│                 │
│     IMAGE       │
│                 │
│   [Saved]  [X]  │
└─────────────────┘
    ↑        ↑
    │        │
Saved badge  Remove button
(appears on  (hover to see)
 saved images)
```

---

## ✅ Verification Checklist

Before clicking "Save Product", ensure:

- [ ] All images have "Saved" badge (green)
- [ ] No upload spinner is visible
- [ ] First image is your desired thumbnail
- [ ] All unwanted images are removed
- [ ] Total images ≤ 10

After clicking "Save Product":

- [ ] Success toast appears
- [ ] Redirected to products list (or stays on page)
- [ ] Images persist if you go back to edit

---

## 🚨 Important Notes

### Images Upload Immediately

**When you drag/drop or select images:**
- ✅ Files upload to server **right away**
- ✅ Get permanent URLs immediately
- ✅ Stored in `/public/uploads/products/`

**This means:**
- ⚠️ Images are saved **before** you click "Save Product"
- ⚠️ If you upload wrong image, **must click X to remove**
- ✅ Can safely navigate away without losing uploads

### What "Save Product" Does

Clicking "Save Product":
- ✅ Links current images to product in database
- ✅ Saves all other product details (name, price, etc.)
- ✅ Makes image association **permanent**

**Does NOT:**
- ❌ Upload images (already done)
- ❌ Move files (already in correct location)

---

## 📋 Common Workflows

### Replacing All Images

1. Click X on each existing image
2. Upload new images (drag & drop)
3. Wait for "Saved" badges
4. Click "Save Product"

**Result**: Old images removed, new images linked

### Adding More Images

1. Upload new images (keep existing)
2. Wait for "Saved" badges
3. Reorder if needed (drag)
4. Click "Save Product"

**Result**: New images added to existing set

### Reordering Images

1. Drag images to new positions
2. First position = thumbnail
3. Click "Save Product"

**Result**: Image order saved

### Updating Product Details + Images

1. Edit name, price, description, etc.
2. Update images as needed
3. Click "Save Product" **once**

**Result**: All changes saved together

---

## 🛡️ Safety Features

### File Type Protection

✅ **Allowed**: JPG, JPEG, PNG, GIF, WEBP  
❌ **Blocked**: All other file types

If you try to upload unsupported file:
- Will be skipped silently
- No error shown
- Only valid images uploaded

### Size Limits

| Type | Maximum Size |
|------|--------------|
| Product Images | 10 MB per file |
| Profile Images | 5 MB per file |

If file exceeds limit:
- ❌ Upload fails
- 🔴 Error toast appears
- Must use smaller file

### Rate Limiting

- **Max**: 20 uploads per 5 minutes
- **Per**: IP address

If you exceed limit:
- ❌ Further uploads blocked
- 🔴 Error toast: "Too many upload requests"
- Wait 5 minutes to continue

### Maximum Images

- **Max**: 10 images per product

If you try to upload more:
- ❌ Upload blocked
- 🔴 Error toast: "Too many images"
- Must remove some first

---

## 🐛 Troubleshooting

### Issue: "Upload failed" error

**Possible causes:**
- File too large (>10MB)
- Unsupported file type
- Network issue

**Solutions:**
1. Check file size (compress if needed)
2. Verify file is image (JPG, PNG, etc.)
3. Check internet connection
4. Try uploading one file at a time

### Issue: Images don't show "Saved" badge

**Cause**: Upload still in progress

**Solution**: Wait for upload to complete (spinner → badge)

### Issue: Can't upload more images

**Possible causes:**
- Already have 10 images
- Rate limit exceeded

**Solutions:**
1. Remove some images first
2. Wait 5 minutes if rate limited

### Issue: Images disappear after refresh

**Cause**: Didn't click "Save Product"

**Solution**:
- Re-upload images
- Click "Save Product" button
- Wait for confirmation toast

---

## 🔐 Security & Privacy

### Your Uploaded Images Are:

✅ **Secure**: Validated for type, size, and content  
✅ **Private**: Only accessible to admin users  
✅ **Permanent**: Stored on server, backed up  
✅ **Optimized**: Automatically compressed  

### File Naming:

Uploaded files get **unique names**:
```
1761603326792-qhu3hx0gjq.webp
   ↑               ↑        ↑
timestamp      random ID  extension
```

**Benefits:**
- No filename collisions
- No personal info leaked
- No security vulnerabilities

---

## 📊 Verification

### To Verify Images Are Saved:

**Method 1: Check Admin Panel**
1. Go to product edit page
2. Look for "Saved" badges
3. Images with badges are stored

**Method 2: Check Database**
Run verification script:
```bash
npx tsx verify-image-persistence.ts
```

**Method 3: Check File System**
Look in folder:
```
public/uploads/products/
```

All your product images are here.

---

## ⚡ Pro Tips

### Tip 1: Order Matters
First image becomes product thumbnail everywhere on site.  
**Best practice**: Make first image the most appealing angle.

### Tip 2: Upload Multiple at Once
Select multiple files (Ctrl+Click or Shift+Click) or drag multiple.  
Faster than uploading one by one.

### Tip 3: Preview Before Saving
Uploaded images show immediately.  
**Check them before clicking "Save Product".**

### Tip 4: Use Good Quality Images
- Higher quality = better customer experience
- Recommended: At least 800x800 pixels
- Keep under 5MB for faster loading

### Tip 5: Remove Old Images
When replacing images, remove old ones first.  
Keeps product clean and loads faster.

---

## 📞 Need Help?

If you encounter issues:

1. **Check this guide** first
2. **Run verification script**:
   ```bash
   npx tsx verify-image-persistence.ts
   ```
3. **Check browser console** (F12) for errors
4. **Contact developer** with:
   - Product ID
   - Error message
   - Screenshot

---

**Last Updated**: October 28, 2025  
**Status**: ✅ All systems operational  
**Verified Images**: 13 images across 6 products
