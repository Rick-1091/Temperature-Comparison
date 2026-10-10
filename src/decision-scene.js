import * as THREE from 'three';
import {PREPARATIONS} from './decision-model.js';
import {TRANSPORT_ROUTES,transportBeat,routePoint,smooth} from './decision-motion.js';

// A fixed-camera architectural miniature, with raycast picking and accessible DOM anchors.
export function createCourtyard(host,{onObject=()=>{},onBeat=()=>{}}={}){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e9e4d7');
 const camera=new THREE.OrthographicCamera(-9,9,7,-7,.1,80);camera.position.set(9,12,17);camera.lookAt(0,1.2,0);
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);
 const ambient=new THREE.HemisphereLight('#fffbec','#84776b',2.2);scene.add(ambient);
 const light=new THREE.DirectionalLight('#fff0ce',3.4);light.position.set(-5,12,7);light.castShadow=true;
 light.shadow.mapSize.set(1024,1024);light.shadow.normalBias=.04;Object.assign(light.shadow.camera,{left:-9,right:9,top:9,bottom:-9});scene.add(light);
 const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.82,flatShading:true}));return mats.get(c);}
 function mesh(geometry,c,pos,parent=scene){const m=new THREE.Mesh(geometry,mat(c));m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 const box=(w,h,d,c,x,y,z,parent=scene)=>mesh(new THREE.BoxGeometry(w,h,d),c,[x,y,z],parent);
 const cyl=(r,h,c,x,y,z,parent=scene)=>mesh(new THREE.CylinderGeometry(r,r,h,12),c,[x,y,z],parent);
 const group=name=>{const g=new THREE.Group();g.name=name;scene.add(g);return g;};
 const anchors={};function target(id,g,a){g.traverse(o=>o.userData.action=id);anchors[id]=new THREE.Vector3(...a);}
 const focusRing=new THREE.Mesh(new THREE.RingGeometry(.92,1,36),new THREE.MeshBasicMaterial({color:'#476c60',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));focusRing.rotation.x=-Math.PI/2;focusRing.visible=false;scene.add(focusRing);
 box(12.2,.45,8.8,'#57726b',0,-.35,0);box(11.9,.12,8.5,'#c7b899',0,-.06,0);
 for(let i=0;i<8;i++)box(.6,.04,.5,'#ddd3bb',1.5+Math.sin(i)*.25,.04,-3+i*.7);
 const house=group('house');box(3.2,2.35,2.3,'#e6c59b',.7,1.2,-2.35,house);box(3.4,.12,2.5,'#9c7154',.7,2.43,-2.35,house);
 for(const s of [-1,1]){const r=box(1.95,.12,2.7,'#79594b',.7+s*.75,2.85,-2.35,house);r.rotation.z=-s*.46;}
 for(let i=0;i<10;i++)box(.05,.05,2.75,'#c19b79',-.86+i*.34,2.65+(.8-Math.abs(-.86+i*.34-.7))*.46,-2.35,house);
 box(.72,1.52,.12,'#365c57',.5,.8,-1.15,house);box(.1,.1,.08,'#eab940',.72,.9,-1.06,house);
 for(const x of [-.4,1.65]){box(.65,.65,.12,'#587c78',x,1.65,-1.15,house);box(.7,.06,.16,'#faf2db',x,1.64,-1.04,house);box(.06,.7,.16,'#faf2db',x,1.65,-1.04,house);}
 // Functional shelter on the left, with a raised drying bench beneath its roof.
 const shelter=group('left-shelter');box(3.5,.11,2.7,'#d9c9a8',-3.5,.12,.1,shelter);
 for(const x of [-5,-2])for(const z of [-.95,1.15])box(.14,2.15,.14,'#695540',x,1.15,z,shelter);
 const roof=box(3.65,.18,2.8,'#398980',-3.5,2.35,.1,shelter);roof.rotation.x=.08;
 roof.material=roof.material.clone();roof.material.transparent=true;
 for(let i=0;i<10;i++)box(.045,.04,2.82,'#6eaaa1',-5.1+i*.35,2.47,.1,shelter);
 box(3.2,.12,.12,'#755b43',-3.5,2.12,1.17,shelter);box(2.6,.12,1.6,'#9b7650',-3.5,.6,.15,shelter);
 target('shelter',shelter,[-3.5,2.5,.2]);
 const rack=group('drying-rack');box(3.6,.15,2.2,'#996f48',1.1,.82,1,rack);
 for(let i=0;i<13;i++)box(.055,.025,2.15,'#dac197',-.6+i*.28,.91,1,rack);
 for(const x of [-.5,2.65])for(const z of [.1,1.9])box(.12,.85,.12,'#806244',x,.4,z,rack);
 target('all',rack,[1.3,.9,1.35]);
 const storage=group('storage-box');box(1.65,.95,1.4,'#b48557',-2.5,.5,2.8,storage);
 for(let i=0;i<5;i++)box(1.7,.035,.035,'#e0bd8c',-2.5,.16+i*.18,3.51,storage);
 const lid=new THREE.Group();lid.position.set(-2.5,1.02,2.1);storage.add(lid);box(1.8,.13,1.5,'#765840',0,.03,.7,lid);
 target('store',storage,[-2.5,1.12,3]);
 const roll=group('tarp-roll');const rolled=cyl(.17,1.2,'#348d94',3.6,.3,1.2,roll);rolled.rotation.z=Math.PI/2;
 box(1.6,.18,1.1,'#d4c19f',3.6,.12,1.2,roll);target('cover',roll,[3.6,.5,1.15]);
 const tarp=group('unfolding-tarp');tarp.position.set(3.15,1.17,1);
 const clothGeo=new THREE.PlaneGeometry(4,2.5,24,4);clothGeo.rotateX(-Math.PI/2);clothGeo.translate(2,0,0);
 const clothBase=clothGeo.attributes.position.array.slice();const cloth=mesh(clothGeo,'#267e83',[0,0,0],tarp);cloth.material=cloth.material.clone();cloth.material.side=THREE.DoubleSide;
 const clothSeams=[];for(let i=0;i<6;i++){const seam=box(.016,.018,2.5,'#76bbb5',0,.018,0,tarp);clothSeams.push(seam);}
 const leadingFold=cyl(.09,2.5,'#398e92',0,.08,0,tarp);leadingFold.rotation.x=Math.PI/2;tarp.visible=false;
 let clothProgress=0;
 function unfoldCloth(progress){clothProgress=progress;const width=Math.max(.025,4*progress),positions=clothGeo.attributes.position.array;
  for(let i=0;i<positions.length;i+=3){const x=clothBase[i],fold=Math.max(0,x-width)/Math.max(.025,4-width);positions[i]=-Math.min(x,width);positions[i+1]=.14*Math.sin(fold*Math.PI)*(1-progress);}
  clothGeo.attributes.position.needsUpdate=true;clothGeo.computeVertexNormals();
  clothSeams.forEach((seam,i)=>{seam.position.x=-Math.min(.25+i*.7,width);seam.visible=.25+i*.7<=width;});leadingFold.position.x=-width;leadingFold.visible=progress<.98;rolled.scale.y=1-progress*.85;host.dataset.tarpProgress=progress.toFixed(2);
 }
 const phone=group('information-panel');box(.13,1.15,.13,'#655848',3.5,.6,-1.25,phone);
 const phoneBody=box(.85,1.05,.17,'#263e42',3.5,1.65,-1.25,phone);box(.69,.84,.04,'#38bbb3',3.5,1.68,-1.12,phone);
 for(let i=0;i<3;i++)box(.12,.18+i*.12,.06,'#eff5db',3.24+i*.2,1.55,-1.08,phone);target('signal',phone,[3.5,2.35,-1.1]);
 const desk=group('contract-desk');box(1.15,.08,.8,'#e3cfaa',4.25,.8,2.95,desk);
 for(const x of [3.8,4.7])box(.08,.8,.08,'#72573e',x,.4,2.95,desk);
 const paper=box(.6,.03,.6,'#f9f3df',4.2,.88,2.95,desk);paper.rotation.y=.2;cyl(.16,.07,'#eeb944',4.65,.93,2.95,desk);
 target('hedge',desk,[4.3,1.3,2.9]);
 const ears=[],origins=[],destinations=[],earGeo=new THREE.CylinderGeometry(.065,.085,.36,8);
 for(let i=0;i<48;i++){
  const ear=new THREE.Group(),body=mesh(earGeo,'#eab83e',[0,0,0],ear);body.rotation.z=Math.PI/2;
  for(let k=0;k<5;k++){const kernel=cyl(.087,.018,k%2?'#f0ce62':'#d9a331',-.14+k*.07,0,0,ear);kernel.rotation.z=Math.PI/2;}
  ear.position.set(-.45+(i%8)*.43,1.01,.19+Math.floor(i/8)*.31);scene.add(ear);ear.traverse(o=>o.userData.action='all');ears.push(ear);origins.push(ear.position.clone());
 }
 const person=group('Thoko');person.position.set(2.6,0,2.4);box(.48,.64,.32,'#c56142',0,1.12,0,person);box(.42,.24,.3,'#37535a',0,.75,0,person);
 const legs=[-.14,.14].map(x=>{const g=new THREE.Group();g.position.set(x,.72,0);person.add(g);box(.16,.6,.18,'#37535a',0,-.3,0,g);box(.22,.12,.33,'#544236',0,-.65,.07,g);return g;});
 const arms=[-.32,.32].map(x=>{const g=new THREE.Group();g.position.set(x,1.35,0);person.add(g);box(.14,.45,.14,'#87563f',0,-.2,0,g);return g;});
 mesh(new THREE.SphereGeometry(.23,12,8),'#87563f',[0,1.72,0],person);cyl(.3,.07,'#ddbc70',0,1.91,0,person);cyl(.21,.16,'#e0bf75',0,1.99,0,person);
 const basket=group('carrying-basket');person.add(basket);basket.position.set(0,1,.42);
 box(.76,.06,.62,'#a77a46',0,0,0,basket);for(const z of [-.3,.3])box(.76,.22,.05,'#bd9155',0,.1,z,basket);for(const x of [-.36,.36])box(.05,.22,.62,'#bd9155',x,.1,0,basket);basket.visible=false;
 for(const [x,z] of [[-5,-2.7],[5,-2.8],[5,0]]){cyl(.09,1.1,'#8c6c4c',x,.55,z);for(let i=0;i<3;i++){const leaf=mesh(new THREE.IcosahedronGeometry(.55,1),i%2?'#789379':'#597a69',[x+(i-1)*.35,1.4+i*.18,z]);leaf.scale.y=1.25;}}
 const clouds=group('moving-clouds');for(let i=0;i<8;i++){const c=mesh(new THREE.SphereGeometry(.65,12,8),'#f8f5ea',[-4+i*1.05,4.25+(i%2)*.22,-2.8],clouds);c.scale.set(1.4,.48,.8);c.material=c.material.clone();}
 const sun=mesh(new THREE.SphereGeometry(.36,16,10),'#f2c455',[-4.5,4.7,-2.8]);
 const rainData=new Float32Array(380*6);
 // The same roof footprints govern initial/static rain and moving particles.
 function rainFloor(x,z){
  if(x>-1.05&&x<2.45&&z>-3.7&&z<-.95)return 3.25-Math.abs(x-.7)*.46;
  if(x>-5.33&&x<-1.67&&z>-1.3&&z<1.5)return 2.5;
  if(preparation==='cover'&&x>-.9&&x<3.15&&z>-.25&&z<2.25)return 1.23;
  if(x>-3.35&&x<-1.65&&z>2.1&&z<3.55)return 1.15;
  return .03;
 }
 function resetDrop(i,fromSky=false){const x=(Math.random()-.5)*11,z=(Math.random()-.5)*7.5,floor=rainFloor(x,z)+.1,y=fromSky?5.3:floor+Math.random()*(5.3-floor);rainData.set([x,y,z,x-.05,y+.26,z],i);}
 let preparation='all';
 for(let i=0;i<rainData.length;i+=6)resetDrop(i);
 const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainData,3));
 const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:'#42657d',transparent:true,opacity:.8}));scene.add(rain);rain.visible=false;
 const puddles=group('puddles');for(let i=0;i<6;i++){const p=mesh(new THREE.CircleGeometry(.28+(i%3)*.1,24),'#819fa5',[-.8+i*.6,.035,2.5+Math.sin(i)],puddles);p.rotation.x=-Math.PI/2;p.scale.set(1.6,.65,1);p.castShadow=false;}puddles.visible=false;
 const splashes=group('rain-ripples');const splashGeo=new THREE.RingGeometry(.08,.105,12);
 for(let i=0;i<10;i++){const p=mesh(splashGeo,'#bed0cd',[0,.046,0],splashes);p.rotation.x=-Math.PI/2;p.castShadow=false;p.material=p.material.clone();p.material.transparent=true;p.material.depthWrite=false;p.userData.cycle=-1;}splashes.visible=false;
 const wetMaize=mat('#8c7050').clone(),transferPoint=new THREE.Vector3();
 const tokens=group('contract-value-transfer');for(let i=0;i<6;i++){const c=cyl(.13,.045,'#efbd43',4.1,1,2.9,tokens);c.rotation.x=Math.PI/2;}tokens.visible=false;
 let action=null,phase=0,weather='pending',weatherMix=0,hedged=false,finance=null,paused=false,offscreen=false,closed=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let raf,then=performance.now();
 function finish(){const done=action?.done;action=null;basket.visible=false;person.rotation.x=person.rotation.z=0;person.position.y=0;legs.forEach(l=>l.rotation.x=0);arms.forEach(a=>{a.rotation.x=0;a.rotation.z=0;});host.dataset.busy='false';host.dataset.actionBeat='idle';host.dataset.carriedEars='0';done?.();}
 function destinationsFor(next){const p=PREPARATIONS[next];destinations.length=0;ears.forEach((ear,i)=>{
  const v=origins[i].clone(),count=Math.round(p.storage*48),under=Math.round(p.shelter*48);
  const location=i<count?'storage':i<count+under?'shelter':'rack';ear.userData.location=location;ear.userData.arrived=false;ear.userData.index=i;ear.traverse(o=>o.userData.action=location==='shelter'?'shelter':location==='storage'?'store':'all');
  if(location==='storage')v.set(-3.08+(i%6)*.23,.55+Math.floor(i/12)*.1,2.38+Math.floor(i/6)%2*.27);
  if(location==='shelter')v.set(-4.55+(i%7)*.32,.78,Math.floor(i/7)*.28);
  destinations.push(v);
 });}
 function finalPreparation(){ears.forEach((m,i)=>{m.position.copy(destinations[i]||origins[i]);m.rotation.y=0;m.userData.arrived=m.userData.location!=='rack';});tarp.visible=preparation==='cover';unfoldCloth(preparation==='cover'?1:0);lid.rotation.x=0;roof.material.opacity=preparation==='shelter'?.55:1;person.position.set(...(TRANSPORT_ROUTES[preparation]?.at(-1)||[preparation==='cover'?-.85:2.6,0,2.5]));person.rotation.y=TRANSPORT_ROUTES[preparation]?Math.PI:preparation==='cover'?-Math.PI/2:0;}
 function prepare(next){if(!PREPARATIONS[next])return Promise.resolve();finish();preparation=next;weather='pending';weatherMix=0;
  ears.forEach((m,i)=>{m.position.copy(origins[i]);m.scale.setScalar(1);m.traverse(o=>{if(o.isMesh)o.material=mat(o.geometry===earGeo?'#eab83e':'#f0ce62');});});
  destinationsFor(next);appearance();roof.material.opacity=next==='shelter'?.55:1;tarp.visible=next==='cover';unfoldCloth(0);host.dataset.preparation=next;
  if(reduced.matches||paused){finalPreparation();render();return Promise.resolve();}
  host.dataset.busy='true';return new Promise(done=>{action={kind:'prepare',time:0,duration:next==='all'?.6:next==='cover'?3.6:4.8,done,beat:''};});
 }
 function reveal(actual){finish();finishTransfer();host.dataset.finance=hedged?'awaiting':'none';weather=actual;weatherMix=0;ears.forEach(ear=>{ear.scale.setScalar(1);ear.traverse(o=>{if(o.isMesh)o.material=mat('#eab83e');});});for(let i=0;i<rainData.length;i+=6)resetDrop(i);rainGeo.attributes.position.needsUpdate=true;appearance();host.dataset.weather=actual;if(reduced.matches||paused){weatherMix=1;appearance();render();return Promise.resolve();}
  host.dataset.busy='true';return new Promise(done=>{action={kind:'weather',time:0,duration:3.1,done};});}
 function finishTransfer(){const done=finance?.done;finance=null;tokens.visible=false;done?.();}
 function transfer(kind,animate=true){finishTransfer();const payout=kind==='payout',moving=animate&&!paused&&!reduced.matches;tokens.visible=moving;tokens.children.forEach((coin,i)=>{coin.material=mat(payout?'#26927a':'#d29532');coin.position.set(payout?4.3:2,1,2.8);coin.rotation.y=i*.2;});host.dataset.finance=kind;host.dataset.transferDirection=payout?'to-household':'to-contract';render();return moving?new Promise(done=>{finance={kind,time:0,done};}):Promise.resolve();}
 function purchase(value,animate=true){hedged=value;paper.material=mat(value?'#38bbb3':'#f9f3df');if(value)return transfer('cost',animate);finishTransfer();host.dataset.finance='none';delete host.dataset.transferDirection;render();return Promise.resolve();}
 function settle(payout,animate=true){if(hedged&&payout>0)transfer('payout',animate);else{finishTransfer();host.dataset.finance=hedged?'no-payout':'none';delete host.dataset.transferDirection;}render();}
 function reset(){finish();finishTransfer();weather='pending';weatherMix=0;preparation='all';hedged=false;rolled.scale.y=1;paper.material=mat('#f9f3df');phoneBody.material=mat('#263e42');host.dataset.signalViewed='false';destinationsFor('all');finalPreparation();ears.forEach(m=>{m.scale.setScalar(1);m.traverse(o=>{if(o.isMesh)o.material=mat('#eab83e');});});appearance();host.dataset.weather='pending';host.dataset.preparation='all';host.dataset.finance='none';delete host.dataset.transferDirection;render();}
 function appearance(){const wet=weather==='heavy'?1:weather==='light'?.5:0,m=wet*weatherMix,day=weather==='pending'?0:weatherMix;
  scene.background.set('#e9e4d7').lerp(new THREE.Color('#adb9bf'),m);light.intensity=3.4-m*2.3-(wet?0:day*.5);ambient.intensity=2.2-m*.65;
  light.color.set('#fff0ce').lerp(new THREE.Color('#ffdfab'),wet?0:day*.55);sun.position.set(-4.5-day*1.1,4.7-day*1.2,-2.8+day*.9);
  clouds.children.forEach(c=>c.material.color.set('#f8f5ea').lerp(new THREE.Color('#647887'),m));sun.visible=m<.45;rain.visible=m>.2;puddles.visible=m>.2;splashes.visible=rain.visible&&!reduced.matches;rainGeo.setDrawRange(0,weather==='light'?280:760);rain.material.opacity=weather==='light'?.5:.8;
  puddles.children.forEach(p=>p.scale.set(1.6*smooth(m),.65*smooth(m),1));
  const damage=wet?smooth((weatherMix-.4)/.6):0;wetMaize.color.set('#eab83e').lerp(new THREE.Color('#8c7050'),damage);
  if(wet)ears.forEach(ear=>{const exposed=ear.userData.location==='rack'&&preparation!=='cover';if(exposed){ear.traverse(o=>{if(o.isMesh)o.material=wetMaize;});ear.scale.y=1-(weather==='heavy'?.22:.07)*damage;}});
 }
 function update(dt){if(!action)return;action.time+=dt;const t=Math.min(1,action.time/action.duration),ease=t*t*(3-2*t);
  if(action.kind==='weather'){weatherMix=ease;appearance();}
  else if(preparation==='cover'){unfoldCloth(ease);person.position.set(3.15-4*ease,0,2.5);person.rotation.y=-Math.PI/2;arms.forEach(a=>a.rotation.x=-.85);legs.forEach((l,i)=>l.rotation.x=Math.sin(action.time*9+i*Math.PI)*.18);beat('unfold',0,0);}
  else if(preparation!=='all'){
   const b=transportBeat(t),route=routePoint(TRANSPORT_ROUTES[preparation],b.route),moving=ears.filter(m=>m.userData.location!=='rack');
   person.position.set(...route.point);person.position.y=b.walking?Math.abs(Math.sin(action.time*11))*.025:0;const facing=['pick','place','done'].includes(b.step)?Math.PI:route.heading+(b.step==='return'?Math.PI:0);person.rotation.y+=Math.atan2(Math.sin(facing-person.rotation.y),Math.cos(facing-person.rotation.y))*(1-Math.exp(-dt*18));
   const bend=b.step==='pick'?Math.sin(b.local/.14*Math.PI):b.step==='place'?Math.sin((b.local-.52)/.15*Math.PI):0;person.rotation.x=bend*.14;
   basket.visible=['pick','carry','place'].includes(b.step);legs.forEach((l,i)=>l.rotation.x=b.walking?Math.sin(action.time*11+i*Math.PI)*.3:0);arms.forEach(a=>a.rotation.x=basket.visible?-.85:0);
   lid.rotation.x=preparation==='shelter'?0:-smooth((b.route-.55)/.45)*1.15;person.updateMatrixWorld(true);
   let carried=0;moving.forEach((m,i)=>{const batch=Math.floor(i*3/moving.length),slot=i-Math.ceil(batch*moving.length/3),index=m.userData.index;
    m.userData.arrived=batch<b.trip||batch===b.trip&&b.local>=.67;
    if(m.userData.arrived){m.position.copy(destinations[index]);m.rotation.y=0;return;}
    if(batch!==b.trip){m.position.copy(origins[index]);m.rotation.y=0;return;}
    transferPoint.set((slot%3-1)*.18,1.22+Math.floor(slot/9)*.04,.22+Math.floor(slot/3)*.075);person.localToWorld(transferPoint);
    if(b.step==='pick')m.position.lerpVectors(origins[index],transferPoint,b.pickup);
    else if(b.step==='place')m.position.lerpVectors(transferPoint,destinations[index],b.deposit);
    else m.position.copy(transferPoint);
    m.rotation.y=person.rotation.y*(1-b.deposit);carried++;
   });host.dataset.carriedEars=String(carried);beat(b.step,b.trip+1,moving.length);
  }
  if(t>=1){if(action.kind==='prepare'){finalPreparation();legs.forEach(l=>l.rotation.x=0);arms.forEach(a=>a.rotation.x=0);}finish();}
 }
 function beat(step,trip,total){if(!action||action.beat===`${step}:${trip}`)return;action.beat=`${step}:${trip}`;host.dataset.actionBeat=step;onBeat({step,trip,total,preparation});}
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 function enabled(id){return !!id&&!!host.querySelector(`[data-scene-object="${id}"]:not([hidden]):not(:disabled)`);}
 function previewObject(id){const active=enabled(id)&&!action?id:null;host.dataset.previewObject=active||'';focusRing.visible=!!active;
  if(active){const a=anchors[active],sizes={signal:[.6,.45],shelter:[1.8,1.3],all:[2.05,1.3],cover:[.8,.6],store:[1,.85],hedge:[.75,.6]};focusRing.position.set(a.x,.065,a.z);focusRing.scale.set(...sizes[active],1);}
  render();
 }
 function hitObject(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(scene.children,true).find(h=>h.object.isMesh&&h.object!==focusRing);return hit?.object.userData.action;}
 function pick(e){if(action)return;const id=hitObject(e);if(enabled(id))onObject(id);}
 function hover(e){const id=hitObject(e);if((enabled(id)?id:'')!==host.dataset.previewObject)previewObject(id);}
 const leave=()=>previewObject(null);
 renderer.domElement.addEventListener('pointerup',pick);
 renderer.domElement.addEventListener('pointermove',hover);renderer.domElement.addEventListener('pointerleave',leave);
 let hotspotKey='',worldWidth=host.clientWidth,worldHeight=host.clientHeight||560;
 function placeHotspots(){const labels=[...host.querySelectorAll('[data-scene-object]')].filter(el=>!el.hidden),key=`${worldWidth}:${worldHeight}:`+labels.map(el=>el.dataset.sceneObject+el.textContent).join('|');if(key===hotspotKey)return;hotspotKey=key;
  const placed=[];
  for(const el of labels){const a=anchors[el.dataset.sceneObject];if(!a)continue;const p=a.clone().project(camera),width=el.offsetWidth,height=el.offsetHeight,x=Math.max(width/2+8,Math.min(worldWidth-width/2-8,(p.x+1)*worldWidth/2)),anchorY=(-p.y+1)*worldHeight/2;
   const candidates=[0,height+10,-height-10,2*(height+10),-2*(height+10)].map(d=>Math.max(height/2+42,Math.min(worldHeight-height/2-8,anchorY+d)));
   const y=candidates.find(y=>placed.every(r=>Math.abs(x-r.x)>=(width+r.width)/2+7||Math.abs(y-r.y)>=(height+r.height)/2+7))??candidates[0];
   el.style.left=x+'px';el.style.top=y+'px';const dy=y-anchorY;el.style.setProperty('--hotspot-stem',Math.max(0,Math.abs(dy)-height/2)+'px');el.dataset.stem=dy>=0?'up':'down';placed.push({x,y,width,height});
  }
 }
 function render(){renderer.render(scene,camera);host.dataset.protectedEars=String(ears.filter(e=>e.userData.arrived||preparation==='cover'&&clothProgress>.98).length);placeHotspots();}
 function resize(){const w=host.clientWidth,h=host.clientHeight||560;worldWidth=w;worldHeight=h;renderer.setSize(w,h,false);const aspect=w/h,v=Math.max(5.6,7.7/aspect);camera.left=-v*aspect;camera.right=v*aspect;camera.top=v;camera.bottom=-v;camera.updateProjectionMatrix();render();}
 const ro=new ResizeObserver(resize);ro.observe(host);resize();
 function frame(now){if(closed)return;raf=requestAnimationFrame(frame);const dt=Math.min((now-then)/1000,.05);then=now;if(offscreen||document.hidden||paused||(reduced.matches&&!action))return;
  if(!reduced.matches){phase+=dt;clouds.position.x=Math.sin(phase*.14)*.65;if(!action)arms.forEach((a,i)=>a.rotation.z=Math.sin(phase*1.5+i)*.06);
   if(rain.visible){const count=weather==='light'?140:380;for(let i=0;i<count*6;i+=6){const delta=dt*(weather==='heavy'?9:4);rainData[i+1]-=delta;rainData[i+4]-=delta;if(rainData[i+1]<rainFloor(rainData[i],rainData[i+2]))resetDrop(i,true);}rainGeo.attributes.position.needsUpdate=true;}
   if(splashes.visible)splashes.children.forEach((p,i)=>{const clock=phase*(weather==='heavy'?1.5:.7)+i*.13,cycle=Math.floor(clock),f=clock-cycle;if(cycle!==p.userData.cycle){p.userData.cycle=cycle;let x,z;do{x=(Math.random()-.5)*10;z=(Math.random()-.5)*7;}while(rainFloor(x,z)>.1);p.position.set(x,.046,z);}p.scale.setScalar(.3+f*2);p.material.opacity=(1-f)*.55;});
   if(finance){finance.time+=dt;const t=Math.min(1,finance.time/1.1);tokens.children.forEach((coin,i)=>{const f=Math.max(0,Math.min(1,t*1.5-i*.07)),payout=finance.kind==='payout';coin.position.set(payout?4.3-f*2.4:2+f*2.3,1+Math.sin(f*Math.PI)*1.2,2.8);coin.rotation.y+=dt*3;});if(t===1)finishTransfer();}
  }update(dt);render();
 }raf=requestAnimationFrame(frame);
 const lost=e=>{e.preventDefault();host.dispatchEvent(new CustomEvent('scene-lost',{bubbles:true}));};renderer.domElement.addEventListener('webglcontextlost',lost);
 const reduce=()=>{if(reduced.matches){if(action?.kind==='prepare')finalPreparation();if(action?.kind==='weather'){weatherMix=1;appearance();}finish();finishTransfer();splashes.visible=false;render();}};reduced.addEventListener('change',reduce);
 reset();
 return {prepare,reveal,purchase,settle,reset,previewObject,refreshHotspots:placeHotspots,inspectStorage(){lid.rotation.x=-.95;render();},setPaused(value){paused=value;if(value){if(action?.kind==='prepare')finalPreparation();if(action?.kind==='weather'){weatherMix=1;appearance();}finish();finishTransfer();}render();},setVisible(value){offscreen=!value;then=performance.now();},showSignal(){phoneBody.material=mat('#1965e9');host.dataset.signalViewed='true';render();},
  dispose(){closed=true;cancelAnimationFrame(raf);finish();finishTransfer();ro.disconnect();reduced.removeEventListener('change',reduce);renderer.domElement.removeEventListener('pointerup',pick);renderer.domElement.removeEventListener('pointermove',hover);renderer.domElement.removeEventListener('pointerleave',leave);const geometries=new Set(),materials=new Set([wetMaize]);scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});mats.forEach(m=>materials.add(m));geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();}
 };
}
