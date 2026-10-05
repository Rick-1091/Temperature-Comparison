import * as THREE from 'three';
export function initWater(){
const canvas=document.getElementById('jinxi-water'),renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-4,4,4,-4,.1,100);camera.position.set(5,7,7);camera.lookAt(0,0,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x23565c,3));const sun=new THREE.DirectionalLight(0xffe4b5,3);sun.position.set(3,8,5);scene.add(sun);
const water=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0x387c81,roughness:.3}));water.rotation.x=-Math.PI/2;scene.add(water);
const boat=new THREE.Group();scene.add(boat);
function box(w,h,d,x,y,z,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color}));m.position.set(x,y,z);boat.add(m);return m;}
box(1.35,.28,3.25,0,.23,0,0x78482c);box(1.15,.13,2.9,0,.4,0,0xbb8853);
for(const x of [-.59,.59])box(.1,.25,2.8,x,.53,0,0x6b4029);
for(const z of [-1,1])for(const x of [-.52,.52])box(.08,1.15,.08,x,1.04,z,0x523b2b);
const roof=box(1.55,.14,2.75,0,1.65,0,0xd4bb8e);roof.rotation.z=.04;
box(.95,.1,.2,0,.65,-.5,0x765038);box(.95,.1,.2,0,.65,.6,0x765038);
const person=new THREE.Group();person.position.set(0,.65,1.05);boat.add(person);
const body=new THREE.Mesh(new THREE.CylinderGeometry(.15,.2,.47,10),new THREE.MeshStandardMaterial({color:0xe8ad54}));body.position.y=.27;person.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.13,12,12),new THREE.MeshStandardMaterial({color:0xb97c53}));head.position.y=.65;person.add(head);
const hat=new THREE.Mesh(new THREE.ConeGeometry(.3,.12,16),new THREE.MeshStandardMaterial({color:0xe9d0a1}));hat.position.y=.82;person.add(hat);
const oar=new THREE.Group();oar.position.set(.2,.7,1.15);boat.add(oar);
const pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,2.8,8),new THREE.MeshStandardMaterial({color:0x65432d}));pole.rotation.z=Math.PI/2;pole.position.x=1.05;oar.add(pole);
const blade=new THREE.Mesh(new THREE.BoxGeometry(.52,.04,.2),new THREE.MeshStandardMaterial({color:0xb28250}));blade.position.x=2.35;oar.add(blade);oar.rotation.z=-.3;
const rings=[];for(let i=0;i<9;i++){const ring=new THREE.Mesh(new THREE.RingGeometry(1+i*.7,1.015+i*.7,64),new THREE.MeshBasicMaterial({color:0xafd7d1,transparent:true,opacity:.28,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.01;scene.add(ring);rings.push(ring);}
let visible=false,paused=false;document.getElementById('boat-motion').addEventListener('click',e=>{paused=!paused;e.currentTarget.setAttribute('aria-pressed',String(paused));});const reduced=matchMedia('(prefers-reduced-motion:reduce)');
function resize(){const n=canvas.parentElement.clientWidth;renderer.setSize(n,n,false);}new ResizeObserver(resize).observe(canvas.parentElement);resize();
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(canvas);
renderer.setAnimationLoop(ms=>{if(!visible)return;if(paused)return;const t=reduced.matches?0:ms*.0005;boat.rotation.y=-.3+Math.sin(t)*.13;boat.position.y=Math.sin(t*2)*.04;boat.position.x=Math.sin(t*.6)*.35;oar.rotation.y=Math.sin(t*3)*.28;rings.forEach((r,i)=>{r.scale.setScalar(1+Math.sin(t+i)*.025);});renderer.render(scene,camera);});
}
