// scripts/warmup-routes.ts
const PORT = process.env.PORT || '9002';
const BASE_URL = `http://localhost:${PORT}`;

const routes = [
  `${BASE_URL}/`,
  `${BASE_URL}/shop/new`,
  `${BASE_URL}/shop/preowned`,
  `${BASE_URL}/sell`,
  `${BASE_URL}/cart`,
  `${BASE_URL}/checkout`,
  `${BASE_URL}/login`,
  `${BASE_URL}/register`,
  `${BASE_URL}/profile`,
  `${BASE_URL}/profile/orders`,
  `${BASE_URL}/profile/addresses`,
  `${BASE_URL}/profile/payment`,
  `${BASE_URL}/profile/requests`,
  `${BASE_URL}/admin/dashboard`,
  `${BASE_URL}/admin/orders`,
  `${BASE_URL}/admin/products`,
  `${BASE_URL}/admin/revenue`,
  `${BASE_URL}/admin/users`,
  `${BASE_URL}/admin/pickups`,
  `${BASE_URL}/admin/requests`,
];

async function warmup() {
  console.log('🔥 Warming up routes...\n');
  
  let successCount = 0;
  let skipCount = 0;
  
  for (const route of routes) {
    try {
      const startTime = Date.now();
      const response = await fetch(route);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ Warmed: ${route} (${duration}ms)`);
        successCount++;
      } else {
        console.log(`⚠️  ${response.status}: ${route}`);
        skipCount++;
      }
    } catch (error) {
      console.log(`⏭️  Skipped: ${route} (server not ready)`);
      skipCount++;
    }
  }
  
  console.log(`\n🎉 Warmup complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`\n💡 Tip: All successfully warmed pages will now load instantly!`);
}

// Run warmup
warmup().catch(console.error);
