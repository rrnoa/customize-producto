import React, { useRef, useState } from 'react'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import "../libs/svg2pdf.umd.min.js";
import pako from 'pako';
import JSZip from 'jszip';
import ModalDownload from './ModalDownload.jsx';
import {Tooltip, Button} from "@nextui-org/react";


const Export3d = ({exportGroup, handleLoading, mobile, setCurrentStep}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	
	function closeModal() {
		setIsModalOpen(false);
	}
    
	const onclickHandler = (event) => {
        event.preventDefault();
		setIsModalOpen(true);
    }

	const compressModel = () => {
		const exporter = new GLTFExporter();
		exporter.parse(
			exportGroup, 
			async (gltf) => {
				// gltf es un objeto JSON que representa tu escena
				const output = JSON.stringify(gltf, null, 2);
				const blob = new Blob([output], {type: 'application/octet-stream'});
				saveAsZip(blob, 'model3D-' + Date.now()); // Solo el nombre base y el timestamp
			},
			function (error) {
				console.log('An error happened when creating model', error);
			},
			{maxTextureSize: 256}
		);
	};
	
	const saveAsZip = async (blob, baseFilename) => {
		const zip = new JSZip();
		// Añade el archivo al zip con la extensión .gltf
		zip.file(baseFilename + '.gltf', blob, {compression: "DEFLATE"});
		// Genera el archivo zip asegurándose de aplicar la compresión
		const content = await zip.generateAsync({type: "blob", compression: "DEFLATE"});
		download(content, baseFilename + '.zip');
	};
	
	const download = (blob, filename) => {
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};
	
	

  return (
	<>
	<ModalDownload 
		isModalOpen={isModalOpen}
		closeModal={closeModal}  
		compressModel = {compressModel}
	/>
	{mobile && (
		<button id="woodxel_panel_3d" onClick={onclickHandler}>			
			<span>
				Get Your FREE 3D Model
            </span>
		</button>
	)}
	{!mobile && (
		<Tooltip showArrow={true} color="secondary" content="Download now your Free 3d model" radius='sm'>
		<Button  color="secondary" radius="sm" className="text-base font-bold" id="woodxel_panel_3d" onClick={onclickHandler}>			
				Get Your FREE 3D Model         
		</Button>
		</Tooltip>				
	)}	
	</>	
  )
}

//Export3d.propTypes = {}

export default Export3d