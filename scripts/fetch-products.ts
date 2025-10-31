async function run() {
  const res = await fetch('http://localhost:9002/api/products?limit=200');
  const json: any = await res.json();
  console.log('count', json.products.length);
  console.log(json.products.map((p: any) => p.name));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
