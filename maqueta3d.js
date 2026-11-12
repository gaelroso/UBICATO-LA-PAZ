/* Ubicato · maqueta 3D del campus (Three.js r147, scripts clásicos en lib/).
   index.html la carga solo cuando se elige "3D" en el mapa. Todo va en metros del plano:
   x de izquierda a derecha, y de arriba abajo, igual que PR.xy() en index.html. */
(()=>{'use strict';
const T=THREE,FH=3.3,SEP=4.4,AZ=.5,RUTA=0xff0a54,AZUL=0x1d3f66,TECHO=0x2a5a8f,ACT=0xffcd00;
let Rn,scene,cam,ctl,cfg,W,H,el,raf=0,B={},clic=[],tw=[],rutaG,curva=null,rk='',pulso,pin,ini,yoG,yoAro,desp=null,dy=0,plz=[];
const V=(x,y,h)=>new T.Vector3(x-W/2,h||0,y-H/2);
function forma(p){const s=new T.Shape();p.forEach((q,i)=>{const X=q[0]-W/2,Y=-(q[1]-H/2);i?s.lineTo(X,Y):s.moveTo(X,Y)});return s}
const centro=p=>{let x=0,y=0;p.forEach(q=>{x+=q[0];y+=q[1]});return[x/p.length,y/p.length]},hex=n=>'#'+n.toString(16).padStart(6,'0');
function etq(txt,o){o=Object.assign({fondo:'#ffffff',color:'#00355f',alto:5},o||{});
 const cv=document.createElement('canvas'),g=cv.getContext('2d'),F='800 54px Figtree,system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
 g.font=F;const w=Math.max(96,Math.ceil(g.measureText(txt).width)+52);cv.width=w;cv.height=96;g.font=F;g.fillStyle=o.fondo;const r=46;
 g.beginPath();g.moveTo(r+2,2);g.arcTo(w-2,2,w-2,94,r);g.arcTo(w-2,94,2,94,r);g.arcTo(2,94,2,2,r);g.arcTo(2,2,w-2,2,r);g.closePath();g.fill();
 g.fillStyle=o.color;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,51);
 const t=new T.CanvasTexture(cv);t.minFilter=T.LinearFilter;
 const s=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(o.alto*w/96,o.alto,1);s.renderOrder=10;return s}
const tex={};
function fachada(pared,vent,marco){const k=pared+vent;if(tex[k])return tex[k];const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');
 g.fillStyle=pared;g.fillRect(0,0,128,128);g.fillStyle=marco;g.fillRect(0,0,128,13);g.fillStyle=vent;g.fillRect(0,34,128,56);g.fillStyle=pared;for(let x=0;x<128;x+=32)g.fillRect(x,34,9,56);
 g.globalAlpha=.25;g.fillStyle='#fff';g.fillRect(0,34,128,16);g.globalAlpha=1;const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return tex[k]=t}
function tween(dur,fn,fin,canal){if(canal)for(let i=tw.length-1;i>=0;i--)if(tw[i].canal===canal)tw.splice(i,1);tw.push({t0:performance.now(),dur,fn,fin,canal})}
const suave=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
function volar(obj,dist,polar,az){const o0=ctl.target.clone(),s0=new T.Spherical().setFromVector3(cam.position.clone().sub(ctl.target)),ph=polar==null?s0.phi:polar,th=az==null?s0.theta:az;
 let d=th-s0.theta;d=((d+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
 tween(850,k=>{ctl.target.lerpVectors(o0,obj,k);cam.position.setFromSpherical(new T.Spherical(s0.radius+(dist-s0.radius)*k,s0.phi+(ph-s0.phi)*k,s0.theta+d*k)).add(ctl.target)},null,'cam')}
const hf=()=>Math.atan(Math.tan(cam.fov*Math.PI/360)*cam.aspect);
function general(anim){const d=Math.min(700,Math.max(190,Math.hypot(W,H)/2/Math.tan(hf())));if(anim)volar(new T.Vector3(0,0,4),d,.66,AZ);else{ctl.target.set(0,0,4);cam.position.setFromSpherical(new T.Spherical(d,.66,AZ)).add(ctl.target)}}
const alto=b=>b.base+.15+b.n.length*b.h;

function init(c){cfg=c;W=c.W;H=c.H;el=document.createElement('canvas');
 try{Rn=new T.WebGLRenderer({canvas:el,antialias:true})}catch(e){return false}
 Rn.setPixelRatio(Math.min(devicePixelRatio||1,2));Rn.shadowMap.enabled=true;Rn.shadowMap.type=T.PCFSoftShadowMap;
 scene=new T.Scene();{const cv=document.createElement('canvas');cv.width=4;cv.height=256;const g=cv.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#8fc0ea');gr.addColorStop(.6,'#d9e8f5');gr.addColorStop(1,'#f2f5f9');g.fillStyle=gr;g.fillRect(0,0,4,256);scene.background=new T.CanvasTexture(cv)}
 scene.fog=new T.Fog(0xe6edf3,700,2200);
 cam=new T.PerspectiveCamera(40,1,1,4000);ctl=new T.OrbitControls(cam,el);ctl.enableDamping=true;ctl.dampingFactor=.09;ctl.maxPolarAngle=1.45;ctl.minDistance=28;ctl.maxDistance=760;
 scene.add(new T.HemisphereLight(0xffffff,0xc9cfdd,.6));
 const sol=new T.DirectionalLight(0xffffff,.45);sol.position.set(-80,140,60);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);Object.assign(sol.shadow.camera,{left:-120,right:120,top:120,bottom:-120,near:1,far:420});sol.shadow.bias=-.0006;scene.add(sol);
 const piso=(geo,mat,y)=>{const m=new T.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.y=y;scene.add(m);return m};
 piso(new T.PlaneGeometry(4200,4200),new T.MeshBasicMaterial({color:0xe3e9e0}),-.06);
 const tx=new T.TextureLoader().load(c.img);tx.anisotropy=8;piso(new T.PlaneGeometry(W,H),new T.MeshBasicMaterial({map:tx}),0);   // el plano oficial es el suelo
 piso(new T.PlaneGeometry(W,H),new T.ShadowMaterial({opacity:.22}),.04).receiveShadow=true;
 for(const b of c.blocks){const cc=centro(b.poly),g=new T.Group();scene.add(g);
  Object.assign(b,{g,c:cc,base:b.base||0,h:FH*(b.k||1),pisos:[],radio:Math.max(...b.poly.map(p=>Math.hypot(p[0]-cc[0],p[1]-cc[1]))),ev:''});B[b.k0]=b;
  const pared=b.col||AZUL,techo=b.t||TECHO,tx=fachada(hex(pared),b.cl?'#b9c6da':'#9fb9dc',b.cl?'#ffffff':'#3f6a9c');
  b.n.forEach((_,i)=>{const mapa=tx.clone();mapa.needsUpdate=true;mapa.repeat.set(1/4.6,1/(b.h-.2));
   const m=new T.Mesh(new T.ExtrudeGeometry(forma(b.poly),{depth:b.h-.2,bevelEnabled:false}),[new T.MeshStandardMaterial({color:i===b.n.length-1?techo:pared,roughness:.85}),new T.MeshStandardMaterial({map:mapa,color:0xffffff,roughness:.7})]);
   m.rotation.x=-Math.PI/2;m.position.y=b.base+.15+i*b.h;m.castShadow=m.receiveShadow=true;m.userData.b=b;g.add(m);clic.push(m);b.pisos.push(m)});
  rotulo(b)}
 for(const[t,x,y]of c.plazas||[]){const s=etq(t,{alto:3.6,color:'#3d4560',fondo:'rgba(255,255,255,.88)'});s.position.copy(V(x,y,4));scene.add(s);plz.push(s)}
 rutaG=new T.Group();scene.add(rutaG);
 pulso=new T.Mesh(new T.SphereGeometry(1.1,16,12),new T.MeshBasicMaterial({color:0xffffff}));pulso.visible=false;scene.add(pulso);
 pin=new T.Group();pin.visible=false;scene.add(pin);{const m=new T.MeshStandardMaterial({color:RUTA,roughness:.5}),k=new T.Mesh(new T.ConeGeometry(1.4,3.6,16),m);k.rotation.x=Math.PI;k.position.y=1.8;const e=new T.Mesh(new T.SphereGeometry(1.8,18,14),m);e.position.y=4.4;pin.add(k,e)}
 ini=new T.Mesh(new T.CylinderGeometry(1.7,1.7,.3,24),new T.MeshBasicMaterial({color:0x0a6cc4}));ini.visible=false;scene.add(ini);
 yoG=new T.Group();yoG.visible=false;scene.add(yoG);const p=new T.Mesh(new T.SphereGeometry(1.4,18,14),new T.MeshBasicMaterial({color:0x0a6cc4}));p.position.y=1.5;
 yoAro=new T.Mesh(new T.RingGeometry(1.9,2.5,32),new T.MeshBasicMaterial({color:0x0a6cc4,transparent:true,opacity:.5,side:T.DoubleSide}));yoAro.rotation.x=-Math.PI/2;yoAro.position.y=.3;
 const t=etq('Estás aquí',{alto:3,fondo:'#0a6cc4',color:'#fff'});t.position.y=5.6;yoG.add(p,yoAro,t);
 const ray=new T.Raycaster();let pd=null;
 el.addEventListener('pointerdown',e=>pd={x:e.clientX,y:e.clientY,t:performance.now()});
 el.addEventListener('pointerup',e=>{if(!pd||Math.hypot(e.clientX-pd.x,e.clientY-pd.y)>8||performance.now()-pd.t>500)return;const q=el.getBoundingClientRect();
  ray.setFromCamera(new T.Vector2((e.clientX-q.left)/q.width*2-1,-((e.clientY-q.top)/q.height)*2+1),cam);const hit=ray.intersectObjects(clic,false)[0];if(hit)cfg.tap(hit.object.userData.b.pt)});
 general(false);return true}
function rotulo(b){if(b.etq)b.g.remove(b.etq);const e=b.ev,s=etq(e?b.lab+(e==='soon'?' · por terminar':' · evento ahora'):b.lab,e?{alto:4.4,fondo:e==='soon'?'#b45309':'#0b8a5f',color:'#fff'}:{alto:5});
 s.position.copy(V(b.c[0],b.c[1],alto(b)+(desp&&desp.b===b?desp.t*(b.n.length-1)*SEP:0)+4.5));s.visible=!desp||desp.b===b;b.g.add(s);b.etq=s}

function ruta(pts){while(rutaG.children.length)rutaG.children.pop().geometry.dispose();curva=null;pin.visible=ini.visible=pulso.visible=false;if(!pts)return;
 const cp=new T.CurvePath();for(let i=1;i<pts.length;i++)cp.add(new T.LineCurve3(V(pts[i-1][0],pts[i-1][1],.8),V(pts[i][0],pts[i][1],.8)));curva=cp;
 const geo=new T.TubeGeometry(cp,Math.max(60,pts.length*10),.75,8,false),mat=new T.MeshBasicMaterial({color:RUTA});rutaG.add(new T.Mesh(geo,mat));
 const velo=new T.Mesh(geo,new T.MeshBasicMaterial({color:RUTA,transparent:true,opacity:.3,depthTest:false}));velo.renderOrder=5;rutaG.add(velo);   // se ve a través de los bloques
 const tot=geo.index.count;geo.setDrawRange(0,0);tween(1100,k=>geo.setDrawRange(0,Math.floor(tot*k/3)*3),null,'ruta');
 const a=pts[0],z=pts[pts.length-1];ini.position.copy(V(a[0],a[1],.4));ini.visible=true;pin.position.copy(V(z[0],z[1],.5));pin.visible=pulso.visible=true;
 if(!desp){const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),cx=(Math.max(...xs)+Math.min(...xs))/2,cy=(Math.max(...ys)+Math.min(...ys))/2,ca=Math.cos(AZ),sa=Math.sin(AZ),tv=Math.tan(cam.fov*Math.PI/360),
  us=pts.map(p=>(p[0]-cx)*ca-(p[1]-cy)*sa),ws=pts.map(p=>(p[0]-cx)*sa+(p[1]-cy)*ca),du=Math.max(...us)-Math.min(...us),dw=Math.max(...ws)-Math.min(...ws);
  volar(V(cx,cy,0),Math.min(640,Math.max(110,(du/2+14)/(tv*cam.aspect),(dw*Math.cos(.62)/2+16)/(tv*.8))),.62,AZ)}}
function update(o){const k=o.ruta?o.ruta.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '):'';if(k!==rk){rk=k;ruta(o.ruta)}
 if(o.yo){yoG.position.copy(V(o.yo[0],o.yo[1],0));yoG.visible=true}else yoG.visible=false;
 for(const k in B){const e=(o.ev||{})[k]||'';if(e!==B[k].ev){B[k].ev=e;rotulo(B[k])}}}

/* Despiece: separa los pisos del bloque y resalta uno */
function aplica(b,t){const n=b.pisos.length;b.pisos.forEach((m,i)=>m.position.y=b.base+.15+i*b.h+t*i*SEP);b.etq.position.y=alto(b)+t*(n-1)*SEP+4.5;
 if(desp)desp.tags.forEach(s=>{s.position.y=b.base+.15+s.userData.i*b.h+t*s.userData.i*SEP+b.h/2;s.material.opacity=t})}
function pinta(b,sel){const pa=b.col||AZUL,te=b.t||TECHO;b.pisos.forEach((m,i)=>{const s=sel===i,at=sel!=null&&!s;m.material[0].color.setHex(s?0xffe066:i===b.pisos.length-1?te:pa);m.material[1].color.setHex(s?ACT:0xffffff);
  m.material.forEach(x=>{x.transparent=at;x.opacity=at?.4:1;x.needsUpdate=true});m.castShadow=!at})}
function pisos(k,sel,txt){const b=B[k];if(!b)return false;if(desp&&desp.b!==b)cerrar(true);if(desp)desp.tags.forEach(s=>b.g.remove(s));if(sel!=null)sel=Math.max(0,Math.min(b.n.length-1,sel));
 const az=Math.max(-1.7,Math.min(1.7,Math.atan2(b.c[0]-W/2,b.c[1]-H/2+18))),der=[Math.cos(az),-Math.sin(az)],tags=[];
 b.n.forEach((nom,i)=>{const s=sel===i,e=etq(s&&txt?nom+' · '+(txt.length>26?txt.slice(0,25)+'…':txt):nom,s?{alto:3.6,fondo:'#ffcd00',color:'#00355f'}:{alto:2.4,fondo:'rgba(255,255,255,.92)',color:'#53565a'});
  e.center.set(0,.5);e.position.copy(V(b.c[0]+der[0]*(b.radio*.6+2),b.c[1]+der[1]*(b.radio*.6+2),0));e.userData.i=i;b.g.add(e);tags.push(e)});
 const t0=desp?desp.t:0;desp={b,k,t:t0,tags};pinta(b,sel);for(const q in B)B[q].etq.visible=B[q]===b;plz.forEach(s=>s.visible=false);
 tween(900,q=>{desp.t=t0+(1-t0)*q;aplica(b,desp.t)},null,'pisos');
 const ht=b.n.length*b.h+(b.n.length-1)*SEP;volar(V(b.c[0]+der[0]*4,b.c[1]+der[1]*4,ht*.45),Math.max(105,ht*2.6,(b.radio+11)/Math.tan(hf())),1.12,az);return true}
function cerrar(ya){if(!desp)return;const d=desp,b=d.b;pinta(b,null);for(const q in B)B[q].etq.visible=true;plz.forEach(s=>s.visible=true);const fin=()=>{d.tags.forEach(s=>b.g.remove(s));if(desp===d)desp=null};
 if(ya){desp=d;aplica(b,0);fin();desp=null;return}const t0=d.t;tween(600,k=>{d.t=t0*(1-k);aplica(b,d.t)},fin,'pisos')}

function cuadro(now){raf=requestAnimationFrame(cuadro);const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;
 if(el.width!==Math.round(w*Rn.getPixelRatio())||dy!==h){dy=h;Rn.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
 for(let i=tw.length-1;i>=0;i--){const t=tw[i],k=Math.min(1,(now-t.t0)/t.dur);t.fn(suave(k));if(k>=1){tw.splice(tw.indexOf(t),1);t.fin&&t.fin()}}
 ctl.update();const s=now/1000;
 if(curva&&pulso.visible)pulso.position.copy(curva.getPointAt((s*.22)%1)).setY(1.5);
 if(pin.visible)pin.children.forEach((c,i)=>c.position.y=(i?4.4:1.8)+Math.abs(Math.sin(s*3))*1.3);
 if(yoG.visible){const e=1+(s%1.6)*1.4;yoAro.scale.set(e,e,1);yoAro.material.opacity=.55*(1-(s%1.6)/1.6)}
 Rn.render(scene,cam)}
window.M3D={init,update,pisos,cerrar,start(){if(!raf)raf=requestAnimationFrame(cuadro)},stop(){cancelAnimationFrame(raf);raf=0},
 zoom(f){const v=cam.position.clone().sub(ctl.target),d=Math.max(ctl.minDistance,Math.min(ctl.maxDistance,v.length()*f));tween(260,()=>{},null,'cam');cam.position.copy(ctl.target).add(v.setLength(d))},
 fit(){cerrar();general(true)},get el(){return el},get abierto(){return desp?desp.k:''}};
})();
