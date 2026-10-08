import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id);
const q=sel=>Array.from(document.querySelectorAll(sel));
const STORAGE='w150-atlas-progress-v3';
const CATEGORY_NAMES={body:'Body',chassis:'Chassis',drivetrain:'Drivetrain',suspension:'Suspension',wheels:'Wheels',interior:'Interior',lighting:'Lighting',planned:'Future modification'};
const DEFINITIONS=[
['frame_rails','Ladder frame rails','chassis','13','Two parallel primary rails; verify exact contours and corrosion'],
['crossmembers','Frame crossmembers','chassis','13','Cross braces and major mounting points; positions provisional'],
['fuel_tank','Fuel tank','chassis','14','Tank envelope only; confirm actual location and capacity'],
['engine','Engine envelope','drivetrain','9','Illustrative engine, not a verified V6 or V8'],
['transmission','Transmission envelope','drivetrain','21','Transmission type remains unverified'],
['transfer_case','Transfer case','drivetrain','21','4x4 transfer case envelope; verify tag and shift mechanism'],
['front_diff','Front differential','drivetrain','3','4x4 front axle differential placeholder'],
['rear_diff','Rear differential','drivetrain','3','Rear axle centre differential placeholder'],
['front_driveshaft','Front driveshaft','drivetrain','21','Approximate mechanical power path'],
['rear_driveshaft','Rear driveshaft','drivetrain','21','Approximate mechanical power path'],
['front_axle','Front axle','suspension','2','Axle beam and steering knuckle envelope'],
['rear_axle','Rear axle','suspension','3','Rear solid axle structure'],
['leaf_springs','Rear leaf springs','suspension','16','Illustrative leaf packs; count and mounting positions unverified'],
['front_springs','Front spring arrangement','suspension','2','Illustrative front 4x4 suspension component'],
['shock_absorbers','Shock absorbers','suspension','2','Reference dampers and locations'],
['steering_box','Steering gear','suspension','19','Steering box mounting envelope'],
['steering_linkage','Steering linkage','suspension','19','Approximate drag link and tie rod'],
['brake_front','Front brakes','suspension','5','Reference front brake discs/assemblies'],
['brake_rear','Rear brakes','suspension','5','Rear drum-brake envelopes'],
['wheels_front','Front wheels & tires','wheels','22','Approximate off-road tire dimensions, not installed specification'],
['wheels_rear','Rear wheels & tires','wheels','22','Rear tire geometry, provisional track width'],
['hood','Engine hood','body','23','Stock-era hood proportions, conceptual geometry'],
['grille','Grille & fascia','body','23','Dodge truck square-headlamp grille concept'],
['front_bumper','Front bumper','body','23','Chrome factory-inspired front bumper'],
['rear_bumper','Rear bumper','body','23','Rear bumper envelope'],
['front_fenders','Front fenders','body','23','Left/right steel body fenders'],
['doors','Cab doors','body','23','Regular-cab two-door body'],
['cab_shell','Cab shell & pillars','body','23','Cab panels, door opening frames and firewall'],
['roof','Cab roof','body','23','Regular-cab roof silhouette'],
['windshield','Windshield & rear glass','body','23','Tinted reference glazing'],
['bed_floor','8-foot bed floor','body','23','Owner-reported long bed; floor envelope not measured'],
['bed_sides','Long-bed side panels','body','23','Long-bed bedside geometry and wheel arch approximation'],
['tailgate','Tailgate','body','23','Rear tailgate geometry'],
['bed_liner','Bed floor insert','body','23','Reference textured floor only'],
['front_seats','Front bench / seats','interior','23','Provisional seating and upholstery'],
['dashboard','Dashboard','interior','8','Standard rectangular dashboard envelope'],
['steering_wheel','Steering wheel','interior','19','Illustrative wheel and column'],
['radiator','Radiator & cooling','drivetrain','7','Cooling module envelope and hoses'],
['battery','Battery & electrical','drivetrain','8','Battery and primary wiring location approximate'],
['exhaust','Exhaust system','drivetrain','11','Simplified exhaust routing'],
['headlamps','Square headlights','lighting','8','Front lighting modules'],
['taillamps','Rear taillights','lighting','8','Rear lamp geometry'],
['roof_rack','Concept roof rack','planned',null,'Proposed modular rack; not fitted'],
['winch','Concept winch bumper','planned',null,'Proposed recovery hardware; not fitted'],
['lightbar','Concept auxiliary lights','planned',null,'Proposed auxiliary forward lighting; not fitted'],
['digital_dash','Concept digital dashboard','planned',null,'Proposed luxury/technology cabin upgrade']
].map(([id,name,category,group,summary])=>({id,name,category,group,summary,layer:category==='planned'?'planned':'stock'}));
const phases=[
{id:'A',title:'Identify and document'}, {id:'B',title:'Chassis and safety'}, {id:'C',title:'Drivetrain and electrical'}, {id:'D',title:'Body and cabin'}, {id:'E',title:'Restomod design'}
];
const tasks=[
['VIN','A','Record VIN privately and decode configuration','HIGH','VIN and vehicle plate verified'],
['BODY','A','Photograph all sides and underside','HIGH','Four corners, both sides, cabin and chassis photos'],
['WB','A','Measure actual wheelbase','HIGH','Hub-to-hub measurement with tape'],
['ENGINEID','A','Read installed engine and transmission identifiers','HIGH','Photograph tags and casting numbers'],
['FRAME','B','Inspect frame for rust and damage','HIGH','Photos and service professional findings'],
['STEER','B','Inspect steering linkage and joints','HIGH','Play measurements and repair assessment'],
['BRAKES','B','Document brake system condition','HIGH','Inspection checklist and any leaks recorded'],
['SUSP','B','Check axle mounts, leaves and shocks','HIGH','Measured wear and visible damage'],
['WHEELS','B','Verify wheel and tire dimensions','MED','Sidewall codes, offset and bolt pattern'],
['FLUID','C','Inspect fluid levels and leaks','HIGH','Fluid baseline and leak locations'],
['TRANSFER','C','Identify transfer case and 4x4 engagement','HIGH','Transfer case tag and safe function check'],
['AXLES','C','Read axle tags and ratio','HIGH','Front/rear axle ID and ratio confirmation'],
['WIRING','C','Inspect wiring and battery circuits','HIGH','Photos and circuit condition notes'],
['COOL','C','Inspect cooling system','HIGH','Hoses/radiator/thermostat condition'],
['ENGINE','C','Plan verified engine service','MED','Confirmed engine service references'],
['PANELS','D','Survey body panels, bed and corrosion','HIGH','Damage map and bed photos'],
['DOORS','D','Measure doors, seals and glass','MED','Fitment and seal measurements'],
['CAB','D','Plan cabin restoration','MED','Interior photo map and as-built equipment'],
['DESIGN','E','Select restomod exterior concept','MED','Approved concept plus rough package constraints'],
['DASH','E','Measure dashboard for digital display','MED','Actual cabin hardpoints and electrical plan'],
['RACK','E','Engineer roof rack and recovery points','MED','Load calculations and safe attachment design'],
['BOM','E','Create sourced parts and fabrication bill of materials','MED','Vendor, specs, price, installation state']
].map(([id,phase,title,priority,evidence_needed])=>({id,phase,title,priority:priority.toLowerCase(),evidence_needed}));
const project={id:'dodge-w150-digital-twin',version:'0.3',parts:DEFINITIONS,tasks,phases,vehicle:{year:1989,model:'W150',bed:'8-foot long bed (owner reported)',wheelbase_reference_inches:131,wheelbase_measured_inches:null},manual:{groups:[{id:'2',name:'Front suspension'},{id:'3',name:'Rear axles'},{id:'5',name:'Brakes'},{id:'7',name:'Cooling system'},{id:'8',name:'Electrical system'},{id:'9',name:'Engines'},{id:'11',name:'Exhaust'},{id:'13',name:'Frame'},{id:'16',name:'Rear springs and shocks'},{id:'19',name:'Steering'},{id:'21',name:'Transmission / transfer case'},{id:'22',name:'Wheels and tires'},{id:'23',name:'Body'}]}};
let scene,camera,renderer,controls,root,raycaster,pointer,selected=null,variant='131',exploded=false,xray=false,meshRegistry=[],progress={done:{},notes:{}};let animationId=0;
const mats={
paint:new THREE.MeshStandardMaterial({color:0x637a7e,metalness:.56,roughness:.36}),
paintLight:new THREE.MeshStandardMaterial({color:0x829396,metalness:.42,roughness:.39}),
roof:new THREE.MeshStandardMaterial({color:0x52676b,metalness:.45,roughness:.5}),
dark:new THREE.MeshStandardMaterial({color:0x18252d,metalness:.18,roughness:.73}),
chrome:new THREE.MeshStandardMaterial({color:0xc8cfd0,metalness:.91,roughness:.22}),
steel:new THREE.MeshStandardMaterial({color:0x46545c,metalness:.70,roughness:.58}),
engine:new THREE.MeshStandardMaterial({color:0x6c796c,metalness:.50,roughness:.52}),
tire:new THREE.MeshStandardMaterial({color:0x191e22,roughness:.92}),
rubber:new THREE.MeshStandardMaterial({color:0x293136,roughness:.88}),
seat:new THREE.MeshStandardMaterial({color:0x9b8168,roughness:.86}),
bed:new THREE.MeshStandardMaterial({color:0x3b4f52,roughness:.70}),
glass:new THREE.MeshStandardMaterial({color:0x2e5366,metalness:.18,roughness:.20,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}),
lamp:new THREE.MeshStandardMaterial({color:0xf2dcb0,metalness:.10,roughness:.25,emissive:0xa48b59,emissiveIntensity:.14}),
red:new THREE.MeshStandardMaterial({color:0xa7372d,metalness:.20,roughness:.34,emissive:0x3a0908}),
concept:new THREE.MeshStandardMaterial({color:0x55c6d6,metalness:.62,roughness:.26,transparent:true,opacity:.83})
};
function mesh(part,geo,mat,x=0,y=0,z=0,rotX=0,rotY=0,rotZ=0){
 const obj=new THREE.Mesh(geo,mat.clone());obj.position.set(x,y,z);obj.rotation.set(rotX,rotY,rotZ);obj.castShadow=true;obj.receiveShadow=true;obj.name=part;obj.userData.partId=part;root.add(obj);meshRegistry.push({object:obj,meta:project.parts.find(p=>p.id===part),basePosition:obj.position.clone()});return obj;
}
function box(id,w,h,l,x,y,z,mat='paint',rx=0,ry=0,rz=0){return mesh(id,new THREE.BoxGeometry(w,h,l),mats[mat],x,y,z,rx,ry,rz)}
function cyl(id,r,depth,x,y,z,mat='steel',axis='x',radial=18){let rx=axis==='z'?Math.PI/2:0,rz=axis==='x'?Math.PI/2:0;return mesh(id,new THREE.CylinderGeometry(r,r,depth,radial),mats[mat],x,y,z,rx,0,rz)}
function tube(id,a,b,r,mat='steel'){let dir=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const obj=mesh(id,new THREE.CylinderGeometry(r,r,dir.length(),12),mats[mat],(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());return obj}
function groupWheel(id,x,z){
 cyl(id,.448,.21,x,.51,z,'tire');
 cyl(id,.328,.235,x,.51,z,'rubber');
 cyl(id,.276,.247,x,.51,z,'steel');
 cyl(id,.218,.265,x,.51,z,'chrome');
 cyl(id,.108,.28,x,.51,z,'dark');
 for(let a=0;a<6;a++){const t=a*Math.PI/3;const xx=x+(x>0?.144:-.144);const y=.51+.145*Math.cos(t),zz=z+.145*Math.sin(t);mesh(id,new THREE.SphereGeometry(.025,8,8),mats.chrome,xx,y,zz);}
 for(let i=0;i<13;i++){let a=i*2*Math.PI/13;box(id,.24,.033,.06,x,.51+Math.cos(a)*.435,z+Math.sin(a)*.435,'tire',a,0,0)}
}
function build(wh){
 if(root){scene.remove(root);root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}})}
 meshRegistry=[];root=new THREE.Group();scene.add(root);
 const short=wh==='115',shift=short?-.4064:0,rear=1.81+shift,tail=2.89+shift;variant=wh;
 const endLen=tail-.38;
 // chassis / axles
 for(const s of [-1,1]){
  box('frame_rails',.17,.21,5.35+shift,s*.64,.79,.12+shift/2,'steel');
  box('frame_rails',.06,.08,.9,s*.66,.71,1.1+shift,'dark');
 }
 for(const z of [-2.17,-1.2,.15,1.18+shift,2.46+shift])box('crossmembers',1.37,.16,.17,0,.78,z,'steel');
 box('fuel_tank',.56,.28,.92,-.68,.67,1.02+shift/3,'dark');
 box('engine',.70,.46,.91,0,1.15,-1.69,'engine');
 for(const s of [-1,1])box('engine',.28,.20,.72,s*.3,1.4,-1.65,'steel');
 cyl('engine',.16,.08,0,1.18,-2.17,'chrome','z');
 box('transmission',.47,.39,.82,0,.93,-.65,'engine');
 box('transfer_case',.42,.42,.51,0,.82,-.02,'steel');
 box('radiator',1.09,.74,.085,0,1.35,-2.38,'dark');
 for(const s of [-1,1])box('radiator',.025,.7,.1,s*.51,1.35,-2.38,'chrome');
 box('battery',.36,.23,.28,-.68,1.4,-1.38,'dark');
 for(const s of [-1,1])cyl('battery',.025,.04,-.68+s*.10,1.54,-1.40,'chrome');
 tube('exhaust',[-.26,.96,-1.65],[-.26,.53,1.60+shift],.055,'steel');
 box('exhaust',.28,.19,.62,-.29,.58,.71+shift,'steel');
 for(const axle of [-1.52,rear]){
  tube(axle<0?'front_axle':'rear_axle',[-.92,.55,axle],[.92,.55,axle],.11);
  box(axle<0?'front_diff':'rear_diff',.39,.32,.30,0,.54,axle,'steel');
 }
 tube('front_driveshaft',[0,.78,-.09],[0,.62,-1.52],.067);
 tube('rear_driveshaft',[0,.74,.19],[0,.62,rear],.066);
 for(const s of [-1,1]){
  tube('leaf_springs',[s*.71,.61,rear-.59],[s*.71,.62,rear+.60],.043,'steel');
  tube('front_springs',[s*.70,.52,-1.72],[s*.70,.83,-1.43],.067,'steel');
  tube('shock_absorbers',[s*.79,.51,rear-.37],[s*.83,1.03,rear+.05],.050,'dark');
  tube('shock_absorbers',[s*.83,.49,-1.70],[s*.87,1.03,-1.26],.05,'dark');
  cyl('brake_front',.30,.04,s*.91,.51,-1.52,'steel');
  cyl('brake_rear',.26,.05,s*.91,.51,rear,'steel');
  groupWheel('wheels_front',s*1.02,-1.52);
  groupWheel('wheels_rear',s*1.02,rear);
 }
 box('steering_box',.24,.20,.30,-.69,.88,-1.66,'engine');
 tube('steering_linkage',[-.84,.58,-1.56],[.82,.56,-1.56],.032,'chrome');
 // cab / hood
 box('hood',1.87,.12,1.43,0,1.57,-1.72,'paint');
 box('hood',1.69,.09,.24,0,1.61,-2.30,'paintLight');
 for(const s of [-1,1]){
  box('front_fenders',.25,.36,1.61,s*.865,1.20,-1.73,'paint');
  box('front_fenders',.11,.09,.70,s*.98,1.40,-1.86,'paintLight');
 }
 box('grille',1.72,.47,.09,0,1.26,-2.50,'dark');
 for(let i=0;i<11;i++)box('grille',1.37,.017,.06,0,1.06+i*.039,-2.568,'chrome');
 box('front_bumper',2.04,.17,.22,0,.91,-2.65,'chrome');
 for(const s of [-1,1])box('front_bumper',.12,.20,.28,s*.92,.95,-2.62,'steel');
 for(const s of [-1,1]){
  box('headlamps',.37,.26,.05,s*.69,1.36,-2.56,'lamp');
  box('headlamps',.40,.31,.025,s*.69,1.36,-2.59,'chrome');
 }
 box('cab_shell',1.71,.18,1.20,0,.98,-.30,'paint');
 box('cab_shell',1.77,.24,.12,0,1.07,-1.01,'paint');
 box('cab_shell',1.76,.52,.13,0,1.38,.37,'paint');
 for(const s of [-1,1]){
  box('doors',.08,.72,.84,s*.905,1.36,-.33,'paint');
  box('doors',.06,.035,.16,s*.956,1.40,-.23,'chrome');
  box('cab_shell',.095,.98,.09,s*.83,1.60,-1.02,'paint');
  box('cab_shell',.095,.92,.10,s*.83,1.60,.34,'paint');
  box('cab_shell',.10,.12,1.36,s*.83,2.03,-.34,'roof');
  box('windshield',.028,.48,.85,s*.89,1.84,-.28,'glass');
  box('cab_shell',.12,.24,.12,s*.95,1.57,-1.00,'dark');
  box('cab_shell',.13,.09,.29,s*1.01,1.58,-.97,'chrome');
 }
 box('windshield',1.63,.53,.025,0,1.78,-1.04,'glass',-.15);
 box('windshield',1.53,.45,.023,0,1.80,.36,'glass');
 box('roof',1.78,.16,1.28,0,2.12,-.34,'roof');
 // interior
 box('front_seats',1.35,.20,.56,0,1.19,-.11,'seat');
 for(const s of [-1,0,1])box('front_seats',.4,.42,.18,s*.43,1.50,.04,'seat');
 box('dashboard',1.55,.23,.34,0,1.48,-.89,'dark');
 for(const s of [-1,1])box('dashboard',.32,.095,.09,s*.43,1.59,-1.08,'steel');
 tube('steering_wheel',[-.35,1.45,-.85],[-.45,1.70,-.58],.033,'chrome');
 const wheel=mesh('steering_wheel',new THREE.TorusGeometry(.20,.025,8,24),mats.dark,-.45,1.72,-.58,Math.PI/4);
 // bed
 box('bed_floor',1.69,.11,endLen,0,1.04,(tail+.38)/2,'bed');
 for(const s of [-1,1]){
  box('bed_sides',.20,.65,endLen,s*.86,1.40,(tail+.38)/2,'paint');
  box('bed_sides',.22,.11,endLen,s*.86,1.74,(tail+.38)/2,'paintLight');
  box('bed_sides',.24,.10,.80,s*.86,1.13,rear,'paint');
  box('taillamps',.18,.38,.12,s*.87,1.48,tail+.03,'red');
 }
 for(let i=-7;i<=7;i++)box('bed_liner',.038,.018,endLen-.07,i*.107,1.106,(tail+.38)/2,'dark');
 box('tailgate',1.67,.67,.12,0,1.39,tail,'paint');
 box('tailgate',1.59,.04,.065,0,1.7,tail+.08,'chrome');
 box('rear_bumper',2.03,.17,.24,0,.92,tail+.24,'chrome');
 // planned restomod
 for(const s of [-1,1])tube('roof_rack',[s*.72,2.25,-.88],[s*.72,2.25,.17],.047,'concept');
 for(const z of [-.87,-.27,.17])tube('roof_rack',[-.78,2.27,z],[.78,2.27,z],.038,'concept');
 box('winch',1.16,.20,.22,0,.94,-2.82,'concept');
 box('winch',.55,.27,.21,0,1.04,-2.84,'steel');
 box('lightbar',1.10,.11,.10,0,2.25,-.89,'concept');
 box('digital_dash',.85,.26,.042,0,1.56,-.98,'concept');
 updateVis();applyXray();applyExplosion();selectPart(selected,false);
 $('variant-readout').textContent=wh+'″ WHEELBASE';
 status(wh+'″ reference model loaded · '+meshRegistry.length+' objects.');
 $('loading').hidden=true;
}
function status(t){$('status-message').textContent=t}
function escapeHTML(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function loadProgress(){try{const r=JSON.parse(localStorage.getItem(STORAGE)||'{}');progress={done:r.done||{},notes:r.notes||{}}}catch{progress={done:{},notes:{}}}}
function saveProgress(){try{localStorage.setItem(STORAGE,JSON.stringify(progress))}catch{status('Browser storage unavailable. Export your log.')}}
function updateVis(){for(const {object:o,meta} of meshRegistry){if(!meta)continue;const v=meta.layer==='planned'?$('planned').checked:document.querySelector('.layer-toggle[data-category="'+meta.category+'"]')?.checked??true;o.visible=!!v}}
function applyXray(){for(const {object:o,meta} of meshRegistry){if(!meta)continue;const k=xray&&meta.category==='body';o.material.transparent=k||meta.category==='planned'||o.name==='windshield';o.material.opacity=k?.18:meta.category==='planned'?.83:o.name==='windshield'?.66:1;o.material.depthWrite=!k;o.material.needsUpdate=true}}
function applyExplosion(){for(const {object:o,meta,basePosition} of meshRegistry){if(!meta)continue;const d=new THREE.Vector3();if(exploded){if(meta.category==='body')d.y=.38;if(meta.category==='interior')d.y=.7;if(meta.category==='chassis')d.y=-.18;if(meta.category==='suspension')d.y=-.27;if(meta.category==='drivetrain')d.y=-.45;if(meta.category==='wheels')d.x=Math.sign(basePosition.x)*.28;if(meta.category==='lighting')d.z=basePosition.z<0?-.24:.24;if(meta.category==='planned')d.y=.87}o.position.copy(basePosition).add(d)}}
function updateHighlight(){for(const {object:o,meta} of meshRegistry){if(!meta)continue;o.material.emissive.set(meta.id===selected?0xd6a16b:0x000000);o.material.emissiveIntensity=meta.id===selected?.32:0}q('.part-row').forEach(b=>b.classList.toggle('active',b.dataset.part===selected))}
function focusPart(part){const targets=meshRegistry.filter(r=>r.meta?.id===part);if(!targets.length)return;const bb=new THREE.Box3();targets.forEach(r=>bb.expandByObject(r.object));const p=bb.getCenter(new THREE.Vector3());controls.target.lerp(p,.72);controls.update()}
function selectPart(part,focus=true){selected=project.parts.some(p=>p.id===part)?part:null;const detail=$('detail');if(!selected){detail.innerHTML='<div class="detail-placeholder">Select a component on the truck or from the index to see its reference and notes.</div>';updateHighlight();$('model-tooltip').hidden=true;return}const d=project.parts.find(p=>p.id===selected);if(d.layer==='planned'&&!$('planned').checked){$('planned').checked=true;updateVis()}if(d.layer!=='planned'){const cb=document.querySelector('.layer-toggle[data-category="'+d.category+'"]');if(cb&&!cb.checked){cb.checked=true;updateVis()}}
detail.innerHTML='<div class="detail-pill '+(d.layer==='planned'?'concept':'')+'">'+(d.layer==='planned'?'PROPOSED · NOT INSTALLED':'REFERENCE · UNVERIFIED')+'</div><h2 class="detail-name">'+escapeHTML(d.name)+'</h2><p class="detail-desc">'+escapeHTML(d.summary)+'</p><div class="detail-grid"><div><small>ASSEMBLY</small><b>'+escapeHTML(CATEGORY_NAMES[d.category])+'</b></div><div><small>MANUAL</small><b>'+(d.group?'GROUP '+d.group:'CONCEPT')+'</b></div></div><label for="part-notes" style="font-size:10px;color:#a6bdc9;font-weight:bold">OWNER NOTES (THIS BROWSER)</label><textarea id="part-notes" class="detail-notes" placeholder="Condition, measurements, part number, action needed">'+escapeHTML(progress.notes[d.id]||'')+'</textarea><button class="detail-save" id="save-note">Save component note ↗</button>';
$('save-note').addEventListener('click',()=>{progress.notes[d.id]=$('part-notes').value;saveProgress();status('Saved note for '+d.name)});updateHighlight();if(focus)focusPart(part);$('tooltip-name').textContent=d.name;$('tooltip-type').textContent=d.layer==='planned'?'Concept only':'Reference model, unverified'}
function buildPartsList(){const find=$('search').value.trim().toLowerCase();let entries=project.parts.filter(p=>(p.name+' '+p.id+' '+p.category+' '+p.summary).toLowerCase().includes(find));$('part-count').textContent=entries.length+' ENTRIES';$('rail-parts-count').textContent=project.parts.length;$('parts-list').innerHTML=entries.map((p,i)=>'<button class="part-row" data-part="'+p.id+'"><span class="part-number">'+String(i+1).padStart(2,'0')+'</span><span class="part-main"><b>'+escapeHTML(p.name)+'</b><small>'+escapeHTML(CATEGORY_NAMES[p.category])+(p.layer==='planned'?' · proposed':'')+'</small></span><span class="part-arrow">›</span></button>').join('');q('.part-row').forEach(b=>b.addEventListener('click',()=>selectPart(b.dataset.part)));updateHighlight()}
function renderRoadmap(){const completed=tasks.filter(t=>progress.done[t.id]).length;const percent=Math.round(completed/tasks.length*100);$('progress-label').textContent=percent+'%';$('progress-fill').style.width=percent+'%';$('stat-progress').textContent=completed+'/'+tasks.length;$('rail-tasks-count').textContent=completed+'/'+tasks.length;$('task-list').innerHTML=phases.map(phase=>'<div class="phase"><h3>'+phase.id+' / '+escapeHTML(phase.title)+'</h3>'+tasks.filter(t=>t.phase===phase.id).map(t=>'<label class="task-row '+(progress.done[t.id]?'done':'')+'"><input type="checkbox" data-task="'+t.id+'" '+(progress.done[t.id]?'checked':'')+'><span><b><span class="priority">'+t.priority.toUpperCase()+'</span>'+escapeHTML(t.title)+'</b><small>'+escapeHTML(t.evidence_needed)+'</small></span></label>').join('')+'</div>').join('');q('[data-task]').forEach(x=>x.addEventListener('change',()=>{progress.done[x.dataset.task]=x.checked;saveProgress();renderRoadmap()}))}
function showTab(which){q('.rail-button').forEach(x=>x.classList.toggle('active',x.dataset.tab===which));for(const t of ['parts','tasks','sources'])$(t+'-panel').classList.toggle('hidden',which!==t);$('inspector-kicker').textContent={parts:'ASSEMBLY EXPLORER',tasks:'RESTORATION TRACKER',sources:'SERVICE REFERENCES'}[which]}
function setCamera(which='iso'){const target=new THREE.Vector3(0,1.02,.07);let pos={iso:[5.3,3.55,-5.8],front:[0,1.55,-8.5],side:[8,1.65,0],top:[0,9,.01]}[which]||[5,3,-6];camera.position.set(...pos);camera.lookAt(target);controls.target.copy(target);controls.update();q('[data-camera]').forEach(x=>x.classList.toggle('active',x.dataset.camera===which))}
function download(data,name,mime){const blob=new Blob([data],{type:mime});const url=URL.createObjectURL(blob);let a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function exportLog(){const data={schema:'w150-atlas-build-log-v1',project_id:project.id,version:project.version,vehicle:project.vehicle,variant,exported_at:new Date().toISOString(),task_completion:tasks.map(t=>({id:t.id,title:t.title,done:!!progress.done[t.id]})),part_notes:progress.notes,verified_equipment:{long_bed_reported_by_owner:true,wheelbase_confirmed:false,engine_id:null,transmission_id:null},note:'Reference geometry does not certify repair or fitment.'};download(JSON.stringify(data,null,2),'w150-build-log.json','application/json');status('Build log exported')}
function onClick3D(ev){const b=renderer.domElement.getBoundingClientRect();pointer.x=(ev.clientX-b.left)/b.width*2-1;pointer.y=-((ev.clientY-b.top)/b.height*2-1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(root.children,true);const hit=hits.find(h=>h.object.userData.partId);if(hit)selectPart(hit.object.userData.partId,false)}
function installHandlers(){
q('.rail-button').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));$('search').addEventListener('input',buildPartsList);
$('variant').addEventListener('change',e=>{build(e.target.value);setCamera('iso')});
q('.layer-toggle').forEach(x=>x.addEventListener('change',updateVis));$('planned').addEventListener('change',updateVis);
q('[data-camera]').forEach(b=>b.addEventListener('click',()=>setCamera(b.dataset.camera)));
$('explode').addEventListener('click',()=>{exploded=!exploded;$('explode').classList.toggle('active',exploded);applyExplosion()});
$('xray').addEventListener('click',()=>{xray=!xray;$('xray').classList.toggle('active',xray);applyXray()});
$('reset').addEventListener('click',()=>{exploded=false;xray=false;$('explode').classList.remove('active');$('xray').classList.remove('active');applyExplosion();applyXray();selectPart(null);setCamera('iso')});
$('export').addEventListener('click',exportLog);$('snapshot').addEventListener('click',()=>{renderer.render(scene,camera);downloadDataURL(renderer.domElement.toDataURL('image/png'),'w150-atlas.png')});
$('import').addEventListener('click',()=>$('import-file').click());$('import-file').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const json=JSON.parse(await f.text());if(json.schema!=='w150-atlas-build-log-v1'||json.project_id!==project.id||!Array.isArray(json.task_completion))throw Error('Not a compatible build log');const valid=new Set(tasks.map(x=>x.id));let done={};for(const item of json.task_completion)if(valid.has(item.id))done[item.id]=!!item.done;progress.done=done;progress.notes=json.part_notes&&typeof json.part_notes==='object'?json.part_notes:{};saveProgress();renderRoadmap();selectPart(selected,false);status('Build log imported')}catch(err){status('Import failed: '+err.message)}})
}
function downloadDataURL(href,name){const a=document.createElement('a');a.href=href;a.download=name;a.click()}
function init(){
 const stage=$('viewport');scene=new THREE.Scene();scene.background=new THREE.Color(0x18262e);scene.fog=new THREE.Fog(0x18262e,10,25);
 camera=new THREE.PerspectiveCamera(43,1,.1,70);
 renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'default'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-label','Interactive 3D model of 1989 Dodge W150 truck');stage.prepend(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=3.3;controls.maxDistance=16;controls.maxPolarAngle=Math.PI*.55;controls.target.set(0,1,0);
 scene.add(new THREE.HemisphereLight(0xe7efff,0x364451,3));
 const key=new THREE.DirectionalLight(0xffebce,3.3);key.position.set(-4,10,-7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;scene.add(key);
 const fill=new THREE.DirectionalLight(0xa8dcf7,1.6);fill.position.set(6,5,7);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0x1c2a32,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=.035;floor.receiveShadow=true;scene.add(floor);
 const grid=new THREE.GridHelper(26,26,0x35505c,0x2a3a45);grid.position.y=.041;scene.add(grid);
 raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();
 let pointerDown=null;renderer.domElement.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY,time:Date.now()}});renderer.domElement.addEventListener('pointerup',e=>{if(pointerDown&&Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)<9&&Date.now()-pointerDown.time<900)onClick3D(e);pointerDown=null});
 const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(stage);resize();
 loadProgress();installHandlers();buildPartsList();renderRoadmap();$('manual-groups').innerHTML='<b>GROUP MAP</b>'+project.manual.groups.map(g=>'<div><b>'+g.id+'</b>'+escapeHTML(g.name)+'</div>').join('');$('stat-parts').textContent=project.parts.length;
 build('131');setCamera('iso');
 const render=()=>{animationId=requestAnimationFrame(render);controls.update();renderer.render(scene,camera)};render();
}
try{init()}catch(e){console.error('W150 Atlas failed to start',e);$('loading').innerHTML='<b>COULD NOT INITIALIZE THREE.JS</b><span>'+escapeHTML(e.message)+'</span>';}
