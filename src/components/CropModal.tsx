import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import { Area } from 'react-easy-crop';

interface CropModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedAreaPixels: Area) => void;
}

const CropModal: React.FC<CropModalProps> = ({ imageSrc, isOpen, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const onCropCompleteHandler = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = () => {
    if (croppedAreaPixels) {
      console.log(croppedAreaPixels);
      onCropComplete(croppedAreaPixels);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Crop Modal">
      <div style={{ position: 'relative', width: "400px", height: "400px" }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3} // Change the aspect ratio as needed
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteHandler}
        />
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleCrop}>Crop</button>
      </div>
    </Modal>
  );
};

export default CropModal;