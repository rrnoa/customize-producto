"use client";
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import '../css/style.css';
import Scene3d from "../components/Scene3d";
import BuyPanel from '../components/BuyPanel';
import getCroppedImg from '../libs/cropImage';
import { Rotate3dSvg} from '../components/icons/SvgIcons';
//import Export3d from '../components/Export3d';
import { RotatingSquare } from 'react-loader-spinner';

import "react-sliding-pane/dist/react-sliding-pane.css";
import Export3d from '../components/Export3d';

const framesImages = [
	'woodxel-resources/images/frame-black.png',
	'woodxel-resources/images/frame-white.png', 
	'woodxel-resources/images/frame-nature.png', 
	'woodxel-resources/images/frame-not.png'];


export default function Desktop({hiddenImageUrl}) {
	const [price, setPrice] = useState(0);
	const [selectedFrame, setSelectedFrame] = useState(3);
	const [invalidWidth, setInvalidWidth] = useState(false);
	const [invalidHeight, setInvalidHeight] = useState(false);
	const inputRef = useRef();
	const [showPlaceholderW, setShowPlaceholderW] = useState(true);
	const [showPlaceholderH, setShowPlaceholderH] = useState(true);

	const [isDragging, setIsDragging] = useState(false);

	const [showRotateIcon, setShowRotateIcon] = useState(true);
	const [uploadedImage, setUploadedImage] = useState(hiddenImageUrl?hiddenImageUrl:"");
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
    const [width, setWidth] = useState(24);
    const [height, setHeight] = useState(24);
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
		if(hiddenImageUrl) {
			setUploadedImage(hiddenImageUrl);
			setCurrentStep(2)
		}
	},[hiddenImageUrl]);

	// Función para avanzar al siguiente paso
	const goToNextStep = () => {
		setCurrentStep(prevStep => prevStep + 1);
	};
	
	// Función para retroceder al paso anterior
	const goToPreviousStep = () => {
		setCurrentStep(prevStep => prevStep - 1);
	};

	// Actualiza el estado cuando el recorte se completa
	const onCropComplete = (croppedArea, croppedAreaPixels) => {
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
				console.log(img)
				setUploadedImage(img);
				setPreviewImage(img);
				setIsLoading(false); // Finalizar el indicador de carga
				setCurrentStep(2);
				// Reset para cuando se carga desde el preview
				setRotation(0);
				setContrast(100);
				setBrightness(100);     
				setWidth(24);
				setHeight(24);
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

	const handleEdit = () => {
		setCurrentStep(2)
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

	const handleBlur = (event, setValue) => {
        let value = parseInt(event.target.value, 10);
        if (isNaN(value)) {
            setValue('');
        } else if (value < 24) {
            setValue(24);
        } else if (value > 300) {
            setValue(300);
        } else {
            setValue(value);
        }
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
										//image={hiddenImageUrl?hiddenImageUrl:uploadedImage}
										image={uploadedImage}
										rotation={rotation}
										onCropChange={setCrop}
										onCropComplete={onCropComplete}
										crop={crop}
										zoom={zoom}
										zoomSpeed={0.1}
										aspect={width / height}
										onZoomChange={(newZoom) => setZoom(newZoom)}
										style={{ containerStyle: { width: '100%', height: '100%', margin:'0', backgroundColor:'#ffffff'}, mediaStyle: imageStyle }}
									/>									
									</>
									}
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
										
									
										{showRotateIcon && 
										<div className='rotate-3d' onMouseEnter={()=> setShowRotateIcon(false)}>
											<Rotate3dSvg/>
										</div>}
									</>
								{ currentStep !== 1 && 												
									<button	className={`btn-change-img eut-onsale eut-small-text eut-bg-primary-1 ${currentStep==1?"disabled":""}`} onClick={() => document.getElementById('fileInput').click()}>
										Change image
									</button>	
								}								
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
						<h1 className="eut-h2 eut-product-title product_title entry-title">IMAGE CUSTOMIZED</h1>
						<div className='custom-product-description'>
							<p>Transform your photos into unique, handcrafted pixelated wood art. Simply upload your image, choose your size, place your order and receive a ready-to-hang masterpiece with free shipping across the USA.</p>
						</div>
						<div>
						<div className='custom-sizes woocommerce'>
							<form>
							<div className="inputs">
								<p className="form-row form-row-first" id="width_field" data-priority="10">
									<label htmlFor="width" className="">Width</label>
									<span className="woocommerce-input-wrapper">
										<input 
										className={`input-text ${currentStep == 1 || currentStep === 3 ? "disabled" : ""}`} 
										id="width"
										type="number"
										onChange={handleWidth}
										onFocus={(even)=>{even.target.select()}}
										onBlur={(event) => handleBlur(event, setWidth)}
										value={width}
										min={24}
										max={300}
										/>
									</span>
								</p>
								<p className="form-row form-row-first" id="height_field" data-priority="10">
									<label htmlFor="height" className="">Height</label>
									<span className="woocommerce-input-wrapper">
										<input 
										className={`input-text ${currentStep == 1 || currentStep === 3 ? "disabled" : ""}`} 
										min="24"
										max="300"
										type="number"
										onChange={handleHeight}
										onFocus={(even)=>{even.target.select()}}
										onBlur={(event) => handleBlur(event, setHeight)}
										value={height}
										/>
									</span>
								</p>
							</div>
								
							</form>
							<div className=''>
								<button style={{borderRadius: 0}} className={`eut-btn button eut-btn-alt ${currentStep == 3 ? '' : 'disabled'}`} onClick={handleEdit}>Edit</button>
							</div>
						</div>
						<div style={{marginTop: '40px'}}>
							<button style={{borderRadius: 0}} className={`ut-btn button eut-btn-alt ${currentStep == 1 || currentStep === 3 ? 'disabled' : ''}`} onClick={handleView}>3D Preview</button>
							<Export3d 
								exportGroup = {exportGroupRef}
								handleLoading = {setIsLoading}
								currentStep = {currentStep}
							/>
						</div>
							<label className="input-label margintop-40" style={{display: 'block', marginBottom: '6px', lineHeight: 'normal'}}>Select a frame</label>
							<div>
								<ul className='frame-list'>
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
							<h5 className="eut-single-price" style={{display:'block', marginTop: '35px'}}><span className="woocommerce-Price-amount amount">
								<span className="woocommerce-Price-currencySymbol">$</span>{price}</span>
							</h5>
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
