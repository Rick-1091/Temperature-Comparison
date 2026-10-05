import * as THREE from 'three';

const palette={waterDeep:'#22585c',waterLight:'#4f9290',wood:0x754c36,deck:0xb98e62,trim:0x563d30,canvas:0xe3dac2,shirt:0x567b71,skin:0xb68760};
export function initWater(){
  const canvas=document.getElementById('jinxi-water');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x316d70,1);
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-4.1,4.1,4.1,-4.1,.1,50);
  camera.position.set(5,7,7);camera.lookAt(0,.35,0);
  scene.add(new THREE.HemisphereLight(0xf4f1e8,0x315d59,2));
  const sun=new THREE.DirectionalLight(0xfff0d8,2.1);sun.position.set(-3,8,4);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.1,far:25});
  sun.shadow.normalBias=.03;scene.add(sun);
  const waterMaterial=new THREE.ShaderMaterial({
    uniforms:{time:{value:0},deep:{value:new THREE.Color(palette.waterDeep)},light:{value:new THREE.Color(palette.waterLight)}},
    vertexShader:'varying vec2 point;void main(){point=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform float time;uniform vec3 deep;uniform vec3 light;varying vec2 point;
      void main(){
        vec2 p=point;float a=sin(p.x*1.5+p.y*.7+time*.28);
        float b=sin(p.y*3.1-p.x*.4-time*.34);
        float c=sin(p.x*6.+sin(p.y*2.+time*.2));
        float wash=.45+a*.08+b*.035;
        float ripple=sin(p.y*5.+sin(p.x*2.1+time*.2)*1.2+sin(p.x*.9-p.y*.8)*.9);
        float glint=pow(max(0.,ripple),12.)*.018*(.5+.5*sin(p.x*3.+p.y));
        vec3 color=mix(deep,light,wash)+glint+c*.007;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const water=new THREE.Mesh(new THREE.PlaneGeometry(30,30),waterMaterial);water.rotation.x=-Math.PI/2;scene.add(water);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.19}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.005;shadow.receiveShadow=true;scene.add(shadow);
  const boat=new THREE.Group();scene.add(boat);
  const materials=new Map();
  function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.82}));return materials.get(color);}
  function mesh(geometry,color,parent=boat){const m=new THREE.Mesh(geometry,material(color));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,x,y,z,color,parent=boat){const m=mesh(new THREE.BoxGeometry(w,h,d),color,parent);m.position.set(x,y,z);return m;}
  // Tapered bow, individual deck planks and a lightly arched fabric canopy replace the blocky raft.
  const outline=new THREE.Shape();
  [[-.55,-1.75],[.55,-1.75],[.72,-1.2],[.72,1.12],[.42,1.68],[0,1.92],[-.42,1.68],[-.72,1.12],[-.72,-1.2]].forEach(([x,z],i)=>i?outline.lineTo(x,z):outline.moveTo(x,z));
  outline.closePath();
  const hull=mesh(new THREE.ExtrudeGeometry(outline,{depth:.24,bevelEnabled:true,bevelThickness:.045,bevelSize:.05,bevelSegments:2,steps:1}),palette.wood);
  hull.rotation.x=Math.PI/2;hull.position.y=.36;
  for(let i=0;i<13;i++)box(1.18,.055,.205,0,.41,-1.3+i*.215,i%3?palette.deck:0xac8057);
  for(const x of [-.65,.65]){
    box(.075,.18,2.65,x,.53,-.05,palette.trim);
    for(const z of [-1,1])box(.065,1.02,.065,x*.82,1.03,z,palette.trim);
  }
  for(const z of [-.58,.52])box(1.1,.08,.24,0,.65,z,palette.trim);
  const canopy=new THREE.Shape();canopy.moveTo(-.85,1.5);canopy.quadraticCurveTo(0,1.88,.85,1.5);
  canopy.lineTo(.85,1.43);canopy.quadraticCurveTo(0,1.8,-.85,1.43);canopy.closePath();
  const roof=mesh(new THREE.ExtrudeGeometry(canopy,{depth:2.55,bevelEnabled:false,steps:1}),palette.canvas);roof.position.z=-1.3;
  for(const z of [-1.3,1.25]){
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.85,1.5,z),new THREE.Vector3(0,1.88,z),new THREE.Vector3(.85,1.5,z));
    mesh(new THREE.TubeGeometry(curve,20,.018,6,false),0xb6aa8c);
  }
  const person=new THREE.Group();person.position.set(0,.48,1.25);boat.add(person);
  const body=mesh(new THREE.CylinderGeometry(.14,.19,.42,12),palette.shirt,person);body.position.y=.25;
  const head=mesh(new THREE.SphereGeometry(.115,16,12),palette.skin,person);head.position.y=.57;
  const hat=mesh(new THREE.ConeGeometry(.25,.10,20),0xd3be94,person);hat.position.y=.71;
  const oar=new THREE.Group();oar.position.set(.13,.62,1.2);boat.add(oar);
  const pole=mesh(new THREE.CylinderGeometry(.022,.022,2.5,10),palette.trim,oar);pole.rotation.z=Math.PI/2;pole.position.x=1;
  box(.42,.045,.17,2.15,0,0,palette.deck,oar);
  const wake=new THREE.Group();scene.add(wake);
  const trails=[];
  for(let i=0;i<5;i++){
    const points=[];for(let j=0;j<=30;j++){const x=(j/30-.5)*2;points.push(new THREE.Vector3(x,0,2.02+.22*x*x));}
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xb5d1c7,transparent:true,opacity:.18,depthWrite:false}));
    line.position.y=.018;wake.add(line);trails.push(line);
  }
  const paddleRing=new THREE.Mesh(new THREE.RingGeometry(.18,.19,48),new THREE.MeshBasicMaterial({color:0xc4ddd3,transparent:true,opacity:.15,side:THREE.DoubleSide,depthWrite:false}));
  paddleRing.rotation.x=-Math.PI/2;paddleRing.position.y=.02;scene.add(paddleRing);
  let visible=false,time=0,last=0,raf=0;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const moving=()=>visible&&!reduced.matches&&!document.hidden;
  function draw(){
    waterMaterial.uniforms.time.value=time;
    boat.position.set(Math.sin(time*.19)*.18,.025+Math.sin(time*.9)*.028,Math.cos(time*.17)*.12);
    boat.rotation.set(Math.sin(time*.7)*.008,-.3+Math.sin(time*.35)*.055,Math.sin(time*.8)*.012);
    const stroke=Math.sin(time*1.25);
    oar.rotation.set(0,stroke*.24,-.24+Math.cos(time*1.25)*.08);
    person.rotation.z=Math.sin(time*1.25)*.018;
    wake.position.set(boat.position.x,0,boat.position.z);wake.rotation.y=boat.rotation.y;
    trails.forEach((line,i)=>{
      const age=(time*.15+i/5)%1;line.position.z=age*1.5;line.scale.x=.65+age*.65;
      line.material.opacity=(1-age)*.16;
    });
    const tip=new THREE.Vector3(2.2,0,0);oar.localToWorld(tip);
    paddleRing.position.set(tip.x,.02,tip.z);paddleRing.scale.setScalar(.75+(stroke+1)*.35);
    paddleRing.material.opacity=.04+Math.max(0,-stroke)*.12;
    renderer.render(scene,camera);
  }
  function tick(ms){
    raf=0;if(!moving()){last=0;canvas.dataset.motionState=reduced.matches?'reduced':'idle';return;}
    if(last)time+=Math.min((ms-last)/1000,.05);last=ms;draw();raf=requestAnimationFrame(tick);
  }
  function sync(){
    if(raf)cancelAnimationFrame(raf);raf=0;last=0;
    canvas.dataset.motionState=reduced.matches?'reduced':visible&&!document.hidden?'playing':'idle';
    draw();if(moving())raf=requestAnimationFrame(tick);
  }
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('wb-language',sync);
  const resize=new ResizeObserver(()=>{const n=canvas.parentElement.clientWidth;renderer.setSize(n,n,false);draw();});resize.observe(canvas.parentElement);
  const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();});observer.observe(canvas);
  sync();
}
