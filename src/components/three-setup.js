import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


export const configCamera = (paintAreaWidth, paintAreaHeight, width, height) => {
    const camera = new THREE.PerspectiveCamera(45, paintAreaWidth / paintAreaHeight, 0.1, 100);
    const cameraZPosition = Math.max( width, height)+2;
    camera.position.z = cameraZPosition;
    camera.updateProjectionMatrix();
    return camera;
}

export const configRender = (renderer, mount, paintAreaWidth, paintAreaHeight) => {
    renderer.setSize(paintAreaWidth, paintAreaHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;					
    //renderer.shadowMap.type = THREE.PCFShadowMap;
    //renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.toneMappingExposure = 1;
    //renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);
}

export const configLights = (width, height, scene) => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3)

    //DirectionalLightControl(gui, directionalLight);
    directionalLight.castShadow = true;
    directionalLight.position.x = 0.5;
    directionalLight.position.y = 2;
    directionalLight.position.z = 1;
    directionalLight.shadow.camera.far = 20;

    directionalLight.shadow.camera.top = height / 2 + 0.1;
    directionalLight.shadow.camera.left = - (width) / 2 - 0.1 ;
    directionalLight.shadow.camera.right = (width ) / 2 + 0.1;
    directionalLight.shadow.camera.bottom = - (height) / 2 - 0.1;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024; 

    directionalLight.shadow.radius = 2;
    directionalLight.shadow.blurSamples = 4;
    //directionalLight.shadow.bias = 0.00002;
    directionalLight.shadow.bias = -0.0001;
    //DirectionalLightControl(gui,directionalLight);
    //let shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    //const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
    
    //scene.add( helper );
    
    //scene.add(shadowHelper);
    //directionalLight.shadow.camera.updateProjectionMatrix();

    return directionalLight;
}

export const configControls = (camera, renderer) => {
    //config cotrols
   const controls = new OrbitControls(camera, renderer.domElement);
    //controls.minDistance = Math.max(5, Math.hypot(width, height)/4);
    controls.minDistance = 0.5;
    controls.maxDistance = 20;
    controls.enablePan = false;
    //controls.maxPolarAngle = THREE.MathUtils.degToRad(92);
    controls.minPolarAngle = THREE.MathUtils.degToRad(45);
    controls.maxPolarAngle = controls.getPolarAngle();
    controls.maxAzimuthAngle = THREE.MathUtils.degToRad(60);
    controls.minAzimuthAngle = THREE.MathUtils.degToRad(-60);
    controls.update();

    return controls;
}

export const configFloor = (height) => {
    const floorWidth = 10;
	const floorDepth = 20;
	const floorGeometry = new THREE.PlaneGeometry( floorWidth, floorDepth );
	const floorColor = 0xbbbbbb;
	//const floorColor = 0x00ff00;
	const floorMaterial = new THREE.MeshStandardMaterial( { color: floorColor } );
	
	floorMaterial.side = THREE.DoubleSide;
	const floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
	floorMesh.rotateX(Math.PI/2);
	floorMesh.position.set(0, - height/2 - 0.6, 10 );
	floorMesh.receiveShadow = false;

    return floorMesh;
}


export const configWall = (height) => {
    const inch = 0.0254;
    const wallHeight = 10;
	const wallWidth = 10;
	const wallGeometry = new THREE.PlaneGeometry( wallWidth, wallHeight );
	const wallColor = 0xffffff;
	const wallMaterial = new THREE.MeshStandardMaterial( { color: wallColor } );
	wallMaterial.side = THREE.DoubleSide;
	const wallMesh = new THREE.Mesh( wallGeometry, wallMaterial );
	//la altura del muro / 2, menos la mitad de la altura del cuadro
	wallMesh.position.set(0, 5 - height/2 - 0.6 , -inch );
	wallMesh.receiveShadow = true;
	wallMesh.castShadow = false;
    return wallMesh;
}

export const configFrame = (largo, alto, scene, selectedFrame) => {
    if(selectedFrame !== null) { 
        removeObjectByName(scene, "left-frame");
        removeObjectByName(scene, "bottom-frame");
        removeObjectByName(scene, "right-frame");
        removeObjectByName(scene, "top-frame");
    } 
    
    if(selectedFrame !== 3){
        const inch = 0.0254;
        const length = largo + 2*inch;  // La longitud de la pieza del marco
        const altura = alto + 2*inch;  // marco lateral altura
    
        const width = 1.5 * inch; // La anchura del marco
        const thickness = 1 * inch; // El grosor del marco
        
        // Crear la geometría del marco
        const shapeL = new THREE.Shape();
        const shapeA = new THREE.Shape();
        
        // Empezamos dibujando el perfil del marco en 2D
        shapeL.moveTo(0, 0); // punto de inicio en la esquina inferior izquierda
        shapeL.lineTo(length, 0); // línea al extremo derecho, inferior
        shapeL.lineTo(length - width, width); // línea hacia arriba y a la izquierda en ángulo de 45°
        shapeL.lineTo(width, width); // línea hacia la izquierda, parte superior
        shapeL.lineTo(0, 0); // línea de regreso al punto de inicio, cerrando el perfil
    
        // Empezamos dibujando el perfil del marco en 2D
        shapeA.moveTo(0, 0); // punto de inicio en la esquina inferior izquierda
        shapeA.lineTo(0, altura); // línea al extremo derecho, inferior
        shapeA.lineTo(width, altura - width); // línea hacia arriba y a la izquierda en ángulo de 45°
        shapeA.lineTo(width, width); // línea hacia la izquierda, parte superior
        shapeA.lineTo(0, 0); // línea de regreso al punto de inicio, cerrando el perfil
        
        // Extruir el perfil para darle grosor y crear una geometría 3D
        const extrudeSettings = {
            steps: 2,
            depth: thickness,
            bevelEnabled: false, // no queremos biselado
        };
    
        const textureLoader = new THREE.TextureLoader();
        let textureUrl = 'woodxel-resources/textures/wood-texture.jpg';
        if (import.meta.env.MODE !== 'development') {
            textureUrl = new URL(textureUrl, import.meta.url).href;
        }
        const woodTexture = textureLoader.load(textureUrl);
        
        const geometryL = new THREE.ExtrudeGeometry(shapeL, extrudeSettings);
        const geometryA = new THREE.ExtrudeGeometry(shapeA, extrudeSettings);    
    
        let colorFrame = new THREE.Color(0xff0000);
        
        // Crear el material y el mesh (malla)
        switch(selectedFrame) {
            case 0:
                colorFrame = new THREE.Color(0x29282e);
              break;
            case 1:
                colorFrame = new THREE.Color(0xd3d3d3);
              break;
            case 2:
                //colorFrame = new THREE.Color(0x745840);
                colorFrame = new THREE.Color(0xffffff);
                break;
            default:
                colorFrame = new THREE.Color(0xff0000);
          }
        let material = new THREE.MeshStandardMaterial({ color: colorFrame });
        
        if (selectedFrame === 2) {
            material.map = woodTexture;
        }
        const bottom = new THREE.Mesh(geometryL, material);
        let left = new THREE.Mesh(geometryA, material);
    
        //bottom.castShadow = true;
        bottom.receiveShadow = true;
        
        let top = bottom.clone();
        
        let right = left.clone();
    
        top.rotation.x = - Math.PI;
        top.position.set(-largo/2 - inch, alto/2 + inch, 0);
        
        right.rotation.y = Math.PI;
        right.position.set(largo/2 + inch, - alto/2 - inch , 0);
    
        left.position.set(- largo/2 - inch, - alto/2 - inch , - inch);
    
        bottom.position.set(-largo/2 - inch, - alto/2 - inch, - inch);
    
        left.name = "left-frame";
        bottom.name = "bottom-frame";
        right.name = "right-frame";
        top.name = "top-frame";

        scene.add(left);
        scene.add(right);
        scene.add(top);
        scene.add(bottom);
    
    }    
   
}

export const animate = (renderer, scene, camera, width, height, setProductImg, snapshot, countAnimate) => {
    let frameId;
    function animation() {
      frameId = requestAnimationFrame(animation);
      renderer.render(scene, camera);
        if(countAnimate === 0){
            snapshot(renderer, width, height, setProductImg);
            countAnimate ++;
        }
    }
    animation();

    return () => {
        cancelAnimationFrame(frameId);
    };
};

function removeObjectByName(scene, name) {
    const object = scene.getObjectByName(name);
    if (object) {
      object.parent.remove(object);
    }
  }

