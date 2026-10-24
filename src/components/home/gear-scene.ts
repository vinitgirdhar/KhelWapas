'use client';

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export type GearSceneController = {
  setSport: (sport: number) => void;
  dispose: () => void;
};

/** Procedural geometry only: no downloaded models, external textures or service calls. */
export function createGearScene(host: HTMLDivElement, onReady: () => void): GearSceneController {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', 'Interactive sports equipment');
  canvas.setAttribute('role', 'img');
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-describedby', 'gear-keyboard-help');
  canvas.dataset.gearCanvas = '';
  canvas.dataset.rotation = '0';
  canvas.dataset.sport = '0';
  canvas.dataset.frames = '0';
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
  camera.position.set(0, 1.15, 8.5);
  camera.lookAt(0, .1, 0);
  scene.add(new THREE.HemisphereLight(0xddeaff, 0x52628b, 3));
  const key = new THREE.DirectionalLight(0xffe3c2, 5);
  key.position.set(-3, 6, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4;
  key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
  key.shadow.normalBias = .025;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6eabff, 4);
  rim.position.set(3, 3, -3); scene.add(rim);
  const warm = new THREE.PointLight(0xff8428, 10, 8);
  warm.position.set(2, -.3, 2); scene.add(warm);

  const material = (color: THREE.ColorRepresentation, roughness = .5, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const navy = material(0x15243e, .33, .5);
  const orange = material(0xf58a31, .28, .6);
  const grip = material(0x18243b, .8);
  const white = material(0xf6f1e5, .45);
  const string = material(0xd8e3f8, .6);
  const mesh = (geometry: THREE.BufferGeometry, surface: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
  };
  const cylinder = (radius: number, length: number, surface: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => mesh(new THREE.CylinderGeometry(radius, radius, length, 20), surface, parent, x, y, z);
  const straightSegmentGeometry = new THREE.CylinderGeometry(1, 1, 1, 6);
  const line = (points: THREE.Vector3[], radius: number, surface: THREE.Material, parent: THREE.Object3D, closed = false) => {
    // Strings and stitches are straight segments; a full curved tube wastes
    // geometry and shadow passes on details that cannot cast visible shadows.
    if (points.length === 2 && !closed) {
      const direction = points[1].clone().sub(points[0]);
      const object = mesh(straightSegmentGeometry, surface, parent);
      object.scale.set(radius, direction.length(), radius);
      object.position.copy(points[0]).add(points[1]).multiplyScalar(.5);
      object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      object.castShadow = false;
      return object;
    }
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, closed), Math.max(16, points.length * 2), radius, 5, closed), surface, parent);
  };

  const podium = new THREE.Group(); podium.position.y = -1.75; scene.add(podium);
  cylinder(1.8, .13, navy, podium);
  const ringMaterial = new THREE.MeshStandardMaterial({color: 0xffa358, emissive: 0xff7920, emissiveIntensity: .55, roughness: .25, metalness: .7});
  const ring = mesh(new THREE.TorusGeometry(1.78, .018, 8, 90), ringMaterial, podium, 0, .07);
  ring.rotation.x = Math.PI / 2;
  const innerRing = mesh(new THREE.TorusGeometry(1.47, .006, 6, 80), material(0x91aacd, .3, .5), podium, 0, .072);
  innerRing.rotation.x = Math.PI / 2;
  const floor = mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({opacity: .2}), scene, 0, -1.83);
  floor.rotation.x = -Math.PI / 2; floor.castShadow = false;

  const orbit = new THREE.Group(); scene.add(orbit);
  const orbitRing = mesh(new THREE.TorusGeometry(2.02, .006, 5, 120), new THREE.MeshBasicMaterial({color: 0xa7bce2, transparent: true, opacity: .24}), orbit, 0, .15, -.7);
  orbitRing.rotation.set(.25, -.1, .2);
  const satellite = mesh(new THREE.SphereGeometry(.04, 12, 12), new THREE.MeshBasicMaterial({color: 0xffa055}), orbit, -1.65, 1.35, -.6);
  satellite.castShadow = false;

  const pivot = new THREE.Group(); scene.add(pivot);
  const models: THREE.Group[] = [];
  const animatedBalls: THREE.Object3D[] = [];
  const textures: THREE.Texture[] = [];
  function texture(width: number, height: number, draw: (context: CanvasRenderingContext2D) => void) {
    const element = document.createElement('canvas'); element.width = width; element.height = height;
    const context = element.getContext('2d');
    if (!context) return null;
    draw(context);
    const result = new THREE.CanvasTexture(element); result.colorSpace = THREE.SRGBColorSpace;
    result.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); textures.push(result); return result;
  }
  const woodTexture = texture(256, 512, context => {
    context.fillStyle = '#d9b77d'; context.fillRect(0,0,256,512);
    for(let i=0;i<65;i++) {
      context.strokeStyle = `rgba(107,64,23,${.07 + (i % 5) * .015})`;
      context.lineWidth = i % 3 === 0 ? 2 : 1; context.beginPath();
      for(let y=0;y<=512;y+=16) {
        const x=i*4 + Math.sin(y*.012+i)*2; if(y===0)context.moveTo(x,y);else context.lineTo(x,y);
      }context.stroke();
    }
  });
  const wood = new THREE.MeshStandardMaterial({color: 0xf3d4a0, map: woodTexture, roughness: .48});
  const decalTexture = texture(256, 256, context => {
    context.fillStyle='#142549'; context.fillRect(0,0,256,256);
    context.fillStyle='#ff923b'; context.font='bold italic 164px Arial'; context.textAlign='center'; context.fillText('K',123,172);
    context.fillStyle='#f8ead7'; context.font='16px Arial'; context.fillText('PLAY ON',128,221);
  });
  const decal = new THREE.MeshStandardMaterial({map: decalTexture, roughness: .42});

  // A rounded solid willow blade, contoured shoulder, wrapped grip and raised branding.
  const cricket = new THREE.Group(); models.push(cricket); pivot.add(cricket);
  const bat = new THREE.Group(); cricket.add(bat); bat.position.set(-.52,.1,0); bat.rotation.set(-.13,-.35,-.3);
  mesh(new RoundedBoxGeometry(.64, 2.05, .25, 5, .085), wood, bat, 0, -.4);
  mesh(new RoundedBoxGeometry(.35, .45, .19, 4, .06), wood, bat, 0, .71);
  cylinder(.075, 1.03, grip, bat, 0, 1.4);
  for(let i=0;i<21;i++) {
    const wrap=mesh(new THREE.TorusGeometry(.077,.009,5,20), material(i%3 ? 0x33415a : 0x52627e,.75),bat,0,.94+i*.046);
    wrap.rotation.x=Math.PI/2;
  }
  mesh(new RoundedBoxGeometry(.54,.48,.012,2,.018),decal,bat,0,-.35,.133);
  const cricketBall = new THREE.Group(); cricket.add(cricketBall); cricketBall.position.set(.95,-.82,.4); animatedBalls.push(cricketBall);
  mesh(new THREE.SphereGeometry(.44,40,32),material(0xa32c25,.36),cricketBall);
  for(const x of [-.025,.025]) {
    const seam=mesh(new THREE.TorusGeometry(Math.sqrt(.442**2-x*x),.006,5,80),white,cricketBall,x);
    seam.rotation.y=Math.PI/2;
  }
  for(let i=0;i<40;i++) {
    const t=i/40*Math.PI*2;
    line([new THREE.Vector3(-.047,Math.cos(t)*.441,Math.sin(t)*.441),new THREE.Vector3(-.072,Math.cos(t+.014)*.438,Math.sin(t+.014)*.438)],.0035,white,cricketBall);
    line([new THREE.Vector3(.047,Math.cos(t)*.441,Math.sin(t)*.441),new THREE.Vector3(.072,Math.cos(t+.014)*.438,Math.sin(t+.014)*.438)],.0035,white,cricketBall);
  }
  cricketBall.rotation.z=-.4;

  // A three-dimensional tubular frame with individually tensioned strings.
  const badminton = new THREE.Group(); models.push(badminton); pivot.add(badminton);
  const racket = new THREE.Group(); badminton.add(racket); racket.rotation.set(.05,-.25,-.32); racket.position.set(-.4,.15,0);
  const oval = Array.from({length:65},(_,i)=>new THREE.Vector3(Math.cos(i/64*Math.PI*2)*.64,Math.sin(i/64*Math.PI*2)*.87+.72,0));
  line(oval,.055,orange,racket,true);
  for(let x=-.5;x<=.5;x+=.083) {
    const dy=Math.sqrt(1-(x/.61)**2)*.84;
    line([new THREE.Vector3(x,.72-dy,0),new THREE.Vector3(x,.72+dy,0)],.005,string,racket);
  }
  for(let y=-.7;y<=.7;y+=.085) {
    const dx=Math.sqrt(1-(y/.84)**2)*.61;
    line([new THREE.Vector3(-dx,.72+y,0),new THREE.Vector3(dx,.72+y,0)],.005,string,racket);
  }
  cylinder(.027,1.15,orange,racket,0,-.64);
  cylinder(.068,.63,grip,racket,0,-1.31);
  for(let i=0;i<13;i++) {
    const wrap=mesh(new THREE.TorusGeometry(.069,.006,5,16),string,racket,0,-1.59+i*.045); wrap.rotation.x=Math.PI/2;
  }
  const shuttle = new THREE.Group(); badminton.add(shuttle); shuttle.position.set(1,-.45,.45); shuttle.rotation.set(.25,0,-.48); animatedBalls.push(shuttle);
  mesh(new THREE.SphereGeometry(.17,24,16),white,shuttle,0,-.28);
  cylinder(.17,.12,orange,shuttle,0,-.2);
  for(let i=0;i<12;i++) {
    const t=i/12*Math.PI*2;
    const feather = mesh(new THREE.ConeGeometry(.105,.74,4,1,true),new THREE.MeshStandardMaterial({color:0xf9f4e9,roughness:.65,side:THREE.DoubleSide}),shuttle,Math.cos(t)*.17,.17,Math.sin(t)*.17);
    feather.rotation.set(Math.sin(t)*.38, t, -Math.cos(t)*.38); feather.rotation.z+=Math.PI;
    line([new THREE.Vector3(Math.cos(t)*.13,-.16,Math.sin(t)*.13),new THREE.Vector3(Math.cos(t)*.34,.56,Math.sin(t)*.34)],.004,white,shuttle);
  }

  const basketball = new THREE.Group(); models.push(basketball); pivot.add(basketball);
  const ball = new THREE.Group(); basketball.add(ball); ball.rotation.set(.12, .3,-.25); animatedBalls.push(ball);
  const leather = texture(256,256,context=>{
    context.fillStyle='#e77e29';context.fillRect(0,0,256,256);
    for(let y=0;y<256;y+=5)for(let x=0;x<256;x+=5){context.fillStyle=(x+y)%3?'#d16a20':'#f89540';context.beginPath();context.arc(x+((y/5)%2)*2.5,y,1.2,0,Math.PI*2);context.fill();}
  });
  mesh(new THREE.SphereGeometry(1.15,64,40),new THREE.MeshStandardMaterial({color:0xffa353,map:leather,bumpMap:leather,bumpScale:.012,roughness:.72}),ball);
  const seamMaterial=material(0x39251c,.9);
  for(const [rx,ry,rz] of [[0,0,0],[Math.PI/2,0,0],[0,Math.PI/2,0],[0,Math.PI/2,.75]]) {
    const seam=mesh(new THREE.TorusGeometry(1.151,.014,6,100),seamMaterial,ball);seam.rotation.set(rx,ry,rz);
  }
  models.forEach((model,i)=>{model.visible=i===0;});

  const restingHeights = animatedBalls.map(object => object.position.y);
  let disposed=false, frame=0, visible=true, dragging=false, lastX=0, lastY=0, shadersReady=false;
  let yaw=-.12, targetYaw=-.12, pitch=0, targetPitch=0, velocity=0, bounce=0, active=0;
  let frames=0, start=performance.now(), lastFrame=start, lastPaint=0, manualUntil=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=new THREE.Vector2();const raycaster=new THREE.Raycaster();
  const schedule=()=>{if(!disposed&&shadersReady&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);};
  function render(now:number) {
    frame=0;if(disposed||!visible||document.hidden)return;
    // Keep direct interaction fluid, but leave more main-thread time for page
    // navigation when the sculpture is only turning in the background.
    if (!reduced.matches && !dragging && now >= manualUntil && now - lastPaint < 1000 / 30 - 1) { schedule(); return; }
    lastPaint = now;
    const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
    const manual=now<manualUntil;
    if(!reduced.matches||manual) {
      yaw+=(targetYaw-yaw)*.13; pitch+=(targetPitch-pitch)*.13;
      targetYaw+=velocity*dt;velocity*=Math.pow(.12,dt);
      if(!dragging&&!reduced.matches)targetYaw+=dt*.11;
      bounce*=Math.pow(.07,dt);
      const time=(now-start)/1000;
      pivot.position.y=(reduced.matches?0:Math.sin(time*1.25)*.065)+Math.sin(bounce*3)*bounce*.22;
      models[active].scale.setScalar(1+Math.min(bounce,.35)*.08);
      animatedBalls[active].rotation.y+=dt*(reduced.matches?0:.22)+velocity*dt*.45;
      animatedBalls[active].position.y=restingHeights[active]+Math.sin(bounce*Math.PI)*bounce*.95;
      ring.scale.setScalar(1+bounce*.075);
      ringMaterial.emissiveIntensity=.55+bounce*1.2;
      orbit.rotation.z=reduced.matches?0:Math.sin(time*.2)*.08;
      satellite.position.z=-.6+Math.sin(time*.4)*.15;
    }
    pivot.rotation.set(pitch,yaw,0);
    renderer.render(scene,camera);frames++;
    canvas.dataset.rotation=yaw.toFixed(4);canvas.dataset.frames=String(frames);
    if(frames===1)onReady();
    if(!reduced.matches||manual)schedule();
  }
  function interact(){manualUntil=performance.now()+1800;lastFrame=performance.now();schedule();}
  function resize(){const bounds=host.getBoundingClientRect();if(!bounds.width||!bounds.height)return;renderer.setSize(bounds.width,bounds.height,false);camera.aspect=bounds.width/bounds.height;camera.position.z=camera.aspect<.85?10.2:8.5;camera.updateProjectionMatrix();schedule();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){lastFrame=performance.now();schedule();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'80px'});intersection.observe(host);
  function down(event:PointerEvent){if(event.button!==0)return;dragging=true;lastX=event.clientX;lastY=event.clientY;canvas.setPointerCapture(event.pointerId);canvas.dataset.dragging='true';velocity=0;interact();}
  function move(event:PointerEvent){
    if(dragging){const dx=event.clientX-lastX;targetYaw+=dx*.013;targetPitch=THREE.MathUtils.clamp(targetPitch+(event.clientY-lastY)*.008,-.6,.6);velocity=dx*.12;lastX=event.clientX;lastY=event.clientY;interact();}
  }
  function up(event:PointerEvent){if(!dragging)return;dragging=false;canvas.dataset.dragging='false';if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);interact();}
  function click(event:MouseEvent){const bounds=canvas.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(pointer,camera);if(raycaster.intersectObject(models[active],true).length){bounce=1;velocity+=2;interact();}}
  function keyboard(event:KeyboardEvent){if(['ArrowLeft','ArrowRight',' ','Enter','r','R'].includes(event.key)){event.preventDefault();if(event.key==='ArrowLeft')targetYaw-=Math.PI/5;else if(event.key==='ArrowRight')targetYaw+=Math.PI/5;else if(event.key==='r'||event.key==='R'){targetYaw=-.12;targetPitch=0;velocity=0;}else{velocity=11;targetYaw+=Math.PI*.5;bounce=1;}interact();}}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{lastFrame=performance.now();schedule();}}
  function motion(){manualUntil=0;targetYaw=yaw;targetPitch=pitch;velocity=0;pivot.position.y=0;models[active].scale.setScalar(1);animatedBalls[active].position.y=restingHeights[active];ring.scale.setScalar(1);ringMaterial.emissiveIntensity=.55;schedule();}
  function contextLost(event:Event){event.preventDefault();cancelAnimationFrame(frame);frame=0;host.dataset.contextLost='true';}
  function contextRestored(){delete host.dataset.contextLost;schedule();}
  canvas.addEventListener('keydown',keyboard);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('click',click);
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',motion);
  resize();
  // Parallel shader compilation avoids blocking the first navigation on GPU
  // program setup. The lightweight preview stays visible until the first frame.
  void renderer.compileAsync(scene, camera).then(() => {
    if (disposed) return;
    shadersReady = true;
    lastFrame = performance.now();
    schedule();
  }).catch(() => {
    if (disposed) return;
    shadersReady = true;
    schedule();
  });
  return {
    setSport(sport){if(sport<0||sport>2)return;active=sport;models.forEach((model,i)=>{model.visible=i===active;model.scale.setScalar(1);});canvas.dataset.sport=String(sport);targetYaw=-.12;targetPitch=0;if(reduced.matches){yaw=targetYaw;pitch=0;bounce=0;}else{yaw=-.65;bounce=.7;}if(reduced.matches){manualUntil=0;schedule();}else interact();},
    dispose(){disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motion);canvas.removeEventListener('keydown',keyboard);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('click',click);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);const geometries=new Set<THREE.BufferGeometry>();const materials=new Set<THREE.Material>();scene.traverse(object=>{if(object instanceof THREE.Mesh){geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).forEach(item=>materials.add(item));}});geometries.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());textures.forEach(item=>item.dispose());key.shadow.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();},
  };
}

