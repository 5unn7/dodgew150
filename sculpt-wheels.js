import * as THREE from 'three';
/* Tires, steel wheels and raised tread for the hand-sculpted W150 reference shell. */
export function sculptWheels({root,registry,parts,variant}) {
 const rear=1.81+(variant==='115'?-0.4064:0);
 const m=(hex,metal=.06,rough=.8)=>new THREE.MeshStandardMaterial({color:hex,metalness:metal,roughness:rough,side:THREE.DoubleSide});
 const rubber=m(0x141719,.08,.94),sidewall=m(0x282b2e,.08,.92),inside=m(0x12171a,.30,.77),steel=m(0xc3cac8,.84,.25),polished=m(0xe4e8e6,.95,.13),paint=m(0x7b8586,.55,.35);
 function a(id,geo,mat,x,y,z){const o=new THREE.Mesh(geo,mat.clone());o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;o.userData.partId=id;root.add(o);registry.push({object:o,meta:parts.find(p=>p.id===id),basePosition:o.position.clone()});return o;}
 function ring(id,R,tube,x,y,z,mat,n=64){const o=a(id,new THREE.TorusGeometry(R,tube,14,n),mat,x,y,z);o.rotation.y=Math.PI/2;return o;}
 function disk(id,R,depth,x,y,z,mat,segments=44){const o=a(id,new THREE.CylinderGeometry(R,R,depth,segments,1),mat,x,y,z);o.rotation.z=Math.PI/2;return o;}
 function wheel(id,s,z){
  const x=s*1.031,y=.50;
  // Tire casing and molded sidewall with a clear metallic rim recess.
  ring(id,.376,.115,x,y,z,rubber);
  disk(id,.358,.227,x,y,z,sidewall);
  ring(id,.361,.040,x+s*.123,y,z,rubber);
  ring(id,.308,.020,x+s*.139,y,z,inside);
  disk(id,.272,.256,x+s*.019,y,z,steel);
  disk(id,.215,.266,x+s*.024,y,z,paint);
  disk(id,.116,.28,x+s*.032,y,z,polished);
  disk(id,.08,.30,x+s*.035,y,z,steel);
  ring(id,.271,.016,x+s*.158,y,z,polished);
  ring(id,.187,.016,x+s*.163,y,z,polished);
  // Period steel-wheel vent holes and lug studs, not textured stickers.
  for(let k=0;k<8;k++){
    const a=k*Math.PI/4,cy=y+.220*Math.cos(a),cz=z+.220*Math.sin(a);
    disk(id,.030,.278,x+s*.032,cy,cz,inside,12);
    disk(id,.019,.283,x+s*.042,cy,cz,steel,12);
  }
  for(let k=0;k<6;k++){
    const a=k*Math.PI/3,cy=y+.112*Math.cos(a),cz=z+.112*Math.sin(a);
    disk(id,.019,.315,x+s*.039,cy,cz,polished,12);
  }
  // Render tire block tread in one draw call per wheel using instancing.
  const count=44,rows=3,g=new THREE.BoxGeometry(.085,.071,.094),mesh=new THREE.InstancedMesh(g,sidewall,count*rows);
  const tmp=new THREE.Object3D();
  for(let k=0;k<count;k++){
   for(let row=0;row<rows;row++){
    const q=k*Math.PI*2/count+(row-1)*.035;
    tmp.position.set(x+(row-1)*.092,y+.466*Math.cos(q),z+.466*Math.sin(q));
    tmp.rotation.set(q,0,(row-1)*.18);tmp.updateMatrix();mesh.setMatrixAt(k*rows+row,tmp.matrix);
   }
  }
  mesh.instanceMatrix.needsUpdate=true;mesh.userData.partId=id;mesh.castShadow=true;mesh.receiveShadow=true;
  root.add(mesh);registry.push({object:mesh,meta:parts.find(p=>p.id===id),basePosition:mesh.position.clone()});
 }
 for(const s of [-1,1]){wheel('wheels_front',s,-1.52);wheel('wheels_rear',s,rear)}
}
