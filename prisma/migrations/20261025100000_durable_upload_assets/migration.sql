-- Additive storage for cloud prototype images; existing disk assets remain valid.
CREATE TABLE "upload_assets" (
    "path" TEXT NOT NULL PRIMARY KEY,
    "contentBytes" BLOB NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'image/webp',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
