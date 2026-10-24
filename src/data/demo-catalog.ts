import type { Grade, ProductType } from '@prisma/client';

type CatalogItem = readonly [slug: string, name: string, price: number, detail: string, photograph: string];
type CatalogSport = { category: string; items: readonly CatalogItem[] };

/** Asset order is shared by generation sheets, exported image names and seed records. */
export const DEMO_SPORTS: readonly CatalogSport[] = [
  { category: 'Cricket', items: [
    ['practice-bat', 'Cricket practice bat', 1499, 'Light willow blade with a black rubber grip for club practice.', 'used light willow cricket bat, black handle grip, minor blade and edge scuffs'],
    ['batting-gloves', 'Club cricket batting gloves', 899, 'A pair of navy and white padded batting gloves, adult size.', 'used pair of navy and white cricket batting gloves, light wear'],
    ['batting-pads', 'Cricket batting leg pads', 1299, 'A pair of adult batting pads with vertical padding and adjustable straps.', 'used pair of upright white cricket batting leg pads, faint wear'],
    ['leather-ball', 'Red leather cricket ball', 449, 'A stitched-seam leather practice ball in regulation adult size.', 'new red leather cricket ball, clean cream stitched seam'],
    ['wooden-stumps', 'Wooden cricket stump set', 999, 'Three wooden stumps and two bails for a practice wicket.', 'new set of three wooden cricket stumps with two bails'],
  ] },
  { category: 'Football', items: [
    ['size-5-ball', 'Size 5 training football', 699, 'A black and white size 5 ball for everyday outdoor training.', 'used black and white size 5 soccer football, light turf scuffs'],
    ['football-boots', 'Football boots', 1599, 'A pair of black and orange studded football boots, UK size 8.', 'used pair of black and orange soccer cleats, subtle sole wear'],
    ['shin-guards', 'Football shin guards', 399, 'A pair of lightweight navy guards for adult training sessions.', 'used pair of dark navy football shin guards, light scratches'],
    ['goalkeeper-gloves', 'Goalkeeper gloves', 1099, 'A pair of orange and black gloves with padded palms and wrist straps.', 'new pair of orange and black football goalkeeper gloves, latex palms'],
    ['training-cones', 'Football training cone set', 349, 'Five low-profile orange disc cones for ball-control drills.', 'new set of five orange low profile football disc cones, stacked with one beside'],
  ] },
  { category: 'Badminton', items: [
    ['lightweight-racket', 'Lightweight badminton racket', 1199, 'A strung black and orange racket with a slim shaft and fresh grip.', 'used black and orange badminton racket, narrow oval head and thin shaft, subtle frame wear'],
    ['racket-bag', 'Badminton racket bag', 849, 'A navy zipped bag shaped to hold two badminton rackets.', 'used navy badminton racket bag, elongated slim shape, subtle fabric wear'],
    ['court-shoes', 'Badminton court shoes', 1499, 'A pair of white and blue indoor court shoes, UK size 8.', 'used pair of white and blue low top badminton court shoes, gum soles'],
    ['shuttlecocks', 'Feather shuttlecock set', 599, 'Six white feather shuttlecocks for practice games.', 'new set of six white feather badminton shuttlecocks with cork bases'],
    ['replacement-grips', 'Badminton replacement grip set', 299, 'Three orange replacement grip rolls for racket handles.', 'new set of three orange badminton racket grip tape rolls'],
  ] },
  { category: 'Tennis', items: [
    ['club-racket', 'Club tennis racket', 2199, 'A red and black strung adult racket for recreational tennis.', 'used red and black tennis racket, broad oval strung head, short handle, light scuffs'],
    ['court-shoes', 'Tennis court shoes', 1799, 'A pair of white and green tennis shoes, UK size 8.', 'used pair of white and green tennis court shoes, light sole wear'],
    ['racket-bag', 'Tennis racket bag', 1299, 'A navy zipped tennis bag with room for rackets and accessories.', 'used navy tennis racket bag, wide padded three racket shape'],
    ['practice-balls', 'Tennis practice ball tube', 399, 'Three yellow tennis balls supplied in a clear practice tube.', 'new three yellow fuzzy tennis balls beside a clear unlabelled ball tube'],
    ['overgrips', 'Tennis overgrip set', 349, 'Three white absorbent overgrips for adult racket handles.', 'new set of three clean white tennis overgrip rolls'],
  ] },
  { category: 'Basketball', items: [
    ['training-ball', 'Basketball training ball', 899, 'A textured orange size 7 basketball for recreational play.', 'used regulation orange pebbled basketball with black channels, subtle court wear'],
    ['court-shoes', 'High-top basketball shoes', 2299, 'A pair of black and red high-top court shoes, UK size 8.', 'used pair of black and red high top basketball sneakers, mild sole wear'],
    ['rim-net', 'Basketball rim and net', 1799, 'An orange metal rim with a white hanging net for a practice setup.', 'used orange metal basketball hoop rim with white hanging net, no backboard'],
    ['ball-pump', 'Basketball hand pump', 299, 'A compact black pump with a flexible hose and inflation needle.', 'new compact black ball inflation hand pump with hose and metal needle'],
    ['training-bib', 'Reversible basketball training bib', 499, 'An adult orange and black reversible mesh training vest.', 'new orange and black sleeveless reversible mesh basketball training bib, laid flat'],
  ] },
  { category: 'Volleyball', items: [
    ['match-ball', 'Volleyball practice ball', 799, 'A yellow, blue and white volleyball for indoor practice.', 'used yellow blue and white volleyball, slight surface wear'],
    ['knee-pads', 'Volleyball knee pads', 499, 'A pair of black padded knee sleeves for adult players.', 'used pair of black padded volleyball knee pads, light fabric wear'],
    ['court-shoes', 'Volleyball court shoes', 1799, 'A pair of white and orange indoor shoes, UK size 8.', 'used pair of white and orange volleyball court shoes, light wear'],
    ['net', 'Volleyball practice net', 1199, 'A black mesh practice net with reinforced blue edges and tie cords.', 'new folded rectangular black volleyball net, blue edging and visible tie cords'],
    ['arm-sleeves', 'Volleyball arm sleeves', 449, 'A pair of black stretch sleeves for adult forearms.', 'new pair of black volleyball compression forearm sleeves, laid flat'],
  ] },
  { category: 'Table Tennis', items: [
    ['paddle-pair', 'Table tennis bat pair', 699, 'Two wooden-handle bats with red and black rubber faces.', 'used pair of table tennis paddles, one red rubber face one black, wooden handles'],
    ['net-posts', 'Table tennis net and posts', 599, 'A portable black mesh table net with two clamp-on posts.', 'used compact black table tennis net attached to two blue clamp on posts'],
    ['bat-case', 'Table tennis bat case', 349, 'A navy zipped case shaped for one table tennis bat.', 'used navy oval zipped table tennis paddle case, subtle fabric wear'],
    ['practice-balls', 'Table tennis practice balls', 249, 'Six white 40 mm table tennis balls for practice.', 'new set of six plain white table tennis balls, no markings'],
    ['edge-tape', 'Table tennis edge tape', 199, 'A black protective tape roll for the edge of a table tennis bat.', 'new small roll of black protective table tennis bat edge tape with short loose end'],
  ] },
  { category: 'Squash', items: [
    ['racket', 'Squash club racket', 1899, 'A teal strung racket with an elongated head for club squash.', 'used teal squash racket with long narrow teardrop strung head, light frame wear'],
    ['goggles', 'Squash protective goggles', 599, 'Clear-lens black-frame goggles with an adjustable strap.', 'used clear lens black frame squash protective sports goggles, adjustable strap'],
    ['racket-bag', 'Squash racket bag', 999, 'An olive zipped bag with a long racket-shaped main compartment.', 'used olive green elongated squash racket bag, subtle fabric wear'],
    ['double-dot-balls', 'Double yellow dot squash balls', 449, 'Two black double-yellow-dot squash balls for practice.', 'new pair of small black rubber squash balls each with two tiny yellow dots'],
    ['overgrips', 'Squash overgrip set', 299, 'Three teal replacement grip rolls for squash racket handles.', 'new set of three teal squash racket overgrip rolls'],
  ] },
  { category: 'Fitness', items: [
    ['dumbbells', 'Adjustable dumbbell pair', 2499, 'A pair of black plate-loaded dumbbells for home strength training.', 'used pair of black adjustable plate loaded dumbbells, subtle grip wear, no printed numbers'],
    ['kettlebell', 'Cast-iron kettlebell', 1299, 'A compact black cast-iron kettlebell with a wide handle.', 'used black cast iron kettlebell, wide curved handle, minor paint scuffs'],
    ['resistance-bands', 'Resistance loop band set', 599, 'A set of five coloured loop bands with different resistance levels.', 'used set of five coloured resistance exercise loop bands, neatly fanned'],
    ['jump-rope', 'Training jump rope', 349, 'An orange cord with black easy-grip handles for cardio sessions.', 'new jump rope with orange cord and two black handles, neatly coiled'],
    ['foam-roller', 'Textured foam roller', 699, 'A charcoal textured roller for a post-training mobility routine.', 'new charcoal grey cylindrical textured fitness foam roller'],
  ] },
  { category: 'Boxing', items: [
    ['gloves', 'Boxing training gloves', 1499, 'A pair of red padded adult boxing gloves with wrist straps.', 'used pair of red boxing gloves with black wrist straps, subtle leather creases'],
    ['headguard', 'Boxing training headguard', 1199, 'An adult black padded open-face headguard for supervised training.', 'used black padded open face boxing headguard, mild surface wear'],
    ['focus-mitts', 'Boxing focus mitt pair', 899, 'A pair of navy curved coaching mitts with padded targets.', 'used pair of navy curved boxing focus mitts with round padded targets'],
    ['hand-wraps', 'Boxing hand wraps', 349, 'Two orange cotton wrap rolls for hand support during training.', 'new pair of orange cotton boxing hand wrap rolls with thumb loops'],
    ['mouthguard', 'Boxing mouthguard and case', 299, 'A clear adult mouthguard supplied with a black vented case.', 'new clear sports mouthguard beside a small open black protective case'],
  ] },
  { category: 'Cycling', items: [
    ['hybrid-bicycle', 'Hybrid city bicycle', 8999, 'An adult orange flat-handlebar bicycle for leisure rides.', 'used complete adult orange hybrid bicycle, black flat handlebars and saddle, side view, minor frame wear'],
    ['floor-pump', 'Bicycle floor pump', 699, 'A black upright floor pump with a broad foot base and hose.', 'used black bicycle floor pump with T handle, foot base and hose'],
    ['gloves', 'Cycling glove pair', 449, 'A pair of black fingerless padded cycling gloves, adult size.', 'used pair of black fingerless cycling gloves, visible padded palms'],
    ['helmet', 'Vented cycling helmet', 1299, 'A navy and orange vented adult helmet with an adjustable rear fit.', 'new navy and orange vented bicycle helmet, visible chin straps'],
    ['light-set', 'Bicycle front and rear light set', 599, 'A rechargeable front light and red rear light with mounting straps.', 'new black bicycle front white LED light and compact red rear light with mounting straps'],
  ] },
  { category: 'Skating', items: [
    ['inline-skates', 'Inline skating boots', 2499, 'A pair of adult black and orange four-wheel inline skates.', 'used pair of black and orange inline roller skates, four wheels in one line per boot'],
    ['skateboard', 'Street skateboard', 1799, 'A wooden skateboard with black grip tape and orange wheels.', 'used wooden skateboard, black grip tape deck and orange wheels, visible edge scuffs'],
    ['quad-skates', 'Quad roller skate pair', 2299, 'White and orange adult roller skates with four wheels in a two-by-two layout.', 'used pair of white and orange quad roller skates, two by two wheels per boot'],
    ['protection-set', 'Skating protection pad set', 899, 'A black set of wrist guards, knee pads and elbow pads.', 'new set of six black skating protective pads: two wrist guards two knee pads two elbow pads'],
    ['helmet', 'Skating helmet', 999, 'A white rounded adult skating helmet with a chin strap.', 'new matte white rounded skateboard skating helmet with black chin straps'],
  ] },
  { category: 'Athletics', items: [
    ['running-spikes', 'Track running spikes', 1599, 'A pair of blue track shoes with a removable-spike style sole, UK size 8.', 'used pair of blue athletics track sprint spike shoes, pointed metal sole spikes visible'],
    ['mini-hurdle', 'Athletics training hurdle', 499, 'A low yellow practice hurdle for running and coordination drills.', 'used yellow low athletics training hurdle, simple freestanding U frame, light scuffs'],
    ['shot-put', 'Practice shot put', 999, 'A smooth silver metal practice shot for supervised throwing sessions.', 'used silver metal shot put sphere, heavy dense steel, subtle scratches'],
    ['relay-batons', 'Relay baton set', 599, 'Four aluminium batons in orange, blue, red and black.', 'new four hollow aluminium athletics relay batons in orange blue red and black'],
    ['agility-ladder', 'Agility training ladder', 699, 'An orange flat-rung ladder with black webbing for footwork drills.', 'new orange flat rung agility training ladder with black webbing, neatly arranged showing six rungs'],
  ] },
  { category: 'Gymnastics', items: [
    ['training-rings', 'Wooden gymnastics ring pair', 1499, 'Two smooth wooden rings with adjustable black suspension straps.', 'used pair of wooden gymnastics rings with rolled black suspension straps'],
    ['parallettes', 'Wooden parallette pair', 1199, 'A pair of low wooden handstand and bodyweight-training bars.', 'used pair of low wooden gymnastics parallettes, smooth round horizontal handles and stable feet'],
    ['practice-beam', 'Low gymnastics practice beam', 2299, 'A low navy padded beam for supervised balance practice.', 'used low navy padded gymnastics practice balance beam, short rectangular beam with two low feet'],
    ['hand-grips', 'Gymnastics hand grips', 599, 'A pair of cream leather grips with wrist fastenings.', 'new pair of cream leather gymnastics palm grips with wrist straps and finger holes'],
    ['stretch-strap', 'Gymnastics stretch strap', 349, 'A lavender looped stretching strap for mobility routines.', 'new lavender looped gymnastics stretching strap, neatly coiled with several loops visible'],
  ] },
  { category: 'Hockey', items: [
    ['field-stick', 'Field hockey stick', 1499, 'A black and teal adult stick with a curved field-hockey head.', 'used black and teal field hockey stick with short J shaped curved head, not an ice hockey stick'],
    ['stick-bag', 'Field hockey stick bag', 849, 'A black narrow zipped bag with a shoulder strap for field hockey sticks.', 'used long narrow black field hockey stick bag with a curved lower profile and shoulder strap'],
    ['shin-guards', 'Field hockey shin guards', 549, 'A pair of navy protective guards for adult field-hockey training.', 'used pair of navy field hockey shin guards, vented padded shells, mild wear'],
    ['practice-ball', 'Field hockey practice ball', 249, 'A plain white dimpled practice ball for field hockey.', 'new white dimpled hard field hockey ball, realistic small sphere'],
    ['gloves', 'Field hockey padded gloves', 649, 'A pair of black and blue fingerless padded field-hockey gloves.', 'new pair of black and blue fingerless field hockey gloves with padded knuckles'],
  ] },
  { category: 'Rugby', items: [
    ['training-ball', 'Rugby training ball', 899, 'An oval white and orange rugby practice ball, adult size.', 'used oval rugby ball with white and orange panels, light turf scuffs'],
    ['boots', 'Rugby studded boots', 1899, 'A pair of black and white studded rugby boots, UK size 8.', 'used pair of black and white rugby boots with prominent rounded studs, mild sole wear'],
    ['ball-bag', 'Rugby ball carry bag', 599, 'A navy mesh-and-fabric carry bag for rugby balls.', 'used navy mesh rugby ball carry bag with shoulder strap, shown empty and folded neatly'],
    ['kicking-tee', 'Rugby kicking tee', 349, 'An orange adjustable cup-style tee for kicking practice.', 'new orange and black rugby kicking tee, low cup shaped raised plastic support'],
    ['tag-belts', 'Tag rugby belt pair', 499, 'Two adjustable belts with orange and blue detachable flags.', 'new pair of black tag rugby belts with bright orange and blue detachable fabric flags'],
  ] },
  { category: 'Swimming', items: [
    ['goggles', 'Swimming goggles', 499, 'Smoke-lens goggles with an orange adjustable strap.', 'used swimming goggles with smoke lenses and orange silicone strap'],
    ['training-fins', 'Short swimming training fins', 899, 'A pair of short navy fins for pool kick practice.', 'used pair of short navy silicone swimming training fins, minor surface wear'],
    ['kickboard', 'Swimming kickboard', 399, 'A blue rounded foam board for swimming kick drills.', 'used blue foam swimming kickboard with rounded top and hand grip holes'],
    ['swim-cap', 'Silicone swimming cap', 249, 'An orange stretch silicone swim cap for adults.', 'new plain orange silicone swimming cap, rounded dome form'],
    ['pull-buoy', 'Swimming pull buoy', 449, 'A blue and white figure-eight foam pull buoy.', 'new blue and white figure eight shaped foam swimming pull buoy'],
  ] },
  { category: 'Water Sports', items: [
    ['paddleboard', 'Inflatable stand-up paddleboard', 15999, 'A blue and white leisure paddleboard with a deck pad.', 'used complete blue and white inflatable stand up paddleboard with black deck pad, no person'],
    ['kayak-paddle', 'Double-blade kayak paddle', 1499, 'A black two-blade recreational kayak paddle.', 'used black kayak paddle with two broad blades joined by a long straight shaft'],
    ['dry-bag', 'Waterproof roll-top dry bag', 699, 'An orange roll-top bag for keeping personal items together near water.', 'used orange waterproof roll top dry bag, closed buckle, subtle creases'],
    ['buoyancy-vest', 'Water-sports buoyancy vest', 1999, 'An orange and black adult vest with adjustable buckle straps.', 'new orange and black water sports buoyancy vest life jacket, front buckles visible'],
    ['snorkel-set', 'Snorkel mask and tube set', 999, 'A clear-lens black mask with a matching snorkel tube.', 'new clear lens black snorkel diving mask beside a black snorkel breathing tube'],
  ] },
  { category: 'Winter Sports', items: [
    ['skis', 'Recreational ski pair', 7999, 'A pair of black and orange adult skis with bindings.', 'used pair of black and orange alpine skis with bindings, complete long skis, slight surface wear'],
    ['snowboard', 'All-mountain snowboard', 8999, 'A black and orange snowboard with attached bindings.', 'used black and orange snowboard with two bindings, full board visible, light edge scuffs'],
    ['ski-boots', 'Alpine ski boot pair', 3499, 'A pair of black rigid-shell ski boots with buckles, adult size.', 'used pair of black alpine ski boots with hard shells and metal buckle straps'],
    ['snow-goggles', 'Snow sports goggles', 1299, 'Orange mirrored-lens goggles with a black adjustable strap.', 'new snow ski goggles with large orange mirrored lens and black elastic strap'],
    ['insulated-gloves', 'Insulated winter sports gloves', 899, 'A pair of navy and orange insulated gloves with long cuffs.', 'new pair of navy and orange insulated winter ski gloves with long cuffs'],
  ] },
  { category: 'Golf', items: [
    ['driver', 'Golf practice driver', 2499, 'A black-headed metal driver with an adult graphite-style shaft.', 'used golf driver club with large black titanium style head and long black shaft, complete club visible'],
    ['putter', 'Golf practice putter', 1499, 'A steel-shafted putter with a simple flat silver head.', 'used golf putter with straight steel shaft and flat silver blade head, complete club visible'],
    ['stand-bag', 'Golf stand bag', 2999, 'A navy padded bag with shoulder straps and fold-out stand legs.', 'used navy golf stand bag with padded shoulder straps and two stand legs'],
    ['practice-balls', 'Golf practice ball set', 499, 'Six white dimpled golf balls for practice.', 'new set of six white dimpled golf balls, no logos'],
    ['glove', 'Golf glove', 399, 'A white left-hand golf glove with a wrist fastening.', 'new single white left hand golf glove with a small wrist fastening, palm visible'],
  ] },
  { category: 'Yoga', items: [
    ['mat', 'Textured yoga mat', 699, 'A purple textured exercise mat, shown partly rolled.', 'used purple textured yoga mat partly rolled with a flat section, clean light wear'],
    ['cork-blocks', 'Cork yoga block pair', 599, 'Two rounded-edge cork blocks for support during practice.', 'used pair of natural cork rectangular yoga blocks with rounded edges'],
    ['bolster', 'Yoga bolster cushion', 999, 'A navy rectangular fabric bolster with a carry handle.', 'used navy rectangular yoga bolster cushion with a fabric carry handle'],
    ['strap', 'Cotton yoga strap', 299, 'An orange cotton strap with a metal D-ring fastening.', 'new orange cotton yoga strap neatly coiled with silver D rings'],
    ['wheel', 'Cork yoga wheel', 899, 'A round cork-surfaced wheel with a black inner rim.', 'new circular yoga wheel with cork outer surface and black inner rim'],
  ] },
  { category: 'Other', items: [
    ['duffel-bag', 'Everyday sports duffel', 899, 'A black and orange zipped duffel with handles and a shoulder strap.', 'used black and orange sports duffel bag with two handles and shoulder strap'],
    ['mesh-equipment-bag', 'Mesh equipment carry bag', 449, 'A navy drawstring mesh bag for light training equipment.', 'used navy mesh sports equipment drawstring sack, shown empty'],
    ['folding-chair', 'Sideline folding chair', 999, 'A navy fabric folding chair with an orange trim and metal frame.', 'used navy and orange sideline folding sports chair, complete metal frame visible'],
    ['water-bottle', 'Insulated sports water bottle', 599, 'An orange stainless-steel bottle with a screw-top lid.', 'new matte orange stainless steel sports water bottle with black screw lid'],
    ['training-towel', 'Microfibre training towel', 299, 'A soft grey microfibre towel folded for a gym bag.', 'new neatly folded grey microfibre sports training towel'],
  ] },
];

const legacyIds: Record<string, string> = {
  'cricket/practice-bat': 'demo-cricket',
  'badminton/lightweight-racket': 'demo-badminton',
};
// These IDs used to describe bats. Retire them in place instead of turning an
// old order's bat link and stock reservation into unrelated equipment.
export const RETIRED_DEMO_PRODUCTS = [
  { id: 'demo-club-bat', name: 'Club cricket bat', price: 899, type: 'preowned' as const, grade: 'B' as const },
  { id: 'demo-training-bat', name: 'Cricket training bat', price: 1899, type: 'preowned' as const, grade: 'B' as const },
  { id: 'demo-new-bat', name: 'New match cricket bat', price: 2499, type: 'new' as const, grade: null },
];
const featuredIds = ['demo-cricket', 'demo-football-size-5-ball', 'demo-badminton', 'demo-tennis-club-racket'];
const visibleWear = new Set([
  'cricket/practice-bat', 'football/size-5-ball', 'football/shin-guards',
  'basketball/training-ball', 'basketball/court-shoes', 'volleyball/match-ball',
  'fitness/kettlebell', 'boxing/gloves', 'skating/inline-skates', 'skating/skateboard', 'skating/quad-skates',
  'athletics/running-spikes', 'athletics/mini-hurdle', 'athletics/shot-put',
  'gymnastics/training-rings', 'gymnastics/parallettes', 'hockey/field-stick', 'hockey/shin-guards',
  'rugby/training-ball', 'swimming/training-fins', 'winter-sports/snowboard',
]);
export const categorySlug = (category: string) => category.toLowerCase().replace(/\s+/g, '-');

export const DEMO_PRODUCTS = DEMO_SPORTS.flatMap((sport, sportIndex) => sport.items.map(([slug, name, price, detail, photograph], itemIndex) => {
  const key = `${categorySlug(sport.category)}/${slug}`;
  const id = legacyIds[key] || `demo-${categorySlug(sport.category)}-${slug}`;
  const type: ProductType = itemIndex < 3 ? 'preowned' : 'new';
  const grade: Grade | null = type === 'preowned' ? (visibleWear.has(key) ? 'C' : 'B') : null;
  const image = `/images/demo-catalog/${categorySlug(sport.category)}-${slug}.webp`;
  const featuredRank = featuredIds.indexOf(id);
  return {
    id, name, category: sport.category, type, grade, price,
    originalPrice: type === 'preowned' ? Math.round(price * 1.65) : null,
    imageUrls: [image], badge: 'Demo listing', stock: type === 'new' ? 8 : 3,
    description: `${detail} ${type === 'preowned' ? `Illustrative pre-owned condition, grade ${grade}, with ${grade === 'C' ? 'visible surface wear and scuffs' : 'light signs of use'}.` : 'Illustrative new condition.'} Prototype listing with an AI-generated product image; prices, condition and availability are demonstration content.`,
    specs: { Sport: sport.category, SKU: `KW-D${String(sportIndex + 1).padStart(2, '0')}${String(itemIndex + 1).padStart(2, '0')}`, 'Item details': detail, Condition: type === 'new' ? 'New · demonstration' : `Pre-owned · grade ${grade} · demonstration`, 'Image source': 'AI-generated product illustration', 'Catalog use': 'Prototype demonstration; not an actual seller listing' },
    photograph, sheet: Math.floor(sportIndex / 2), cell: (sportIndex % 2) * 5 + itemIndex,
    featuredRank: featuredRank < 0 ? null : featuredRank,
  };
}));
