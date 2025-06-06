import React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

const DetailModal = ({ isOpen, toggle, content, title, primaryAction, primaryActionText, showPrimaryAction }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} style={{maxWidth: '150vh'}}>
      <div className="modal-header justify-content-center">
        <button type="button" className="close" aria-label="Close" onClick={toggle}>
          <span aria-hidden="true">×</span>
        </button>
        <h5 className="modal-title">{title || 'Default Title'}</h5>
      </div>
      <ModalBody>{content || <p>No content provided.</p>}</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
        {showPrimaryAction && primaryAction && (
          <Button color="primary" onClick={primaryAction}>
            {primaryActionText || 'Save changes'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default DetailModal;
