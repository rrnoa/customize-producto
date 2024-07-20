import React, { useState } from 'react';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link} from "@nextui-org/react";
import {TermsContent} from '../components/TermsContent';



const ModalDownload = ({ isModalOpen, closeModal, compressModel }) => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
      });

      const [sending, setSending] = useState(false);
    
      const [terms, setTerms] = useState(false);

      const [openHere, setOpenHere] = useState(true);
    
      const [errors, setErrors] = useState({});

      const handleCloseModal = () => {
        setTerms(false);
        closeModal();
      }

      function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value,
        }));
      }

      function handleSubmit(e) {
        e.preventDefault();
        setSending(true);    
        enviarFormulario(formData, compressModel);
      }

      function enviarFormulario(datos, compressModel) {

        const formData = new FormData();

        for (const key in datos) {
          if (datos.hasOwnProperty(key)) {
              formData.append(key, datos[key]);
          }
        }  
        fetch('https://woodxel.com/wp-json/pixel-it/send-lead/', {
        //fetch('https://lignumcd.local/wp-json/pixel-it/send-lead/', {
          method: 'POST',     
          body: formData,
        })
        .then(response => {
          if (!response.ok) {
            // Si el servidor responde, pero con un código de estado HTTP que indica un error (como 404 o 500),
            // lanzamos un error que será capturado por el bloque .catch()
            throw new Error('Network response was not ok: ' + response.statusText);
          }
          else {
            compressModel();
            setSending(false);
            closeModal();
          }
          return response.json();
        })
        .catch((error) => {
          alert('Connection error. Restart the application.');
          setSending(false);
          console.error('Error:', error);
        });
      }


  return (
    <>
    <Modal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        placement="top-center"
        radius='sm'

      >
        <ModalContent className='mx-3'>          
            <>
              <ModalHeader className="flex flex-col gap-1">{!terms?"Get your FREE 3D model": "Terms and Conditions"}</ModalHeader>
              <form onSubmit={handleSubmit}>

              <ModalBody>
              { !terms && <>
              
              <p>Once you submit this form, your 3D model will download automatically as a ZIP file containing your GLTF model. The &lsquo;.zip&lsquo; extension will be preserved automatically. Enjoy your model!</p>
                
                <Input
                  autoFocus
                  label="Name"
                  placeholder="Enter your name"
                  variant="bordered"
                  name="name"
                  isRequired={true}
                  value={formData.name}
                  onChange={handleInputChange}
                />

                <Input
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  variant="bordered"
                  name="email"
                  isRequired={true}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Input                  
                  label="Company"
                  placeholder="Enter your company name"
                  variant="bordered"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
                <div className="flex py-2 px-1">
                  <Checkbox
                  radius='sm'
                  isRequired={true}
                    classNames={{
                      label: "text-small",
                    }}
                  >
                    I have read and consent to the&nbsp;
                    <span><Link color="primary" onClick={(e) => { e.preventDefault(); setTerms(true); }  } href="#" size="sm">Terms of Use *
                  </Link></span>
                  </Checkbox>                  
                  
                </div> </>}

                {terms && 
                <div className="terms-and-conditions" style={{height:'70vh', maxHeight: '500px', overflowY: 'scroll'}} dangerouslySetInnerHTML={{ __html: TermsContent }}>
                </div>
                }
              </ModalBody>
              <ModalFooter>
                {!terms ? 
                <Button radius='sm' color="primary" type="submit" isLoading={sending}>
                  Download Now
                </Button>:
                <Button radius='sm' color="primary" onClick={()=> setTerms(false)}>
                I have read Terms and Conditions
                </Button>
                }
              </ModalFooter>
              </form>
            </>
        
        </ModalContent>
      </Modal>      
    </>
  );
};

export default ModalDownload;
