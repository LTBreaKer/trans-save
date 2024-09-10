import * as THREE from 'three';
import {TABLE_DEPTH, TABLE_WIDTH, TABLE_HEIGHT, loader, PADDLE_HEIGHT} from '../utils/globaleVariable.js';

const texture = loader.load('/images/pong/textures/staduim_wood_worn.jpeg');
texture.colorSpace = THREE.SRGBColorSpace;

const table_geometry = new THREE.BoxGeometry( TABLE_WIDTH, TABLE_DEPTH, TABLE_HEIGHT );
const table_milieu_geometry = new THREE.BoxGeometry( TABLE_WIDTH, TABLE_DEPTH / 75, TABLE_HEIGHT + 0.001);
const table_milieu_material = new THREE.MeshPhongMaterial( { color: 0xffffff } );
const table_milieu = new THREE.Mesh( table_milieu_geometry, table_milieu_material);
// const table_material = new THREE.MeshPhongMaterial( { map: texture } );
const table_material = new THREE.MeshPhongMaterial( { color: 0x0000ff } );
const table = new THREE.Mesh( table_geometry, table_material);

const side_geometry = new THREE.BoxGeometry(TABLE_HEIGHT, TABLE_DEPTH, PADDLE_HEIGHT * 2);
const side_material = new THREE.MeshPhongMaterial( {color: 0xffffff});
const left_side = new THREE.Mesh(side_geometry, side_material);
const right_side = new THREE.Mesh(side_geometry, side_material);

const Ring_geometry = new THREE.RingGeometry( TABLE_DEPTH / 13, TABLE_DEPTH /11.3, 32 ); 
const Ring_material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
const Ring_mesh = new THREE.Mesh( Ring_geometry, Ring_material );

Ring_mesh.position.z = TABLE_HEIGHT / 2 + 0.001;
left_side.position.x = - TABLE_WIDTH / 2 - TABLE_HEIGHT / 2;
right_side.position.x = + TABLE_WIDTH / 2 + TABLE_HEIGHT / 2;
left_side.position.z = PADDLE_HEIGHT * 1 - TABLE_HEIGHT / 2;
right_side.position.z = PADDLE_HEIGHT * 1 - TABLE_HEIGHT / 2;

table_milieu.receiveShadow = true;
Ring_mesh.receiveShadow = true;
left_side.receiveShadow = true;
right_side.receiveShadow = true;

table.add(table_milieu);
table.add(Ring_mesh);
table.add(left_side);
table.add(right_side);
table.receiveShadow = true;

export {table}

// paddle * 2 paddle + paddle / 2
// paddle * 3 1.5 paddle