import React, {useState, useEffect, createRef, Fragment} from 'react';
import Modal from 'react-modal';
import BrButton from "./BrButton";

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '8px 8px 0 0',
      padding: 0
    },
    overlay: {zIndex: 999}
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

function BrModal(props) {
    const modalState = props.modalState;
    const setModalState = props.setModalState;
    const handleAccept = props.handleAccept;
 
    function afterOpenModal() {
      // references are now sync'd and can be accessed.
    }
 
    function closeModal() {
      setModalState({ ...modalState, open: false });
    }

    return (
      <Modal
        isOpen={modalState.open}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Aqua Explore Modal"
      >
        <div className="br-modal-title">
          <h2 className="br-modal-heading">{modalState.title}</h2>
          <div className="br-modal-close">
            <AqexButton label={<i className="fas fa-times-circle" />} className="br-button br-icon-button" 
                        onClick={closeModal} />
          </div>
        </div>
        <div className="br-modal-panel">
          <div className="br-modal-content>">
            {modalState.content}
          </div>

          {!modalState.hideButtons &&
            <div className="br-modal-buttons">
              { modalState.closeBtnText &&
                <button className="br-modal-button br-button" onClick={closeModal}>{modalState.closeBtnText || 'Close'}</button>
              }
              { modalState.acceptBtnText &&
                <button className="br-modal-button br-button" onClick={handleAccept}>{modalState.acceptBtnText}</button>
              }
            </div>
          }

        </div>
      </Modal>
    );
}

export default BrModal;