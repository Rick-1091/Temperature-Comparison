import * as THREE from 'three';
// A bounded, fixed-camera diorama; no downloaded models or open-world controls.
export function createCourtyard(host) {
 const scene=new THREE.Scene();scene.background=new THREE.Color('#b7d2c8');
 const camera=new THREE.OrthographicCamera(-7,7,5,-5,.1,100);camera.position.set(10,10,12);camera.lookAt(0,1,0);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;host.replaceChildren(renderer.domElement);
 const ambient=new THREE.HemisphereLight('#e9f3e0','#716f55',2);scene.add(ambient);
 const light=new THREE.DirectionalLight('#fff3c9',3);light.position.set(-4,10,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-10;light.shadow.camera.right=10;light.shadow.camera.top=10;light.shadow.camera.bottom=-10;scene.add(light);
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85,flatShading:true});
 const box=(w,h,d,c,x,y,z,parent=scene)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 box(12,.35,10,'#b9be86',0,-.2,0);box(3.4,2.8,3,'#d0ab7c',-3,1.4,-2);
 const roof=new THREE.Mesh(new THREE.ConeGeometry(2.7,1.6,4),mat('#815b44'));roof.position.set(-3,3.55,-2);roof.rotation.y=Math.PI/4;roof.castShadow=true;scene.add(roof);
 box(.75,1.5,.1,'#4b5e53',-3,.75,-.45);box(.65,.65,.1,'#7dada2',-2,1.8,-.45);
 const rack=new THREE.Group();scene.add(rack);box(4,.15,2.4,'#9d7850',1,1,1,rack);
 for(const x of [-.7,2.7])for(const z of [.05,1.95])box(.15,1,.15,'#735c3f',x,.5,z,rack);
 const maize=[];const grainMaterial=mat('#d9a743');
 for(let row=0;row<5;row++)for(let col=0;col<10;col++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.09,.075,.32,7),grainMaterial.clone());m.rotation.z=Math.PI/2;m.position.set(-.7+col*.36,1.15,.18+row*.38);m.castShadow=true;rack.add(m);maize.push(m);}
 const cover=box(4.4,.07,2.8,'#407e78',1,1.55,1);cover.visible=false;
 const storage=box(1.8,.75,1.4,'#a27d51',-3,.37,1.8);box(1.6,.08,1.2,'#dfb74f',-3,.82,1.8).visible=false;
 const stored=new THREE.Group();scene.add(stored);for(let i=0;i<20;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.09,.08,.3,7),mat('#d9a743'));m.rotation.z=Math.PI/2;m.position.set(-3.6+(i%5)*.3,.84+Math.floor(i/5)*.09,1.5+(i%4)*.18);stored.add(m);}stored.visible=false;
 const person=new THREE.Group();person.position.set(3,0,2.5);scene.add(person);box(.55,.8,.36,'#a95d43',0,1.25,0,person);
 for(const x of [-.18,.18])box(.19,.8,.2,'#45594d',x,.45,0,person);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),mat('#7c533f'));head.position.y=1.94;person.add(head);
 const arm=box(.16,.65,.16,'#7c533f',-.38,1.25,0,person);box(.16,.65,.16,'#7c533f',.38,1.25,0,person);
 const clouds=new THREE.Group();scene.add(clouds);for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(.75,8,6),mat('#e4e8dd'));c.scale.set(1.3,.5,.85);c.position.set(-1.5+i*.9,5.7,-1+(i%2)*.6);clouds.add(c);}
 const sun=new THREE.Mesh(new THREE.SphereGeometry(.45,12,8),new THREE.MeshBasicMaterial({color:'#e6b878'}));sun.position.set(-4.8,6.2,0);scene.add(sun);
 const drops=new Float32Array(240*3);for(let i=0;i<drops.length;i+=3){drops[i]=(Math.random()-.5)*10;drops[i+1]=Math.random()*7;drops[i+2]=(Math.random()-.5)*7;}
 const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(drops,3));const rain=new THREE.Points(rainGeo,new THREE.PointsMaterial({color:'#abcbd0',size:.07,transparent:true,opacity:.85}));rain.visible=false;scene.add(rain);
 let choice='all',weather='pending',paused=matchMedia('(prefers-reduced-motion: reduce)').matches,raf,closed=false;
 const originals=maize.map(m=>m.position.clone());
 function resize(){const w=host.clientWidth,h=host.clientHeight||500;renderer.setSize(w,h,false);const aspect=w/h;camera.left=-7*aspect;camera.right=7*aspect;camera.top=7;camera.bottom=-7;camera.updateProjectionMatrix();renderer.render(scene,camera);}
 const ro=new ResizeObserver(resize);ro.observe(host);resize();
 function update(next,actual='pending'){
  choice=next;weather=actual;cover.visible=next==='cover';stored.visible=next==='store'||next==='batch';
  maize.forEach((m,i)=>{m.visible=next!=='store' && (next!=='batch'||i<25);m.position.copy(originals[i]);m.material.color.set(actual==='rain'&&(next==='all'||next==='batch')?'#9b8456':'#d9a743');});
  clouds.children.forEach(c=>c.material.color.set(actual==='rain'?'#778784':'#e4e8dd'));scene.background.set(actual==='rain'?'#93aca6':'#b7d2c8');sun.visible=actual!=='rain';rain.visible=actual==='rain';light.intensity=actual==='rain'?1.2:3;
  if(paused){person.position.x=next==='store'?-2:1.8;renderer.render(scene,camera);}
 }
 let then=performance.now();
 function frame(now){if(closed)return;raf=requestAnimationFrame(frame);if(paused||document.hidden)return;const dt=Math.min((now-then)/1000,.05);then=now;person.position.x=THREE.MathUtils.lerp(person.position.x,choice==='store'?-2:2,dt*3);arm.rotation.z=choice==='cover'?-.6:Math.sin(now*.002)*.12;
  if(rain.visible){for(let i=1;i<drops.length;i+=3){drops[i]-=dt*5;if(drops[i]<0)drops[i]=7;}rainGeo.attributes.position.needsUpdate=true;}
  renderer.render(scene,camera);
 }
 raf=requestAnimationFrame(frame);
 const lost=e=>{e.preventDefault();paused=true;host.dispatchEvent(new CustomEvent('scene-lost',{bubbles:true}));};renderer.domElement.addEventListener('webglcontextlost',lost);
 return {update,setPaused(value){paused=value;then=performance.now();renderer.render(scene,camera);},dispose(){closed=true;cancelAnimationFrame(raf);ro.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();});renderer.dispose();}};
}
