import { canvas } from "../utils/globaleVariable.js";
import { disposePaddles } from "./paddle.js";
import { renderer } from "./renderer.js";
import { clearScene, removeLights, scene } from "./scene.js";
import { disposeSphere } from "./sphere.js";
import { disposeTable } from "./table.js";

export function disposeMesh(mesh) {
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
        if (Array.isArray(mesh.material))
            mesh.material.forEach((material) => {
                console.log(">>>>>>>>>>  materials:::  ", material);
                material.dispose();
            });
        else {
            console.log(">>>>>>>>>>  material:::  ", mesh.material);
            mesh.material.dispose();
            }
    }
    if (mesh.texture)
        mesh.texture.dispose();
    scene.remove(mesh);
}
  
  // Example of removing and disposing multiple meshes
export function disposeScene(){
    // scene.traverse((object) => {
    // // if (object && object.isMesh && object.type != "Scene") {
    // //     disposeMesh(object);
    // // }
    // });
    disposeTable();
    disposePaddles();
    disposeSphere();
    removeLights();
    // scene.dispose();
    scene && scene.clear() && clearScene();
    canvas && canvas.parentNode.removeChild(canvas);
    // scene = null;
}
  