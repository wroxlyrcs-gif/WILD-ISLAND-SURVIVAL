(() => {
"use strict";
const $ = id => document.getElementById(id);
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const state = {
  running:false, paused:false, last:0, elapsed:0, day:0.25,
  stats:{health:100,food:100,water:100,energy:100},
  inventory:{Banana:3,Coconut:2,Wood:0,Stone:0,Fiber:0,Berries:0,Campfire:0,Axe:0},
  sensitivity:1, quality:"medium", player:{x:0,z:10,vy:0,onGround:true,angle:0},
  resources:[], animals:[], buildings:[], camera:{yaw:0,pitch:0.72,distance:13},
  move:{x:0,y:0}, sprint:false, discovered:new Set(["Sahil"])
};
let scene,camera,renderer,player,clockSun,ground;
const resourceMeshes=[];
const materials={wood:0x9a7046,leaf:0x2f7144,sand:0xcbb77d,water:0x2388a1};
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),1700)}
function showModal(id){$(id).classList.remove("hidden");}
function hideModal(id){$(id).classList.add("hidden")}
function addMesh(geo,mat,x,y,z,parent=scene){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function initScene(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x8cc8d2);scene.fog=new THREE.Fog(0x8cc8d2,65,230);
  camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);
  renderer=new THREE.WebGLRenderer({antialias:state.quality!=="low",powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,state.quality==="high"?1.7:1.25));renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=state.quality!=="low";renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  $("game-container").appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xd8f1ff,0x52613b,1.45));
  clockSun=new THREE.DirectionalLight(0xffe2ad,1.6);clockSun.position.set(35,65,20);clockSun.castShadow=true;clockSun.shadow.mapSize.set(1024,1024);scene.add(clockSun);
  const ocean=addMesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({color:0x167d9a,roughness:.28,metalness:.05}),0,-1.2,0);ocean.rotation.x=-Math.PI/2;
  const islandGeo=new THREE.CircleGeometry(105,96);
  const islandMat=new THREE.MeshStandardMaterial({color:materials.sand,roughness:1});
  ground=addMesh(islandGeo,islandMat,0,-.15,0);ground.rotation.x=-Math.PI/2;
  const grass=addMesh(new THREE.CircleGeometry(78,80),new THREE.MeshStandardMaterial({color:0x426f3c,roughness:1}),0,-.02,0);grass.rotation.x=-Math.PI/2;
  makeTerrainDecor();makePlayer();spawnResources();makeLandmarks();
  addEventListener("resize",resize);
}
function makeTerrainDecor(){
  for(let i=0;i<95;i++){
    const a=Math.random()*Math.PI*2,r=20+Math.random()*68,x=Math.cos(a)*r,z=Math.sin(a)*r;
    const trunk=addMesh(new THREE.CylinderGeometry(.22,.38,4.2,7),new THREE.MeshStandardMaterial({color:0x765033}),x,1.9,z);
    const crown=addMesh(new THREE.ConeGeometry(2.3,3.6,7),new THREE.MeshStandardMaterial({color:i%3===0?0x285f3a:0x367c46}),x,5.3,z);
    crown.rotation.z=(Math.random()-.5)*.18;
  }
  for(let i=0;i<38;i++){
    const a=Math.random()*Math.PI*2,r=8+Math.random()*88;
    addMesh(new THREE.DodecahedronGeometry(.4+Math.random()*1.1),new THREE.MeshStandardMaterial({color:0x77796b,roughness:1}),Math.cos(a)*r,.2,Math.sin(a)*r);
  }
}
function makePlayer(){
  player=new THREE.Group();
  const body=addMesh(new THREE.CapsuleGeometry(.48,.85,4,8),new THREE.MeshStandardMaterial({color:0x344d50}),0,1,0,player);
  const head=addMesh(new THREE.SphereGeometry(.32,16,12),new THREE.MeshStandardMaterial({color:0xc99568}),0,1.85,0,player);
  const pack=addMesh(new THREE.BoxGeometry(.55,.65,.28),new THREE.MeshStandardMaterial({color:0x6e5937}),0,1.05,-.42,player);
  player.position.set(state.player.x,0,state.player.z);scene.add(player);
}
function spawnResources(){
  const types=[["Wood","🪵",0x8d633e],["Stone","🪨",0x85877e],["Fiber","🌿",0x5d9c54],["Berries","🫐",0x8e4e9c],["Banana","🍌",0xe5c64b],["Coconut","🥥",0x79543b]];
  for(let i=0;i<75;i++){
    const type=types[i%types.length],a=Math.random()*Math.PI*2,r=8+Math.random()*88,x=Math.cos(a)*r,z=Math.sin(a)*r;
    let mesh;
    if(type[0]==="Wood")mesh=addMesh(new THREE.CylinderGeometry(.12,.15,1.5,6),new THREE.MeshStandardMaterial({color:type[2]}),x,.55,z);
    else if(type[0]==="Stone")mesh=addMesh(new THREE.DodecahedronGeometry(.55),new THREE.MeshStandardMaterial({color:type[2]}),x,.4,z);
    else mesh=addMesh(new THREE.IcosahedronGeometry(.42),new THREE.MeshStandardMaterial({color:type[2]}),x,.55,z);
    mesh.userData={type:type[0],active:true};state.resources.push(mesh);
  }
}
function makeLandmarks(){
  // A small abandoned camp, visible as a landmark rather than a completed quest location.
  for(let i=0;i<4;i++){
    const post=addMesh(new THREE.BoxGeometry(.25,2.2,.25),new THREE.MeshStandardMaterial({color:0x745034}),-17+i*2,1,-18);
    post.rotation.z=.06;
  }
  const roof=addMesh(new THREE.ConeGeometry(2.2,1.5,4),new THREE.MeshStandardMaterial({color:0x6d5035}),-14,2.8,-18);roof.rotation.y=Math.PI/4;
}
function resize(){if(!camera||!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
function updateCamera(dt){
  const p=player.position, c=state.camera;
  const horizontal=Math.cos(c.pitch)*c.distance;
  const target=new THREE.Vector3(p.x+Math.sin(c.yaw)*horizontal,p.y+Math.sin(c.pitch)*c.distance,p.z+Math.cos(c.yaw)*horizontal);
  camera.position.lerp(target,1-Math.pow(.001,dt));camera.lookAt(p.x,p.y+1,p.z);
}
function updatePlayer(dt){
  const len=Math.hypot(state.move.x,state.move.y);if(len>.05){
    let x=state.move.x/Math.max(1,len),y=state.move.y/Math.max(1,len);
    const speed=state.sprint&&state.stats.energy>1?7.5:4.2;
    const forwardX=-Math.sin(state.camera.yaw),forwardZ=-Math.cos(state.camera.yaw);
    const rightX=Math.cos(state.camera.yaw),rightZ=-Math.sin(state.camera.yaw);
    const dx=(rightX*x+forwardX*(-y))*speed*dt,dz=(rightZ*x+forwardZ*(-y))*speed*dt;
    const nx=player.position.x+dx,nz=player.position.z+dz;
    if(Math.hypot(nx,nz)<98){player.position.x=nx;player.position.z=nz}
    player.rotation.y=Math.atan2(dx,dz);
    if(state.sprint&&state.stats.energy>0)state.stats.energy=Math.max(0,state.stats.energy-13*dt);
  } else state.stats.energy=Math.min(100,state.stats.energy+5*dt);
  player.position.y=0;
}
function updateSurvival(dt){
  state.elapsed+=dt;state.day=(state.day+dt/360)*1%1;
  state.stats.food=Math.max(0,state.stats.food-.055*dt);
  state.stats.water=Math.max(0,state.stats.water-.085*dt);
  if(state.stats.food===0||state.stats.water===0)state.stats.health=Math.max(0,state.stats.health-1.1*dt);
  clockSun.position.set(Math.cos(state.day*Math.PI*2)*50,Math.max(8,Math.sin(state.day*Math.PI*2)*60),25);
  clockSun.intensity=.35+Math.max(0,Math.sin(state.day*Math.PI*2))*1.3;
  scene.background.setHSL(.53,.35,.22+Math.max(0,Math.sin(state.day*Math.PI*2))*.35);
  scene.fog.color.copy(scene.background);
  updateStats();
}
function updateStats(){
  for(const key of ["health","food","water","energy"]){const value=state.stats[key];$(key+"-val").textContent=Math.round(value);$(key+"-fill").style.width=value+"%"}
}
function nearestResource(){
  let best=null,distance=4.2;
  for(const mesh of state.resources){if(!mesh.userData.active)continue;const d=mesh.position.distanceTo(player.position);if(d<distance){distance=d;best=mesh}}
  return best;
}
function collect(){
  const mesh=nearestResource();if(!mesh){toast("Yakında toplanabilecek kaynak yok.");return}
  const type=mesh.userData.type;state.inventory[type]=(state.inventory[type]||0)+1;mesh.userData.active=false;mesh.visible=false;
  toast(type+" toplandı.");renderInventory();
}
const recipes=[
  {name:"Balta",cost:{Wood:3,Stone:2},out:"Axe",icon:"🪓"},
  {name:"Kamp Ateşi",cost:{Wood:5,Stone:2},out:"Campfire",icon:"🔥"},
  {name:"Barınak",cost:{Wood:10,Fiber:5},out:"Shelter",icon:"⛺"},
  {name:"Olta",cost:{Wood:2,Fiber:3},out:"FishingRod",icon:"🎣"}
];
function craft(recipe){
  for(const [item,count] of Object.entries(recipe.cost)){if((state.inventory[item]||0)<count){toast("Yetersiz malzeme: "+item);return}}
  for(const [item,count] of Object.entries(recipe.cost))state.inventory[item]-=count;
  state.inventory[recipe.out]=(state.inventory[recipe.out]||0)+1;
  toast(recipe.name+" üretildi.");renderInventory();renderCraft();
}
function renderInventory(){
  const list=$("inventory-list");list.innerHTML="";
  const labels={Wood:"Odun",Stone:"Taş",Fiber:"Lif",Berries:"Meyve",Banana:"Muz",Coconut:"Hindistan cevizi",Axe:"Balta",Campfire:"Kamp ateşi",Shelter:"Barınak",FishingRod:"Olta"};
  for(const [key,value] of Object.entries(state.inventory)){if(value>0){const el=document.createElement("div");el.className="item";el.textContent=(labels[key]||key)+" × "+value;list.appendChild(el)}}
  if(!list.children.length)list.textContent="Envanter boş.";
}
function renderCraft(){
  const list=$("craft-list");list.innerHTML="";
  for(const recipe of recipes){const row=document.createElement("div");row.className="recipe";const info=document.createElement("span");info.textContent=recipe.icon+" "+recipe.name+" — "+Object.entries(recipe.cost).map(([k,v])=>k+" "+v).join(", ");const btn=document.createElement("button");btn.textContent="ÜRET";btn.onclick=()=>craft(recipe);row.append(info,btn);list.appendChild(row)}
}
function saveGame(){
  const data={version:1,stats:state.stats,inventory:state.inventory,player:{x:player.position.x,z:player.position.z},resources:state.resources.map(m=>m.userData.active),day:state.day};
  try{localStorage.setItem("wis-save",JSON.stringify(data));toast("Oyun kaydedildi.");}catch(e){toast("Kayıt yapılamadı.");}
}
function loadGame(){
  try{const raw=localStorage.getItem("wis-save");if(!raw)return false;const d=JSON.parse(raw);if(d.version!==1)return false;
    Object.assign(state.stats,d.stats||{});Object.assign(state.inventory,d.inventory||{});if(d.player){player.position.set(d.player.x||0,0,d.player.z||0)}
    if(Array.isArray(d.resources))state.resources.forEach((m,i)=>{m.userData.active=d.resources[i]!==false;m.visible=m.userData.active});
    state.day=Number.isFinite(d.day)?d.day:.25;updateStats();renderInventory();return true;
  }catch(e){console.warn("Save data invalid",e);return false}
}
function startGame(load=false){
  $("main-menu").classList.add("hidden");$("hud").classList.remove("hidden");state.running=true;state.paused=false;
  if(load&&!loadGame())toast("Kayıt bulunamadı. Yeni oyun başlatıldı.");
  state.last=performance.now();requestAnimationFrame(loop);
}
function loop(now){
  if(!state.running)return;
  requestAnimationFrame(loop);
  if(state.paused)return;
  const dt=Math.min((now-state.last)/1000,.05);state.last=now;
  updatePlayer(dt);updateSurvival(dt);updateCamera(dt);
  renderer.render(scene,camera);
}
function pause(){state.paused=true;showModal("pause-modal")}
function resume(){hideModal("pause-modal");state.paused=false;state.last=performance.now()}
function bindControls(){
  const base=$("joystick-base"),stick=$("joystick-stick");let joyId=null,joyCenter={x:0,y:0};
  base.addEventListener("pointerdown",e=>{joyId=e.pointerId;base.setPointerCapture(joyId);const r=base.getBoundingClientRect();joyCenter={x:r.left+r.width/2,y:r.top+r.height/2};moveJoy(e)});
  base.addEventListener("pointermove",e=>{if(e.pointerId===joyId)moveJoy(e)});
  function moveJoy(e){let dx=e.clientX-joyCenter.x,dy=e.clientY-joyCenter.y;const max=35,d=Math.hypot(dx,dy);if(d>max){dx=dx/d*max;dy=dy/d*max}stick.style.transform=`translate(${dx}px,${dy}px)`;state.move={x:dx/max,y:dy/max}}
  function endJoy(e){if(e.pointerId!==joyId)return;joyId=null;state.move={x:0,y:0};stick.style.transform="translate(0,0)"}
  base.addEventListener("pointerup",endJoy);base.addEventListener("pointercancel",endJoy);
  const zone=$("camera-zone");let camId=null,lastX=0,lastY=0;
  zone.addEventListener("pointerdown",e=>{camId=e.pointerId;zone.setPointerCapture(camId);lastX=e.clientX;lastY=e.clientY});
  zone.addEventListener("pointermove",e=>{if(e.pointerId!==camId)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;state.camera.yaw-=dx*.006*state.sensitivity;state.camera.pitch=clamp(state.camera.pitch+dy*.003*state.sensitivity,.35,1.15)});
  const endCam=e=>{if(e.pointerId===camId)camId=null};zone.addEventListener("pointerup",endCam);zone.addEventListener("pointercancel",endCam);
  $("collect-button").addEventListener("click",collect);
  $("jump-button").addEventListener("click",()=>{if(player.position.y===0){player.position.y=.7;setTimeout(()=>{if(player)player.position.y=0},260)}});
  $("run-button").addEventListener("pointerdown",()=>state.sprint=true);["pointerup","pointercancel","pointerleave"].forEach(ev=>$("run-button").addEventListener(ev,()=>state.sprint=false));
}
function bindUI(){
  document.querySelectorAll("[data-modal]").forEach(btn=>btn.addEventListener("click",()=>{renderInventory();renderCraft();showModal(btn.dataset.modal)}));
  document.querySelectorAll(".close").forEach(btn=>btn.addEventListener("click",()=>btn.closest(".modal").classList.add("hidden")));
  $("new-game").onclick=()=>{state.stats={health:100,food:100,water:100,energy:100};state.inventory={Banana:3,Coconut:2,Wood:0,Stone:0,Fiber:0,Berries:0};player.position.set(0,0,10);startGame(false)};
  $("continue-game").onclick=()=>startGame(true);
  $("settings-button").onclick=()=>showModal("settings-modal");
  $("save-settings").onclick=()=>{state.sensitivity=Number($("sensitivity").value);state.quality=$("quality").value;toast("Ayarlar kaydedildi. Grafik değişiklikleri sonraki açılışta uygulanır.");hideModal("settings-modal")};
  $("pause-button").onclick=pause;$("resume-button").onclick=resume;$("save-button").onclick=saveGame;
  $("menu-button").onclick=()=>{saveGame();state.running=false;hideModal("pause-modal");$("hud").classList.add("hidden");$("main-menu").classList.remove("hidden")};
  $("continue-game").disabled=!localStorage.getItem("wis-save");
}
function init(){
  initScene();bindControls();bindUI();renderInventory();renderCraft();updateStats();
  setTimeout(()=>$("loading-screen").classList.add("hidden"),500);
  if(!localStorage.getItem("wis-save"))$("continue-game").disabled=true;
}
try{init()}catch(error){console.error(error);$("loading-screen").innerHTML="Oyun başlatılamadı. Konsol hatalarını kontrol edin."}
})();
