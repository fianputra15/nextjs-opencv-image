import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Modal from "react-modal";
import { Area } from "react-easy-crop";
import { Button } from "@/components";
import { ScissorsIcon } from "@heroicons/react/24/solid";

interface CropModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedAreaPixels: Area) => void;
}

const CropModal: React.FC<CropModalProps> = ({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
}) => {
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
    (cropppedArea: Area, croppedAreaPixels: Area) => {
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
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Crop Modal"
      className="crop-modal lg:w-[600px] md:w-[600px] sm:w-11/12"
    >
      <div style={{ position: "relative", width: "auto", height: "400px" }}>
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
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="text" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button
          variant="fill"
          onClick={handleCrop}
          type="button"
          className="bg-gray-900 hover:bg-gray-950  flex gap-2 items-center"
        >
          <ScissorsIcon
            aria-hidden="true"
            className="mx-auto h-4 w-4 text-gray-300"
          />{" "}
          Crop
        </Button>
      </div>
    </Modal>
  );
};

export default CropModal;
