import * as THREE from 'three';
import {PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_LONG, TABLE_HEIGHT, TABLE_DEPTH} from '../utils/globaleVariable.js'

const center_paddle_geometry = new THREE.BoxGeometry( PADDLE_LONG / 16, PADDLE_WIDTH+ 0.001, PADDLE_HEIGHT + 0.001 );
const center_paddle_material = new THREE.MeshPhongMaterial( { color: 0xcccccc} );
const rcenter_paddle = new THREE.Mesh( center_paddle_geometry, center_paddle_material);
const lcenter_paddle = new THREE.Mesh( center_paddle_geometry, center_paddle_material);

const paddle_geometry = new THREE.BoxGeometry( PADDLE_LONG, PADDLE_WIDTH, PADDLE_HEIGHT );
const left_paddle_material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
const lpaddle = new THREE.Mesh( paddle_geometry, left_paddle_material);

const right_paddle_material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const rpaddle = new THREE.Mesh( paddle_geometry, right_paddle_material);

lpaddle.castShadow = true;
rpaddle.castShadow = true;
lpaddle.add(lcenter_paddle);
rpaddle.add(rcenter_paddle);

lpaddle.position.z = (TABLE_HEIGHT + PADDLE_HEIGHT) / 2;
rpaddle.position.z = (TABLE_HEIGHT + PADDLE_HEIGHT) / 2;
rpaddle.position.y = (TABLE_DEPTH - PADDLE_WIDTH) / 2;
lpaddle.position.y = -(TABLE_DEPTH - PADDLE_WIDTH) / 2;

export {lpaddle, rpaddle}