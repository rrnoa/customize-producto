import React, { useRef, useState } from 'react'
import LeadModal from './LeadModal.jsx';


const Export3d = ({exportGroup, currentStep}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	
	function closeModal() {
		setIsModalOpen(false);
	}
    
	const onclickHandler = (event) => {
        event.preventDefault();
		setIsModalOpen(true);
    }	

  return (
	<>	 
		<button style={{marginLeft: '20px'}} id="woodxel_panel_3d" className={`ut-btn button eut-btn-alt ${currentStep == 1 || currentStep == 2 ? 'disabled' : ''}`} onClick={onclickHandler}>			
			Get Your 3D Model         
		</button>
		<LeadModal isOpen={isModalOpen} onClose={closeModal} exportGroup={exportGroup}/>
	</>	
  )
}

//Export3d.propTypes = {}

export default Export3d