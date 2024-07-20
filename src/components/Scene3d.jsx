import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import pixelateImg from '../libs/pixelate';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { configCamera, configRender, configLights, configFloor, configWall, animate, configControls, configFrame } from './three-setup';
import { FingerMoveSvg } from './icons/SvgIcons';
import { render } from 'react-dom';


const Escena3D = ({ width, height, blockSize, croppedImg, setPixelInfo, onGroupRefChange, setProductImg, handleLoading, sceneRef, renderRef, selectedFrame }) => {
    
    const [showFinger, setShowFinger] = useState(true);
	
	const canvasRef = useRef(null);
	const dennisMaterialRef = useRef(null);
	const exportGroupRef = useRef(null);

	const inch = 0.0254;

	const models = ['woodxel-resources/3d/medium_rough1.glb', 'woodxel-resources/3d/medium_rough2.glb', 'woodxel-resources/3d/medium_rough3.glb', 'woodxel-resources/3d/medium_rough4.glb'];

	const meshesRef = useRef([]);//almacena los bloques cargados
	const allColorsRef = useRef([]);

	useEffect(() => {
		console.log("croppedImg",croppedImg)	

		if (croppedImg && canvasRef.current) {
			console.log("scene 3d useEffect")
			const xBlocks = Math.round(width / blockSize);
			const yBlocks = Math.round(height / blockSize);
			sceneRef.background = new THREE.Color(0xdee2e6);

			const paintAreaWidth = canvasRef.current?.offsetWidth;
			const paintAreaHeight = canvasRef.current?.offsetHeight;
			console.log(paintAreaWidth, paintAreaHeight);
			const camera = configCamera(paintAreaWidth, paintAreaHeight, width, height);			
			configRender(renderRef, canvasRef.current, paintAreaWidth, paintAreaHeight);
			
			const directionalLight = configLights(width, height, sceneRef);				
			configControls(camera, renderRef);
			const floorMesh = configFloor(height);
			const wallMesh = configWall(height);
	
			const ambientlight = new THREE.AmbientLight(0xffffff, 3);						
		
			sceneRef.add(ambientlight);
			sceneRef.add(directionalLight);	
			sceneRef.add( floorMesh );						
			sceneRef.add( wallMesh );
			
						
		let cancelAnimation;
		pixelateImg(croppedImg, xBlocks, yBlocks)
			.then((data) => {
					//despues de pixelada la imagen entonces se crea la escena
						const { imageURL, allColors, colorDetails } = data;
						allColorsRef.current = allColors;
						setPixelInfo({ //esta informaci'on la utiliza BuyPanel.js para construir reportes
							pixelatedImage: imageURL, 
							colorsArray: allColors ,
							colorDetails: colorDetails
						});				
	
 					if (typeof window !== "undefined") {						
	
						const loaderSvg = new SVGLoader();
						//cargar la geometría	
						meshesRef.current = [];
						
						const loadModelPromises = models.map((modelUrl) => {
							if (import.meta.env.MODE !== 'development') {
								modelUrl = new URL(modelUrl, import.meta.url).href;
							}							
							return new Promise((resolve, reject) => {
								loadModelWithRetry(
									modelUrl,
									3, // Número máximo de intentos
									2000, // Retraso entre intentos
									(gltf) => { 										
										setTimeout(() => {
											meshesRef.current.push(gltf.scene.children[0]);
											resolve(gltf); // Resolver la promesa después de la demora
										}, 300); // Demora de 300 milisegundos (0.3 segundos)
									},
									undefined, // Función de progreso
									(error) => { 
										console.error('unable to load models:', error); 
										reject(error); // Rechazar la promesa si no se puede cargar el modelo
									}
								);
							});
						});
						
						Promise.all(loadModelPromises).then(() => {
							paintFrame(meshesRef.current, allColorsRef.current, sceneRef, width, height, blockSize, onGroupRefChange, exportGroupRef);
							handleLoading(false);							
							let countAnimate = 0; //para solo ejecutar el snapshot una sola vez
							//aqui se controlla mediante un callback sincronizar el frame render con el snapshoot, para que no de imagen en negro.
							cancelAnimation = animate(renderRef, sceneRef, camera, width, height, setProductImg, snapshot, countAnimate);

							//cancelAnimation = animate(renderRef, sceneRef, camera, width, height);
							
						}).catch(error => {
							console.log(error)
							alert("An issue occurred while loading the content. Please try refreshing the page.")
						});
						
						let manShape = 'woodxel-resources/3d/human_frontal_silhouette_by_ikaros_ainasoja.svg';

						if (import.meta.env.MODE !== 'development') {
							manShape = new URL(manShape, import.meta.url).href;
						}	
	
						loaderSvg.load(manShape, (data) => {
							const paths = data.paths;
							for (let i = 0; i < paths.length; i++) {
								const path = paths[i];
							
								const material = new THREE.MeshStandardMaterial({
									color: new THREE.Color(0xc2c2c2),
									side: THREE.DoubleSide,
									depthWrite: false,								
								});
							
								const shapes = path.toShapes(true);
							
								for (let j = 0; j < shapes.length; j++) {
									const shape = shapes[j];
									const geometry = new THREE.ShapeGeometry(shape);
									const mesh = new THREE.Mesh(geometry, material);

									mesh.scale.set(0.0032, -0.0032, 0.0032);
									mesh.name = "Man Shape";
									mesh.position.set(-1.36 - width/2 - 0.5, - height/2 + 1.2 , inch);
									sceneRef.add(mesh);
								}
							}		
						});
						
						registerWindowsListener(()=>onResize(camera));
						
					}
			})

		const onResize = (camera) => {
			if (canvasRef.current && renderRef) {
				const canvasWidth = canvasRef.current.offsetWidth;
				const canvasHeight = canvasRef.current.offsetHeight;
		
				renderRef.setSize(canvasWidth, canvasHeight);
				camera.aspect = canvasWidth / canvasHeight;
				camera.updateProjectionMatrix();	
			}
		};

		let cr = canvasRef.current; //guardar una referencia por si cambia el valor
			
		// Función de limpieza
		return () => {	
			console.log("desmontando")
			unRegisterWindowListener(onResize);
			cancelAnimation(); // Cancelling the animation frame here
			cr.removeChild(renderRef.domElement);
			removeObjWithChildren(sceneRef);
		};}
    }, [croppedImg]); // solo va a ejecutarse cuando se haga click sobre 3D preview porque este evento es el que cambia el croppedImg

	useEffect(()=>{
		if(croppedImg){
			console.log(selectedFrame);
			configFrame(width, height, sceneRef, selectedFrame);
		}		
	},[selectedFrame])


	const registerWindowsListener = (action) =>{		
		window.addEventListener('resize', action);		
	}

	const unRegisterWindowListener = (action) => {
		window.removeEventListener('resize', action);
	}
	//limpiar la escena
	//Se estan quedando Mesh sin eliminar, se puede comprobar en la Memory
	const removeObjWithChildren = (obj) => {
		while (obj.children.length > 0) {
		  removeObjWithChildren(obj.children[0]);
		}
		if (obj.geometry) {
		  obj.geometry.dispose();

		}
		if (obj.material) {
		  if (Array.isArray(obj.material)) {
			for (const material of obj.material) {
			  if (material.map) {
				material.map.dispose();
				//console.log('eliminando texturas');
			  }
			  if (material.metalnessMap) {
				material.metalnessMap.dispose();
				//console.log('eliminando texturas');
			  }
			  if (material.normalMap) {
				material.normalMap.dispose();
				//console.log('eliminando texturas');
			  }
			  material.dispose();
		  	  //console.log('eliminando materiales');
			}
		  } else {
			if (obj.material.map) {
			  obj.material.map.dispose();
			}
			if (obj.material.metalnessMap) {
				obj.material.metalnessMap.dispose();
			}
			if (obj.material.normalMap) {
				obj.material.normalMap.dispose();
			}
			obj.material.dispose();
		  }
		}
		if (obj.parent) {
		  obj.parent.remove(obj);
		}
	}

    return (
		<>
			<div id='canvas-wrapper' onTouchStart={()=>{setShowFinger(false)}}ref={canvasRef} style={{ width: '100%', height: '100%'}} />			
		</>
    );
};// -------------------FIN del componente-----------------------

const snapshot = (renderRef, width, height, setProductImg) => {		

    const point1 = [0.6096, 200];
    const point2 = [1.27, 320];

    const regionWidth = interpolateLinear(Math.max(width,height), point1, point2);
    const regionHeight = regionWidth;

    let canvas = renderRef.domElement;
    // Calcula el centro del canvas original
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const x = centerX - regionWidth / 2;
    const y = centerY - regionHeight / 2;

    // Crea un canvas temporal y captura la región
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = regionWidth;
    tempCanvas.height = regionHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Dibuja la región centrada en el canvas temporal
    tempCtx.drawImage(canvas, x, y, regionWidth, regionHeight, 0, 0, regionWidth, regionHeight);

    // Obtén la imagen de la región como data URL
    var dataURL = tempCanvas.toDataURL('image/jpeg', 1); //100 % calidad

	//downloadResizedImage(dataURL);
    setProductImg(dataURL);
}

const interpolateLinear = (x, point1, point2) => {
    const [x0, y0] = point1;
    const [x1, y1] = point2;

    // Asegúrate de que x1 y x0 no sean iguales para evitar división por cero
    if (x1 === x0) {
        console.error("Error: x0 y x1 no pueden ser iguales.");
        return null;
    }

    return y0 + ((y1 - y0) / (x1 - x0)) * (x - x0);
}

function loadModelWithRetry(url, maxAttempts, delay, onLoad, onProgress, onError) {
	const loader = new GLTFLoader();

	let attempts = 0;

	function attemptLoad() {
		loader.load(url, 
			(gltf) => {
				// Si la carga es exitosa, llama a la función onLoad
				onLoad(gltf);
			}, 
			onProgress, 
			(error) => {
				// Si ocurre un error y aún quedan intentos, reintenta después de un retraso
				attempts++;
				if (attempts < maxAttempts) {
					setTimeout(attemptLoad, delay);
				} else {
					// Si se alcanza el máximo de intentos, llama a la función onError
					onError(error);
				}
			}
		);
	}

	attemptLoad();
}

const paintBlock = (sceneRef) => {
	const geometry = new THREE.BoxGeometry( 1, 1, 1 );
	const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	const cube = new THREE.Mesh( geometry, material );
	sceneRef.add( cube );
}

const paintFrame = (meshes, allColors, sceneRef, width, height, blockSize, onGroupRefChange, exportGroupRef) => {

	exportGroupRef.current = new THREE.Group();

	const currentXBlocks = Math.round(width / blockSize); //la cantidad de bloques disminuye si aumenta el tama;o del bloque
	const currentYBlocks = Math.round(height / blockSize);

	// Calcula el desplazamiento necesario para que (0, 0, 0) quede en el centro del cuadro
	const offsetX = -(currentXBlocks - 1) * blockSize * 0.5;
	const offsetY = -(currentYBlocks - 1) * blockSize * 0.5;	

	//de cada bloque guarda su color y su posicion y el material que le toca
	let blockInfos = allColors.map((color, index) => {
		const matrix = new THREE.Matrix4();
		const fila = Math.floor(index / currentXBlocks);
		const columna = index % currentXBlocks;
		const posX = columna * blockSize + offsetX;
		const posY = -fila * blockSize - offsetY;

		matrix.setPosition(posX, posY, 0);	

		const materialIndex = Math.floor(Math.random() * 4);	 

		return {
			materialIndex: materialIndex,
			matrix: matrix,
			color: color,
			rotation: null, // La rotación se definirá en el siguiente paso
		};
	});

	blockInfos.forEach((block, index) => {
		const availableRotations = getAvailableRotations(
		index,
		blockInfos,
		currentXBlocks
	  );

	  const randomRotation =
		availableRotations[
		  Math.floor(Math.random() * availableRotations.length)
		];

	  const rotationMatrix = new THREE.Matrix4().makeRotationZ(randomRotation);
	  block.matrix.multiply(rotationMatrix);
	  block.rotation = randomRotation;
	});

	//por cada material le asigna los bloques que le corresponden
	let organizedByMaterial = meshes.map(() => []);
	blockInfos.forEach((blockInfo) => {
	  organizedByMaterial[blockInfo.materialIndex].push(blockInfo);
	});

	const geometry = meshes[0].geometry; //cualquier geometria porque todas son iguales
	geometry.scale(blockSize/2 , blockSize/2 , blockSize/2 );
	
	//---------------------aqui se contruyen las instancedMesh---------------
	organizedByMaterial.forEach((blocksForMaterial, index) => {				
		const material = meshes[index].material;
		material.vertexColors = true;
		material.metalness = 0;
		material.emissiveIntensity = 0;
		material.needsUpdate = true;
		material.color = new THREE.Color(0xffffff);
		const instancedMesh = new THREE.InstancedMesh(//crea un instancedMesh
			geometry.clone(),
			material,
			blocksForMaterial.length
		);
		instancedMesh.castShadow = true;
		instancedMesh.receiveShadow = true;
		instancedMesh.name = 'instancedMesh'+index;
		const allColorsBuffer = new THREE.InstancedBufferAttribute(
			new Float32Array(blocksForMaterial.length * 3),
			3
		);

		//almacenar los colores de esa instancia para pasarlos al convertidor
		let instaceColors = [];

		//cada MATERIAL tine un grupo de bloques asignados, aqui se recorre cada bloque de ese material
		blocksForMaterial.forEach((blockInfo, instanceIndex) => {
			instancedMesh.setMatrixAt(instanceIndex, blockInfo.matrix);
			let color = new THREE.Color(rgbC(blockInfo.color));//se puede optimizar
			instaceColors.push(color);
			allColorsBuffer.setXYZ(instanceIndex, color.r, color.g, color.b);
		});

		instancedMesh.geometry.setAttribute("color", allColorsBuffer);

		instancedMesh.instanceMatrix.needsUpdate = true;		
		sceneRef.add(instancedMesh);
		
		convertInstancedMeshToGroup(instancedMesh, instaceColors, exportGroupRef);
		
	});// fin del siclo donde se crean las instancedMesh

	onGroupRefChange(exportGroupRef.current);//devuelve al padre el grupo con todos los mesh para exportar

};//fin de PaintFrame

const getAvailableRotations = (index, blockInfos, currentXBlocks) => {
	let rotations = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]; // 0, 90, 180, 270 grados
	let usedRotations = [];

	// Adyacente Norte
	if (index >= currentXBlocks) {
	  usedRotations.push(blockInfos[index - currentXBlocks].rotation);
	}

	// Adyacente Sur
	let newIndex = index + Number(currentXBlocks);
	if (newIndex < blockInfos.length) {
	  usedRotations.push(blockInfos[newIndex].rotation);
	}

	// Adyacente Este
	if (index % currentXBlocks !== currentXBlocks - 1) {
	  usedRotations.push(blockInfos[index + 1].rotation);
	}

	// Adyacente Oeste
	if (index % currentXBlocks !== 0) {
	  usedRotations.push(blockInfos[index - 1].rotation);
	}

	let availableRotations = rotations.filter(
	  (rotation) => !usedRotations.includes(rotation)
	);

	return availableRotations;
  };

  //Create color string
  const rgbC = (arr) => {
	return "rgb(" + arr[0] + "," + arr[1] + "," + arr[2] + ")";
  };

  const convertInstancedMeshToGroup = (instancedMesh, instaceColors, exportGroupRef)=> {

	for (let i = 0; i < instancedMesh.count; i++) {
		const matrix = new THREE.Matrix4();
		instancedMesh.getMatrixAt(i, matrix);

		const geometryClone = instancedMesh.geometry.clone();
		geometryClone.deleteAttribute('color');
		const materialClone = instancedMesh.material.clone();

		const mesh1 = new THREE.Mesh(geometryClone, materialClone);
		
		// Suponiendo que tienes un array de colores para cada instancia
		mesh1.material.color.set(instaceColors[i]); // 'colors' es un array de colores correspondiente a cada instancia

		mesh1.applyMatrix4(matrix);
		exportGroupRef.current.add(mesh1);
	}
}

function downloadResizedImage(dataURL) {
    // Crear un enlace para la descarga
	var link = document.createElement('a');
    link.href = dataURL;
    link.download = "thumb.png"; // Nombre de archivo predeterminado, puede ajustar según sea necesario
    document.body.appendChild(link); // Agregar el enlace al documento
    link.click(); // Simular click para descargar 
	document.body.removeChild(link); // Limpiar y remover el enlace del documento
}

export default Escena3D;
