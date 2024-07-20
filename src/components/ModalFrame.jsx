import React, { useEffect, useState } from 'react';
import '../css/FrameModal.css';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardHeader, CardBody, CardFooter, Image} from "@nextui-org/react";

function FrameModal({ modalIsOpen, closeModal, handleBuy, xBlocks, yBlocks, blockSize }) {  

  const [sending, setSending] = useState(false);
  const [skeep, setSkeep] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);


  const list = [
    {
      title: "Black",
      name: "black",
      img: "woodxel-resources/images/black_view2.png",
      description: "Floating Black frame of 1\" Depth. A timeless elegance that frames the work with depth and sophistication.",
    },
    {
      title: "White",
      name: "white",
      img: "woodxel-resources/images/white_view2.png",
      description: "Floating White frame of 1\" Depth. Clean lines and a crisp, fresh finish for a sophisticated, contemporary look.",
    },
    {
      title: "Natural",
      name: "natural",
      img: "woodxel-resources/images/natural_view2.png",
      description: "Floating Natural Wood frame of 1\" Depth. Warmth and organic texture that complements and accentuates your masterpiece.",
    }
  ];

  const calculateFramePrice =() =>{
    let formula = ((xBlocks * 2 + yBlocks * 2) * blockSize )/ 12 * 50; 
    return Math.floor(formula*100)/100;
  }

  function handleSubmit(event) {
    setSending(true);
    handleBuy(event, calculateFramePrice(), list[currentIndex].name);
  }

  function handleSkeep(event) {
    setSkeep(true);
    handleBuy(event, 0, 'not');
  }

  const handleCloseModal = () => {
    setSending(false);
    setSkeep(false);
    closeModal();
    }
    

  return (
    <>
    <Modal 
        isOpen={modalIsOpen}
        onClose={handleCloseModal}
        placement="top-center"
        isDismissable={false}
        hideCloseButton={true}
        radius='sm'
      >
        <ModalContent className='mx-3'>          
            <>
              <ModalHeader className="flex flex-col gap-1">Select the Perfect Frame for Your Artwork</ModalHeader>
              <ModalBody>
                <> 
                  <div className="flex flex-row">
                          <div className="basis-1/3 p-1 rounded-md">
                            <div className='bg-zinc-200 rounded-md'>
                              <Image                             
                              className={`cursor-pointer ${currentIndex === 0? "selected_img": "" }`}
                              radius='sm'                            
                              removeWrapper
                              alt="Frame"                            
                              src={list[0].img}
                              onClick={() => setCurrentIndex(0)}
                              />
                            </div>
                            
                          </div>
                          <div className="basis-1/3 p-1 rounded-md">
                          <div className='bg-zinc-200 rounded-md'>
                            <Image
                              className={`cursor-pointer ${currentIndex === 1? "selected_img": "" }`}
                              radius='sm'                              
                              removeWrapper
                              alt="Frame"                              
                              src={list[1].img}
                              onClick={() => setCurrentIndex(1)}
                              />
                          </div>
                          </div>
                          <div className="basis-1/3 p-1 rounded-md">
                          <div className='bg-zinc-200 rounded-md'>
                            <Image
                              className={`cursor-pointer ${currentIndex === 2? "selected_img": "" }`}
                              radius='sm'                              
                              removeWrapper
                              alt="Frame"                              
                              src={list[2].img}
                              onClick={() => setCurrentIndex(2)} 
                              />
                          </div>
                          </div>
                          
                  </div>
                  <div>{list[currentIndex].description}</div>             
                </>  
                                                   
              </ModalBody>                
              <ModalFooter>                
                <Button isDisabled={skeep || sending} isLoading={skeep} radius="sm" color="default" onClick={handleSkeep} >
                    Skip Frame Selection
                </Button>
                <Button radius='sm' isDisabled={skeep || sending} isLoading={sending} color="primary"  onClick={handleSubmit}>
                  {"Add $" + calculateFramePrice()}
                </Button>
              </ModalFooter>              
            </>
        
        </ModalContent>
      </Modal>  
    </>
    
  );
}



export default FrameModal;
