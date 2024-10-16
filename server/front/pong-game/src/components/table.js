import * as THREE from 'three';
import {TABLE_DEPTH, TABLE_WIDTH, TABLE_HEIGHT, loader, PADDLE_HEIGHT} from '../utils/globaleVariable.js';
import { disposeMesh } from './disposeComponent.js';

let table;
let table_milieu;
let Ring_mesh;
let left_side;
let right_side;

export function initTable() {
    // const texture = loader.load('/images/pong/textures/staduim_wood_worn.jpeg');
    const texture = loader.load('/images/pong/textures/running_track_diff_4k.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    
    const table_geometry = new THREE.BoxGeometry( TABLE_WIDTH, TABLE_DEPTH, TABLE_HEIGHT );
    const table_milieu_geometry = new THREE.BoxGeometry( TABLE_WIDTH, TABLE_DEPTH / 100, TABLE_HEIGHT + 0.001);
    const table_milieu_material = new THREE.MeshPhongMaterial( { color: 0x246D97 } );
    table_milieu = new THREE.Mesh( table_milieu_geometry, table_milieu_material);
    const table_material = new THREE.MeshPhongMaterial( { map: texture } );
    // const table_material = new THREE.MeshPhongMaterial( { color: 0x11698C } );
    table = new THREE.Mesh( table_geometry, table_material);
    
    const side_geometry = new THREE.BoxGeometry(TABLE_HEIGHT, TABLE_DEPTH, PADDLE_HEIGHT * 2);
    const side_material = new THREE.MeshPhongMaterial( {color: 0x246D97});
    left_side = new THREE.Mesh(side_geometry, side_material);
    right_side = new THREE.Mesh(side_geometry, side_material);
    
    const Ring_geometry = new THREE.RingGeometry( TABLE_DEPTH/100*3.8, TABLE_DEPTH/100*4.5, 32 ); 
    const Ring_material = new THREE.MeshBasicMaterial( { color: 0x246D97, side: THREE.DoubleSide } );
    Ring_mesh = new THREE.Mesh( Ring_geometry, Ring_material );
    
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
}

export function disposeTable() {
    disposeMesh(table);
    disposeMesh(table_milieu);
    disposeMesh(Ring_mesh);
    disposeMesh(left_side);
    disposeMesh(right_side);
}

export {table}
