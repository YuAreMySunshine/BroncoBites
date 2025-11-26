import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fullScreenOnMobile?: boolean;
}

export function Modal({ isOpen, onClose, title, children, fullScreenOnMobile = true }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`modal ${fullScreenOnMobile ? 'modal--full-mobile' : ''}`}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
