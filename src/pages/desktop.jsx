"use client";
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import '../css/style.css';
//import '../css/Info.css'
import Scene3d from "../components/Scene3d";
import BuyPanel from '../components/BuyPanel';
import getCroppedImg from '../libs/cropImage';
import { Rotate3dSvg} from '../components/icons/SvgIcons';
//import Export3d from '../components/Export3d';
import { Blocks, RotatingSquare } from 'react-loader-spinner';

import "react-sliding-pane/dist/react-sliding-pane.css";

const framesImages = [
	'woodxel-resources/images/frame-black.png',
	'woodxel-resources/images/frame-white.png', 
	'woodxel-resources/images/frame-nature.png', 
	'woodxel-resources/images/frame-not.png'];


export default function Desktop() {
	const [price, setPrice] = useState(0);
	const [selectedFrame, setSelectedFrame] = useState(3);
	const [invalidWidth, setInvalidWidth] = useState(false);
	const [invalidHeight, setInvalidHeight] = useState(false);
	const inputRef = useRef();
	const [showPlaceholderW, setShowPlaceholderW] = useState(true);
	const [showPlaceholderH, setShowPlaceholderH] = useState(true);

	const [isDragging, setIsDragging] = useState(false);

	const [showRotateIcon, setShowRotateIcon] = useState(true);
	const [uploadedImage, setUploadedImage] = useState("");
	const [previewImage, setPreviewImage] = useState(null);
	const [imageReady, setImageReady] = useState(null);

	const [currentStep, setCurrentStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [isGoing , setIsGoing] = useState(false);
	const [pixelInfo, setPixelInfo] = useState({ // informacion de la imagen pixelada
		colorsArray: [],
        pixelatedImage: "",
        colorDetails: []
	});	

	const [productImg, setProductImg] = useState();

  // Definir tus filtros y las imágenes de muestra para cada uno  

	const [rotation, setRotation] = useState(0);
	const [contrast, setContrast] = useState(100);
	const [brightness, setBrightness] = useState(100);

    /*Opciones del crop */
    const [width, setWidth] = useState(30);
    const [height, setHeight] = useState(30);
    const [crop, setCrop] = useState({ x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
	
	const [exportGroupRef, setExportGroupRef] = useState();

	const blockSize = 1;	
	
	const cropperRef = useRef(null);

	const croppedAreaPixelsRef = useRef(null);

	const sceneRef = useRef();
	const renderRef = useRef();

	// Efecto para actualizar el atributo data-theme
	useEffect(() => {
		sceneRef.current = new THREE.Scene();
		renderRef.current = new THREE.WebGLRenderer({ antialias: true});
	},[]);

	// Función para avanzar al siguiente paso
	const goToNextStep = () => {
		setCurrentStep(prevStep => prevStep + 1);
	};

	// se utiliza para cuando se termine de dibujar moverse al paso proximo
	const goToStep4 = () => {
		setCurrentStep(4);
	};
	
	// Función para retroceder al paso anterior
	const goToPreviousStep = () => {
		setCurrentStep(prevStep => prevStep - 1);
	};

	// Actualiza el estado cuando el recorte se completa
	const onCropComplete = (croppedArea, croppedAreaPixels) => {
		console.log("crop complete")
		croppedAreaPixelsRef.current = croppedAreaPixels;		
		//updatePreviewImage();
	};
	
	// Estilos para aplicar brillo, contraste y rotación en tiempo real
	const imageStyle = {
		position: 'relative',
		maxHeight: '562px',
		width: 'auto',
		objectFit: 'contain'
	};


	/** cuando se sube una imagen */
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setIsLoading(true);
			// Dimensiones y calidad de compresión máximas
			const maxWidth = 1280;
			const maxHeight = 1280;
			const quality = 0.7; // Compresión al 70%

			// Llame a la función de redimensionamiento y compresión
			resizeAndCompressImage(file, maxWidth, maxHeight, quality, (compressedBlob) => {
				// Continúe con el procesamiento aquí
				const img = URL.createObjectURL(compressedBlob);
				setUploadedImage(img);
				setPreviewImage(img);
				setIsLoading(false); // Finalizar el indicador de carga
				setCurrentStep(2);
				// Reset para cuando se carga desde el preview
				setRotation(0);
				setContrast(100);
				setBrightness(100);     
				setWidth(30);
				setHeight(30);
				setCrop({ x: 0, y: 0});
				setZoom(1);
				setShowPlaceholderW(true);
				setShowPlaceholderH(true);

				//downloadResizedImage(compressedBlob);
			});
		}
	};

	/**
	 * Cambio en las dimensiones
	 */
	const handleWidth = (event) => {
		let { value } = event.target;	
		if (value < 24 || value > 300) {
			setInvalidWidth(true);
		}
		else {
			setInvalidWidth(false);
		}
		setWidth(Number(value));
	};
	
	
	const handleHeight = (event) => {
		let { value } = event.target;
		if (value < 24 || value > 300) {
			setInvalidHeight(true);
		} else {
			setInvalidHeight(false);
		}

		setHeight(Number(value));
	};


	//Cuando se preciona el boton de mostrar el 3d
	const handleView = async () => {
		setCurrentStep(3);
		setIsLoading(true);
		const i = await getCroppedImg(uploadedImage, croppedAreaPixelsRef.current, rotation, brightness, contrast);
		setImageReady(i);
	}	

	const handleExportGroupRef = (group)=>{
		setExportGroupRef(group);
	}
	
	const handleDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};
	
	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();		
	};
	
	const handleDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();		
		setIsDragging(false);
		
	};
	
	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			handleImageChange({ target: { files } });
		}
	};

	const handleFrameClick = (index, event) => {
		event.preventDefault()
		setSelectedFrame(index);
	};

	
  return (
		<>				
			<input style={{display: 'none'}} ref={inputRef} type="file" onChange={handleImageChange} accept="image/*" title=""/>		
			
					<div className="eut-product-images images" >
							<div className="step-item-inner">	
								<input
									className="drop"
									type="file"
									onChange={handleImageChange}
									accept="image/*"
									title=""
									style={{ display: 'none' }}
									id="fileInput"
								/>																
								{(
									<div className="spinner" style={{ backgroundColor: '#ffffff', display: isLoading ? "flex" : "none" }}>
										<RotatingSquare
											visible={true}
											height="100"
											width="100"
											color="#f94949"
											ariaLabel="rotating-square-loading"
											wrapperStyle={{}}
											wrapperClass=""
											/>
									</div>
								)}
								
									{ currentStep == 1 && 
									<>
									<div
										className="drop-zone"
										onDragEnter={handleDragEnter}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
									>										
										
										<button
											onClick={() => document.getElementById('fileInput').click()}
										>
											Select an image
										</button>
										<p className='no-drag' style={{ fontWeight: '700' }}>or drop it here</p>
										{isDragging && (
										<div className="overlay">
											<p>Drop it</p>
										</div>
										)}
									</div>
									</>}
								
								
									{ currentStep == 2 && <>
									<Cropper
										ref={cropperRef}
										image={uploadedImage}
										rotation={rotation}
										onCropChange={setCrop}
										onCropComplete={onCropComplete}
										crop={crop}
										zoom={zoom}
										zoomSpeed={0.1}
										aspect={width / height}
										onZoomChange={(newZoom) => setZoom(newZoom)}
										style={{ containerStyle: { width: '100%', height: '100%', margin:'0', maxHeight: '562px', backgroundColor:'#ffffff'}, mediaStyle: imageStyle }}
									/>
									</>}
									<>
									<Scene3d 
											width={width * 0.0254}
											height={height * 0.0254}
											blockSize={blockSize * 0.0254}
											croppedImg = {imageReady}
											onGroupRefChange={handleExportGroupRef}//cuando se cree el grupo en la escena 3d											
											setPixelInfo = {setPixelInfo}
											setProductImg = {setProductImg}
											handleLoading = {setIsLoading}
											sceneRef = {sceneRef.current }
											renderRef = {renderRef.current}
											selectedFrame={selectedFrame}
									/>
										
										{/* <Export3d 
										exportGroup={exportGroupRef}
										handleLoading = {setIsLoading}
										setCurrentStep = {setCurrentStep}
										/> */}
										{showRotateIcon && 
										<div className='rotate-3d' onMouseEnter={()=> setShowRotateIcon(false)}>
											<Rotate3dSvg/>
										</div>}
									</>					
								
																					
							</div>
					</div>
					<div className="eut-entry-summary" style={{position: 'relative'}}>
						<div className="spinner" style={{ backgroundColor: '#ffffff', display: isGoing ? "flex" : "none" }}>
							<RotatingSquare
							visible={true}
							height="100"
							width="100"
							color="#f94949"
							ariaLabel="rotating-square-loading"
							wrapperStyle={{}}
							wrapperClass=""
							/>
						</div>
						<h5 className="eut-single-price"><span className="woocommerce-Price-amount amount">
							<span className="woocommerce-Price-currencySymbol">$</span>{price}</span>
						</h5>
						<h1 className="eut-h2 eut-product-title product_title entry-title">CUSTOMIZE YOUR COMMISION</h1>
						<div className="eut-description">
							<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.</p>
						</div>
						<div>							
							<button	className={currentStep==1?"disabled":""} onClick={() => document.getElementById('fileInput').click()}>
								Change image
							</button>
							<div className="inputs">												
								<input	
								className={currentStep==1 || currentStep===3?"disabled":""}							
								type="number"
								label="Width"
								placeholder={showPlaceholderW?"min 24\"":" "}									
								onChange={handleWidth}
								onFocus={(even)=>{even.target.select(); setShowPlaceholderW(false)}}									
								value = {width || ""}
								/>							
															
								<input
								className={currentStep==1 || currentStep===3 ?"disabled":""}
								min="24" 
								max="300"
								type="number"
								label="Height"									
								placeholder={showPlaceholderH?"min 24\"":" "}									
								onChange={handleHeight}
								onFocus={(even)=>{even.target.select(); setShowPlaceholderH(false)}}									
								value = {height || ""}
								/>											
							</div>
							<button className={`margintop-20 ${currentStep==1 || currentStep===3?'disabled':''}`} onClick={handleView}>3D Preview</button>
							<div>
								<ul className='frame-list margintop-20'>
									{framesImages.map((imgFrame, index) => {
										if (import.meta.env.MODE !== 'development') {
											imgFrame = new URL(imgFrame, import.meta.url).href;
										}		
										return (
											<li className={currentStep!==3 || isLoading?"disabled":""} key={index} onClick={(event) => handleFrameClick(index, event)}>
												<img src={imgFrame}></img>
											</li>
										)
									})}									
								</ul>
							</div>
							<BuyPanel
								pixelatedImage = {pixelInfo.pixelatedImage}
								colorsArray = {pixelInfo.colorsArray}
								colorDetails = {pixelInfo.colorDetails}
								blockSize = {blockSize}
								xBlocks = {Math.floor(width / blockSize)}
								yBlocks = {Math.floor(height / blockSize)}
								handleLoading = {setIsLoading}
								productImg = {productImg}
								setPrice = {setPrice}
								setIsGoing = {setIsGoing}
								selectedFrame = {selectedFrame}
								currentStep = {currentStep}
								isLoading = {isLoading}
							/>			
						</div>
					</div>			
			
		</>
  )
}

function resizeAndCompressImage(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compresión de la imagen
            canvas.toBlob(callback, 'image/jpeg', quality);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function downloadResizedImage(blob) {
    // Crear un enlace para la descarga
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "resized-image.png"; // Nombre de archivo predeterminado, puede ajustar según sea necesario
    document.body.appendChild(link); // Agregar el enlace al documento
    link.click(); // Simular click para descargar
    document.body.removeChild(link); // Limpiar y remover el enlace del documento
}
