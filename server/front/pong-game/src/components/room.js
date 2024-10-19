import * as THREE from 'three';
import { loader, PADDLE_HEIGHT, TABLE_DEPTH, TABLE_HEIGHT, TABLE_WIDTH} from '../utils/globaleVariable.js';
import { disposeMesh } from './disposeComponent.js';

let room;
let left_wall;
let right_wall;
let front_wall;
let back_wall;

export function initroom() {
    // const texture = loader.load('/images/pong/textures/staduim_wood_worn.jpeg');
    // const texture = loader.load('/images/pong/textures/running_track_diff_4k.jpg');
    // const texture = loader.load('/images/pong/textures/Tiles.png');
    // const texture = loader.load('/images/pong/textures/SciFiShapesHoneycomb_flatsphere_large.jpg');
    // const texture = loader.load('/images/pong/textures/Glass_Window.jpg');
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set( 4, 4 );
    // texture.colorSpace = THREE.SRGBColorSpace;
    
    const room_geometry = new THREE.BoxGeometry( TABLE_WIDTH * 8, TABLE_DEPTH * 8, TABLE_HEIGHT );
    // const room_material = new THREE.MeshPhongMaterial( { map: texture } );
    const room_material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    room = new THREE.Mesh( room_geometry, room_material);
    
    
    const left_wall_geometry = new THREE.BoxGeometry( TABLE_HEIGHT, TABLE_DEPTH * 8, TABLE_WIDTH * 8 );
    // const left_wall_material = new THREE.MeshPhongMaterial( { map: texture } );
    const left_wall_material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    left_wall = new THREE.Mesh( left_wall_geometry, left_wall_material);
    
    const right_wall_geometry = new THREE.BoxGeometry( TABLE_HEIGHT, TABLE_DEPTH * 8, TABLE_WIDTH * 8 );
    // const right_wall_material = new THREE.MeshPhongMaterial( { map: texture } );
    const right_wall_material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    right_wall = new THREE.Mesh( right_wall_geometry, right_wall_material);
    
    const front_wall_geometry = new THREE.BoxGeometry( TABLE_WIDTH * 8, TABLE_HEIGHT, TABLE_WIDTH * 8 );
    // const front_wall_material = new THREE.MeshPhongMaterial( { map: texture } );
    const front_wall_material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    front_wall = new THREE.Mesh( front_wall_geometry, front_wall_material);
    
    const back_wall_geometry = new THREE.BoxGeometry( TABLE_WIDTH * 8, TABLE_HEIGHT, TABLE_WIDTH * 8 );
    // const back_wall_material = new THREE.MeshPhongMaterial( { map: texture } );
    const back_wall_material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    back_wall = new THREE.Mesh( back_wall_geometry, back_wall_material);
    
    
    left_wall.receiveShadow = true;
    right_wall.receiveShadow = true;
    front_wall.receiveShadow = true;
    back_wall.receiveShadow = true;
    
    room.position.z = -5;
    left_wall.position.x = -(TABLE_WIDTH / 2 + TABLE_HEIGHT / 2 + 6);
    right_wall.position.x = (TABLE_WIDTH / 2 + TABLE_HEIGHT / 2 + 6);
    front_wall.position.y = -(TABLE_DEPTH / 2 + TABLE_HEIGHT / 2 + 16);
    back_wall.position.y = (TABLE_DEPTH / 2 + TABLE_HEIGHT / 2 + 16);
    
    room.add(left_wall);
    room.add(right_wall);
    room.add(front_wall);
    room.add(back_wall);
    room.receiveShadow = true;
}

export function disposeroom() {
    disposeMesh(room);
    disposeMesh(left_wall);
    disposeMesh(right_wall);
    disposeMesh(front_wall);
    disposeMesh(back_wall);
}

export {room}
