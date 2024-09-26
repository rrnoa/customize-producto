// Define wpApiSettings as a global variable if it doesn't already exist
const wpApiSettings = typeof window.wpApiSettings !== 'undefined' ? window.wpApiSettings : {
    root: 'https://your-site.com/wp-json/',
    nonce: 'Fake'
};

import React, { useState } from 'react';
import '../css/LeadModal.css';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import JSZip from 'jszip';

const LeadModal = ({ isOpen, onClose, exportGroup }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [sending, setSending] = useState(false);

/*     function download(blob, filename){
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}; */

    const handleSubmit = async (event) => {
        setSending(true);
        event.preventDefault();

        // Generar y comprimir el modelo GLTF
        const compressedModelBlob = await compressModel(exportGroup);

        // Crear el FormData y adjuntar el archivo comprimido
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('company', company);
        formData.append('file', compressedModelBlob, 'model3D.zip'); // Nombre del archivo

        // Enviar los datos al servidor
        await sendData(formData);
        setSending(false);
    };

    const compressModel = async (exportGroup) => {
        return new Promise((resolve, reject) => {
            const exporter = new GLTFExporter();
            exporter.parse(
                exportGroup,
                async (gltf) => {
                    try {
                        const output = JSON.stringify(gltf, null, 2);
                        const blob = new Blob([output], { type: 'application/octet-stream' });

                        const zip = new JSZip();
                        zip.file('model3D.gltf', blob, { compression: 'DEFLATE' });

                        // Generar el archivo ZIP
                        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
                        resolve(zipBlob);
                    } catch (error) {
                        reject(error);
                    }
                },
                function (error) {
                    reject(error);
                },
                { maxTextureSize: 256 }
            );
        });
    };

    const sendData = async (formData) => {
        try {
            const response = await fetch('https://woodxel.com/wp-json/custom/v1/upload-file/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-WP-Nonce': wpApiSettings.nonce
                }
            });

            if (response.ok) {
                console.log('Formulario enviado exitosamente');
                onClose(); // Cerrar el modal                
            } else {
                alert('Error al enviar el formulario');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Get your FREE 3D model</h2>
                <p>You will receive an email with the download link.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={sending}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        style={{marginTop: '20px'}}
                        value={email}
                        disabled={sending}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Company"
                        style={{marginTop: '20px'}}
                        value={company}
                        disabled={sending}
                        onChange={(e) => setCompany(e.target.value)}                        
                    />
                    <div className="terms-container">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreedToTerms}
                            disabled={sending}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                        />
                        <label htmlFor="terms">
                            I have read <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>.
                        </label>
                    </div>
                    <button type="submit" disabled={!agreedToTerms || sending} className={`${agreedToTerms?'':'disabled'}`}>{sending ?'Sending...':'Get the link'}</button>
                </form>
            </div>
        </div>
    );
    
};

export default LeadModal;
