"use client";

// import Image from "nexst/image";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useCallback, useEffect } from "react";
import cv from "@techstark/opencv-js";
import { CropModal } from "@/components";
import { Area } from "react-easy-crop";

export default function HomeContainer() {
  const [file, setFile] = useState<File | null | string>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const grayImgRef = useRef<HTMLCanvasElement | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [croppedImage, setCroppedImage] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.[0]) {
        setFile(URL.createObjectURL(event?.target.files?.[0]));
      }
    },
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Mengatur batas ukuran maksimum 2 MB (2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      const chooseImage = e.target.files?.[0];
      if (chooseImage && chooseImage.size > maxSize) {
        setErrMsg("Image size must be less than 2 MB.");
        return;
      }

      if (e.target.files && e.target.files[0]) {
        handleImageUpload(e);
      }
    },
    [handleImageUpload]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Check if there are files in the drop event
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Extract the files from the drop event
      const fileList = e.dataTransfer.files;

      // Create a synthetic `ChangeEvent` object
      const syntheticEvent = {
        target: {
          files: fileList,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      // Call `handleImageUpload` with the synthetic event
      handleImageUpload(syntheticEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleProcessImage = useCallback(async () => {
    const canvas = document.createElement("canvas");
    const uploadedImage = file;
    if (uploadedImage) {
      // Read the file as a Data URL
      const dataUrl = uploadedImage as string;

      // Create an HTML image element to load the Data URL
      const imageData = new Image();
      imageData.src = dataUrl as string;

      imageData.onload = () => {
        canvas.width = imageData.width;
        canvas.height = imageData.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(imageData, 0, 0);

        // Convert canvas data to ImageData
        const imageResult = ctx?.getImageData(
          0,
          0,
          imageData.width,
          imageData?.height
        );

        // Create OpenCV Mat from ImageData
        const imageProcessing = cv.matFromImageData(imageResult as ImageData);
        const rect = new cv.Rect(
          croppedImage?.x as number,
          croppedImage?.y as number,
          croppedImage?.width as number,
          croppedImage?.height as number
        );
        // Crop the image
        const cropImage = imageProcessing.roi(rect);
        // to gray scale
        const imgGray = new cv.Mat();
        cv.cvtColor(cropImage, imgGray, cv.COLOR_BGR2GRAY);
        console.log(imgGray);
        cv.imshow(grayImgRef.current as HTMLCanvasElement, imgGray);
        // window.imgGray = imgGray;

        imgGray.delete();
      };
    }
  }, [croppedImage, file]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCropComplete = useCallback((croppedAreaPixels: Area) => {
    setCroppedImage(croppedAreaPixels);
    // You can use croppedAreaPixels to get the cropped image as per your requirement
  }, []);

  useEffect(() => {
    if (!file) return;
    handleOpenModal();
  }, [file, handleOpenModal]);

  useEffect(() => {
    if (!croppedImage) return;
    handleProcessImage();
  }, [croppedImage, handleProcessImage]);

  const handleDownload = () => {
    if (grayImgRef.current) {
      const dataUrl = grayImgRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "processed_image.png";
      link.click();
    }
  };

  return (
    <div className="mx-auto px-4">
      <main>
        <h1 className="text-center text-2xl">OPENCV Image Uploader</h1>
        <section className="lg:w-[400px] md:w-[400px] sm:w-full mx-auto mt-4">
          <form>
            <div>
              <CropModal
                imageSrc={file as string}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onCropComplete={handleCropComplete}
              />
              <div className="col-span-full">
                <label
                  htmlFor="cover-photo"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Image
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 relative lg:w-[400px] md:w-[400px] sm:w-full h-[200px]"
                >
                  <div className="text-center">
                    <PhotoIcon
                      aria-hidden="true"
                      className="mx-auto h-12 w-12 text-gray-300"
                    />
                    {!file ? (
                      <>
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              onChange={handleFileChange}
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">
                          PNG, JPG to 2MB
                        </p>
                      </>
                    ) : (
                      <span>Uploaded</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-red-500">{errMsg}</p>
            </div>
          </form>
          <div className="flex">
            <button
              onClick={handleDownload}
              type="submit"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 mt-4 ml-auto"
            >
              Download
            </button>
          </div>
        </section>
        <section className="w-[400px] mx-auto mt-4">
          <div>
            {croppedImage && file && (
              <>
                <div style={{ margin: "10px" }}>Original </div>
                <div className="w-[400px] h-[200px] overflow-scroll">
                  <img src={file as string} alt="filtering" />
                </div>
              </>
            )}
          </div>
          {croppedImage && <div style={{ margin: "10px" }}>After</div>}
          <div className="w-[400px] h-[200px] overflow-scroll">
            <canvas ref={grayImgRef} />
          </div>
        </section>
      </main>
    </div>
  );
}
