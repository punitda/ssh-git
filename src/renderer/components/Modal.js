import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

function Modal({
  buttonRef,
  triggerText,
  buttonClassName,
  role,
  ariaLabel,
  children,
  onModalClose,
  onModalOpen,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    document.querySelector('html').classList.toggle('u-lock-scroll');
    if (isOpen) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  function onOpen() {
    setIsOpen(true);
    onModalOpen();
  }

  function onClose() {
    setIsOpen(false);
    onModalClose();
  }

  const onKeyDown = event => event.keyCode === 27 && onClose();

  const onClickAway = event => {
    if (modalRef.current && modalRef.current.contains(event.target)) return;
    onClose();
  };

  return (
    <>
      <ModalTrigger
        text={triggerText}
        buttonClassName={buttonClassName}
        onOpen={onOpen}
        buttonRef={buttonRef}
      />

      {isOpen && (
        <ModalContent
          content={children}
          role={role}
          onClose={onClose}
          ariaLabel={ariaLabel}
          onKeyDown={onKeyDown}
          onClickAway={onClickAway}
          modalRef={modalRef}
          closeButtonRef={closeButtonRef}
        />
      )}
    </>
  );
}

const ModalTrigger = ({ text, buttonClassName, onOpen, buttonRef }) => (
  <button className={buttonClassName} onClick={onOpen} ref={buttonRef}>
    {text}
  </button>
);

const ModalContent = ({
  content,
  onClose,
  role = 'dialog',
  ariaLabel,
  onKeyDown,
  modalRef,
  onClickAway,
  closeButtonRef,
}) => {
  return createPortal(
    <aside
      aria-modal="true"
      tabIndex="-1"
      role={role}
      aria-label={ariaLabel}
      className="c-modal-cover"
      onKeyDown={onKeyDown}
      onClick={onClickAway}>
      <div className="c-modal" ref={modalRef}>
        <button
          className="c-modal__close"
          aria-labelledby="close-modal"
          onClick={onClose}
          ref={closeButtonRef}>
          <span className="u-hide-visually" id="close-modal">
            Close
          </span>
          <svg className="c-modal__close-icon" viewBox="0 0 40 40">
            <path d="M 10,10 L 30,30 M 30,10 L 10,30"></path>
          </svg>
        </button>
        <div className="pt-4">{content}</div>
      </div>
    </aside>,
    document.body
  );
};
export default Modal;
