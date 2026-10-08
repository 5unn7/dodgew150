import * as THREE from 'three';
/* Hand-modeled visual surfaces for the 1989 W150, approximate and not scanned. */
export function sculptBody(ctx) {
 const {root,registry,parts,variant}=ctx, sh=variant==='115'?-0.4064:0,rear=1.81+sh,tail=2.87+sh;
 const M=(c,mt=.55,ro=.35)=>new THREE.MeshStandardMaterial({color:c,metalness:mt,roughness:ro,side:THREE.DoubleSide});
 const m={body:M(0x82969c),roof:M(0x748b91),edge:M(0x9bafb4),black:M(0x11191d,.1,.84),rubber:M(0x1b1d20,.07,.96),metal:M(0xa6b8bf,.83,.19),chrome:M(0xdce4e6,.93,.13),dark:M(0x273239,.28,.67),stripe:M(0x33474f),amber:M(0xf18c29,.12,.24),red:M(0xa52824,.16,.31),lamp:M(0xd4e8e9,.28,.20),interior:M(0x91745e,.05,.87),glass:new THREE.MeshPhysicalMaterial({color:0x365566,roughness:.13,metalness:0,transparent:true,opacity:.47,side:THREE.DoubleSide,depthWrite:false,clearcoat:1}),concept:M(0x49cad5,.46,.25)};
 function a(id,g,mat,x=0,y=0,z=0) {const o=new THREE.Mesh(g,mat.clone());o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;o.userData.partId=id;root.add(o);registry.push({object:o,meta:parts.find(p=>p.id===id),basePosition:o.position.clone()});return o;}
 function b(id,w,h,l,x,y,z,mat='body'){return a(id,new THREE.BoxGeometry(w,h,l),m[mat],x,y,z)}
 function c(id,r,d,x,y,z,mat='chrome',ax='x'){const o=a(id,new THREE.CylinderGeometry(r,r,d,32),m[mat],x,y,z);if(ax==='x')o.rotation.z=Math.PI/2;else if(ax==='z')o.rotation.x=Math.PI/2;return o;}
 function t(id,p,q,r=.012,mat='chrome'){const A=new THREE.Vector3(...p),B=new THREE.Vector3(...q),D=B.clone().sub(A);const o=a(id,new THREE.CylinderGeometry(r,r,D.length(),9),m[mat],...A.add(B).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),D.normalize());return o;}
 function path(id,pts,r=.012,mat='chrome'){for(let j=1;j<pts.length;j++)t(id,pts[j-1],pts[j],r,mat)}
 function poly(id,verts,mat='glass'){const g=new THREE.BufferGeometry(),index=[];for(let j=1;j<verts.length-1;j++)index.push(0,j,j+1);g.setAttribute('position',new THREE.Float32BufferAttribute(verts.flat(),3));g.setIndex(index);g.computeVertexNormals();return a(id,g,m[mat])}
 function side(id,s,z0,z1,bottom,top,zc=null,R=.615,mat='body'){
  const shape=new THREE.Shape();shape.moveTo(z0,bottom);
  if(zc!==null){const edge=Math.sqrt(Math.max(0,R*R-(bottom-.51)**2)),a0=Math.max(z0,zc-edge),a1=Math.min(z1,zc+edge);shape.lineTo(a0,bottom);for(let k=0;k<=30;k++){const z=a0+(a1-a0)*k/30;shape.lineTo(z,.51+Math.sqrt(Math.max(0,R*R-(z-zc)**2)))}}
  shape.lineTo(z1,bottom);shape.lineTo(z1,top);shape.lineTo(z0,top);shape.closePath();
  const g=new THREE.ExtrudeGeometry(shape,{depth:.058,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:2});
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const z=p.getX(i),y=p.getY(i),d=p.getZ(i);p.setXYZ(i,s*(.874+d),y,z)}g.computeVertexNormals();return a(id,g,m[mat]);
 }
 function roofShape(id,zs,xs,fn,mat='roof'){
  const v=[],ind=[],n=xs.length;for(const z of zs)for(const x of xs)v.push(x,fn(x,z),z);
  for(let j=0;j<zs.length-1;j++)for(let k=0;k<n-1;k++){let i=j*n+k;ind.push(i,i+1,i+n+1,i,i+n+1,i+n)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ind);g.computeVertexNormals();return a(id,g,m[mat])
 }
 // Remove the former blockout's highly visible rectangular shell and low-detail wheels.
 const replace=new Set(['body','lighting','wheels','interior']);
 for(let i=registry.length-1;i>=0;i--){const it=registry[i];if(replace.has(it.meta?.category)||it.meta?.category==='planned'){root.remove(it.object);it.object.geometry.dispose();it.object.material.dispose();registry.splice(i,1)}}
 // Sculpted front fender and arched bedside steel surfaces.
 for(const s of [-1,1]){
  side('front_fenders',s,-2.52,-1.05,.965,1.61,-1.52,.625);
  side('bed_sides',s,.41,tail,.995,1.73,rear,.63);
  side('doors',s,-1.03,.34,1.04,1.60);
  path('front_fenders',Array.from({length:33},(_,i)=>{const q=Math.PI*(1-i/32);return[s*.96,.51+.653*Math.sin(q),-1.52+.47*Math.cos(q)]}),.010,'chrome');
  path('bed_sides',Array.from({length:33},(_,i)=>{const q=Math.PI*(1-i/32);return[s*.967,.51+.666*Math.sin(q),rear+.47*Math.cos(q)]}),.011,'chrome');
  b('bed_sides',.14,.11,tail-.39,s*.937,1.735,(tail+.41)/2,'body');
  b('bed_sides',.052,.043,tail-.37,s*.968,1.787,(tail+.41)/2,'chrome');
  b('bed_sides',.04,.57,.11,s*.8,1.42,.43,'dark');
  b('bed_sides',.04,.56,.1,s*.81,1.43,tail-.05,'dark');
  b('bed_sides',.026,.095,tail-.43,s*.944,1.25,(tail+.41)/2,'stripe');
  path('bed_sides',[[s*.96,1.17,.45],[s*.961,1.17,rear-.52]],.011,'metal');
  path('bed_sides',[[s*.96,1.17,rear+.52],[s*.961,1.17,tail-.1]],.011,'metal');
  b('cab_shell',.09,.14,1.37,s*.89,1.014,-.33,'stripe');
  b('doors',.03,.03,.17,s*.964,1.431,.135,'chrome');
  c('doors',.014,.04,s*.987,1.391,.29,'chrome','x');
  b('doors',.015,.034,.12,s*.970,1.435,-.36,'stripe');
  b('cab_shell',.103,.072,1.28,s*.91,1.605,-.32,'body');
  // Four-sided triangular A-pillar / angular side glass correct for the period.
  const edge=[[-.98,1.65],[-.845,2.025],[.205,2.025],[.33,1.65]];
  poly('windshield',edge.map(([z,y])=>[s*.942,y,z]));
  path('cab_shell',[[-.99,1.615],[-.865,2.059],[.221,2.058],[.345,1.618]].map(([z,y])=>[s*.953,y,z]),.024,'body');
  path('windshield',[[-.96,1.648],[-.831,2.020],[.198,2.02],[.314,1.65],[-.96,1.648]].map(([z,y])=>[s*.963,y,z]),.009,'chrome');
  t('doors',[s*.96,1.65,-.71],[s*.96,2.02,-.685],.009,'metal');
  // Period rectangular metal side mirror, dual support arms.
  t('doors',[s*.958,1.54,-.82],[s*1.24,1.72,-.77],.012,'chrome');
  t('doors',[s*.95,1.65,-.82],[s*1.24,1.72,-.77],.012,'chrome');
  b('doors',.068,.198,.265,s*1.265,1.72,-.77,'chrome');
  b('doors',.012,.16,.235,s*1.312,1.72,-.77,'glass');
  b('front_fenders',.04,.066,.26,s*.942,1.447,-1.113,'dark');
  b('front_fenders',.028,.029,.13,s*.974,1.448,-1.134,'chrome');
  b('front_fenders',.02,.104,.055,s*.976,1.185,-2.28,'amber');
  b('taillamps',.175,.45,.094,s*.86,1.405,tail+.045,'red');
  b('taillamps',.15,.084,.103,s*.859,1.32,tail+.064,'lamp');
 }
 // Sculpted hood surface: convex stampings at edges and tapered central crown.
 const hx=[-.87,-.81,-.72,-.56,-.30,0,.30,.56,.72,.81,.87];
 roofShape('hood',[-2.505,-2.40,-2.17,-1.85,-1.43,-1.05],hx,(x,z)=>1.602+.036*(1-(x/.88)**2)+.018*(Math.abs(x)>.70?1:0)+.025*(z+2.50)/1.45,'body');
 for(const s of [-1,1])path('hood',[[s*.76,1.64,-2.49],[s*.81,1.655,-1.8],[s*.79,1.68,-1.11]],.009,'edge');
 // Structured cab panels, angled windshield, curved roof.
 b('cab_shell',1.75,.15,1.50,0,1.061,-.30,'body');
 b('cab_shell',1.71,.23,.079,0,1.18,-1.05,'body');
 b('cab_shell',1.75,.19,.083,0,1.18,.42,'body');
 b('roof',1.72,.056,1.28,0,2.075,-.32,'roof');
 roofShape('roof',[-.978,-.84,-.48,-.15,.23,.37],[-.86,-.7,-.35,0,.35,.7,.86],x=>2.103+.021*(1-(x/.86)**2),'body');
 poly('windshield',[[-.808,1.613,-1.062],[.808,1.613,-1.062],[.742,2.05,-.939],[-.742,2.05,-.939]]);
 poly('windshield',[[-.738,1.63,.426],[.738,1.63,.426],[.713,2.040,.38],[-.713,2.04,.38]]);
 path('windshield',[[-.81,1.61,-1.075],[.81,1.61,-1.075],[.747,2.051,-.952],[-.747,2.051,-.952],[-.81,1.61,-1.075]],.012,'black');
 for(const s of [-1,1]){
  t('windshield',[s*.06,1.633,-1.082],[s*.61,1.71,-1.044],.010,'black');
  t('roof',[s*.835,2.113,-.91],[s*.835,2.112,.34],.013,'metal');
 }
 // Detailed grille: true recessed apertures, dual square headlamp surrounds, layered stamped bars.
 b('grille',1.84,.56,.066,0,1.325,-2.555,'chrome');
 b('grille',1.74,.47,.08,0,1.334,-2.603,'black');
 for(let i=0;i<5;i++)b('grille',1.68,.021,.037,0,1.13+i*.099,-2.65,'metal');
 for(const s of [-1,1]){
  b('grille',.029,.49,.064,s*.492,1.323,-2.655,'chrome');
  b('headlamps',.356,.302,.072,s*.718,1.398,-2.66,'chrome');
  b('headlamps',.298,.238,.085,s*.718,1.402,-2.710,'lamp');
  b('headlamps',.31,.116,.082,s*.718,1.159,-2.675,'amber');
  for(let i=-2;i<=2;i++)b('headlamps',.246,.005,.008,s*.718,1.4+i*.040,-2.759,'metal');
 }
 b('grille',.036,.45,.08,0,1.33,-2.678,'chrome');
 b('front_bumper',2.04,.182,.20,0,.859,-2.774,'chrome');
 b('front_bumper',1.81,.028,.29,0,.961,-2.744,'metal');
 for(const s of [-1,1])b('front_bumper',.157,.22,.27,s*.958,.856,-2.724,'metal');
 b('rear_bumper',2.02,.17,.245,0,.861,tail+.21,'chrome');
 for(const s of [-1,1])b('rear_bumper',.15,.21,.30,s*.95,.85,tail+.20,'metal');
 // Exposed bed floor with stamped channels, proper height and upper rail.
 b('bed_floor',1.75,.092,tail-.41,0,1.066,(tail+.41)/2,'body');
 for(let i=-7;i<=7;i++)b('bed_liner',.028,.012,tail-.5,i*.104,1.119,(tail+.41)/2,'metal');
 b('tailgate',1.76,.65,.11,0,1.40,tail,'body');
 b('tailgate',1.66,.037,.11,0,1.728,tail,'chrome');
 b('tailgate',1.30,.019,.025,0,1.24,tail+.061,'edge');
 b('tailgate',.15,.036,.027,0,1.59,tail+.074,'black');
 // Cab interior visible through glass.
 b('front_seats',1.38,.18,.53,0,1.20,-.20,'interior');
 for(const s of [-1,0,1])b('front_seats',.42,.38,.16,s*.43,1.44,.059,'interior');
 b('dashboard',1.54,.20,.28,0,1.49,-.88,'black');
 t('steering_wheel',[-.42,1.45,-.93],[-.42,1.69,-.67],.033,'metal');
 const sw=a('steering_wheel',new THREE.TorusGeometry(.206,.020,9,36),m.black,-.42,1.68,-.60);sw.rotation.x=.29;
 // Manufacturer badge is only representative; not a VIN or as-built identifier.
 // Proposed modules remain an optional overlay.
 for(const s of [-1,1])t('roof_rack',[s*.77,2.235,-.76],[s*.77,2.235,.20],.031,'concept');
 for(const z of [-.75,.18])t('roof_rack',[-.77,2.24,z],[.77,2.24,z],.027,'concept');
 b('winch',.62,.25,.19,0,.866,-2.98,'concept');
 b('lightbar',1.19,.112,.095,0,2.25,-.92,'concept');
 b('digital_dash',.73,.16,.051,0,1.58,-1.0,'concept');
 return {quality:'hand-sculpted visual reference',base:'1989 W150',longBed:variant==='131'};
}
