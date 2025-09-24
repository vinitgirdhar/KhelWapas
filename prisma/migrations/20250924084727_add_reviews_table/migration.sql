/*
  Warnings:

  - You are about to drop the column `reviewReason` on the `sell_requests` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerImage" TEXT,
    CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sell_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "contactMethod" TEXT NOT NULL,
    "contactDetail" TEXT,
    "imageUrls" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sell_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sell_requests" ("category", "contactDetail", "contactMethod", "createdAt", "description", "email", "fullName", "id", "imageUrls", "price", "status", "title", "updatedAt", "userId") SELECT "category", "contactDetail", "contactMethod", "createdAt", "description", "email", "fullName", "id", "imageUrls", "price", "status", "title", "updatedAt", "userId" FROM "sell_requests";
DROP TABLE "sell_requests";
ALTER TABLE "new_sell_requests" RENAME TO "sell_requests";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
