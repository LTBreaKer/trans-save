import * as THREE from 'three';
import { lpaddle, rpaddle } from "../components/paddle.js";
import { table } from "../components/table.js";
import { sphere } from "../components/sphere.js";
import { light } from "../components/light.js";

const scene = new THREE.Scene();

scene.add( table );
scene.add( lpaddle );
scene.add( rpaddle );
scene.add( sphere );
scene.add( light );

export {scene};