import React, { useState } from 'react';
import Modal from 'react-modal';
import './modal.css';


const AgeVerificationModal = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Open by default

  const handleConfirm = () => {
    if (isChecked) {
      setIsOpen(false); // Close the modal after confirmation
   //   console.log(isChecked,isOpen)
    } else {
      alert('You must confirm that you are over 18 years old.');
    }
  };

  const handleDecline = () => {
    alert('You must 18 years old to use our site.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      contentLabel="Age Verification"
      shouldCloseOnOverlayClick={false} // Prevent closing on overlay click
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2 id='ageTitle'>Age Verification</h2>
      <p id='ageque'>Are you 18 years old or older?</p>
      <div className='verifyCon'>
        <input
          type="checkbox"
          id="confirmAge"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        />
        <label htmlFor="confirmAge"  id='confirm'>Yes, I am over 18 years old</label>
      </div>
      <div>
        <button className="verifybtn" id="yebtn" onClick={handleConfirm}>Yes</button>
        <button className="verifybtn" id="nobtn" onClick={handleDecline}>No</button>
      </div>
    </Modal>
  );
};

export default AgeVerificationModal;
