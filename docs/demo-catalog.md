# Generated prototype equipment catalog

The catalog contains 110 demo products: five each for Athletics, Badminton, Basketball, Boxing, Cricket, Cycling, Fitness, Football, Golf, Gymnastics, Hockey, Rugby, Skating, Squash, Swimming, Table Tennis, Tennis, Volleyball, Water Sports, Winter Sports, Yoga and Other sports accessories.

`src/data/demo-catalog.ts` is the single mapping between item names, categories, prices, condition, unique demo SKUs and image filenames. Each category has three pre-owned and two new equipment listings. Prices and condition are illustrative. Grade C descriptions call out visible wear; grade B describes lighter wear.

The 110 separate product photographs were generated for this prototype in a consistent warm-white studio style and exported as 720×720 WebP assets. The production sheets are not displayed in the application. Products use individual files in `public/images/demo-catalog/`, so cards, details, search, the bag, checkout, admin and invoices share the same photo. All images are marked as demonstration content in listing metadata, with an explicit image label on the product page. They are not photographs of real inventory.

## Load or refresh

Run `npm run db:seed:mocks` after migrations. Assets are checked before writes. The seed refreshes only controlled demo IDs, preserves existing stock and publication flags, and refuses a conflicting seller-linked ID. It does not reset passwords or replace user listings. The original practice-bat and badminton-racket IDs keep their equipment identities. Three older bat demos are archived in place; their IDs are never reused for gloves, pads or balls. Old links and cancellation restocking continue to refer to the original bats.

Run `npm run db:remove-mocks` to archive the demo set. It preserves inventory, orders and review history. An archived demo stays archived after reseeding; publish it through the admin editor if needed.

## Image production and verification

The generated source sheets use a four-column, three-row layout with ten populated cells. `scripts/export-demo-catalog-assets.ts` packages the individual cells into WebP files; its ignored local manifest has entries `{ "sheet": 0, "path": "/absolute/path/to/generated-sheet.png" }`. Source sheets remain in the workspace generated-images directory. The application serves only the individually exported assets.

Unit coverage verifies five products per category, new/pre-owned coverage, unique IDs/SKUs/image paths, unique image bytes and valid image dimensions. Browser coverage checks every category and static image URL, varied featured selection, the image label, and reseeding without restoring sold inventory or republishing an archive. Existing marketplace checks exercise the new catalog through shopping and demo checkout.
