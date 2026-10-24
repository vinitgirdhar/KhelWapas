-- AlterTable
ALTER TABLE "sell_requests" ADD COLUMN "reviewReason" TEXT;

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "profilePicture" TEXT,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "fullName", "id", "passwordHash", "phone", "profilePicture", "rating", "role", "status", "updatedAt") SELECT "createdAt", "email", "fullName", "id", "passwordHash", "phone", "profilePicture", "rating", "role", "status", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "originalPrice" DECIMAL,
    "grade" TEXT,
    "imageUrls" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "specs" JSONB,
    "badge" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sellerId" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "sourceRequestId" TEXT
);
INSERT INTO "new_products" ("badge", "category", "createdAt", "description", "grade", "id", "imageUrls", "isAvailable", "name", "originalPrice", "price", "specs", "type", "updatedAt") SELECT "badge", "category", "createdAt", "description", "grade", "id", "imageUrls", "isAvailable", "name", "originalPrice", "price", "specs", "type", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sourceRequestId_key" ON "products"("sourceRequestId");
CREATE INDEX "products_sellerId_idx" ON "products"("sellerId");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_type_idx" ON "products"("type");
CREATE INDEX "products_isAvailable_idx" ON "products"("isAvailable");
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");
CREATE INDEX "products_category_type_isAvailable_idx" ON "products"("category", "type", "isAvailable");
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "shippingAddress" JSONB,
    "shippingFee" DECIMAL NOT NULL DEFAULT 50,
    "idempotencyKey" TEXT,
    "paymentReference" TEXT,
    "adminNotes" TEXT,
    "totalPrice" DECIMAL NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "fulfillmentStatus" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "fulfillmentStatus", "id", "items", "paymentStatus", "totalPrice", "updatedAt", "userId") SELECT "createdAt", "fulfillmentStatus", "id", "items", "paymentStatus", "totalPrice", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_idempotencyKey_key" ON "orders"("idempotencyKey");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");
CREATE INDEX "orders_fulfillmentStatus_idx" ON "orders"("fulfillmentStatus");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX "orders_userId_paymentStatus_idx" ON "orders"("userId", "paymentStatus");
CREATE INDEX "orders_paymentStatus_createdAt_idx" ON "orders"("paymentStatus", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "OrderEvent_orderId_idx" ON "OrderEvent"("orderId");

