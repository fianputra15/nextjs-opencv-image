"use client";

// import Image from "nexst/image";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useEffect, useCallback } from "react";
import cv from "@techstark/opencv-js";
import { CropModal } from "@/components";
import { Area } from "react-easy-crop";
// import { detectHaarFace } from "./helpers/processImage";

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

  const handleProcessImage = async (imgSrc: HTMLImageElement) => {
    const img = cv.imread(imgSrc);
    // window.img = img;
    // to crop image
    // Define the cropping rectangle
    console.log(croppedImage, 'cropped');
    const rect = new cv.Rect(
      croppedImage?.x as number,
      croppedImage?.y as number,
      croppedImage?.width as number,
      croppedImage?.height as number
    );
    // Crop the image
    const cropImage = img.roi(rect);
    // to gray scale
    const imgGray = new cv.Mat();
    cv.cvtColor(cropImage, imgGray, cv.COLOR_BGR2GRAY);
    cv.imshow(grayImgRef.current as HTMLCanvasElement, imgGray);
    // window.imgGray = imgGray;

    imgGray.delete();
  }
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

  return (
    <div className="mx-auto px-4">
      <main className="">
        <h1 className="text-center text-2xl">OPENCV Image Uploader</h1>
        <section className="lg:w-[400px] sm:w-full mx-auto mt-4">
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
                  className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 relative lg:w-[400px] sm:w-full h-[200px]"
                >
                  {/* {croppedImage && (
                    <img
                      className="opacity-30 object-cover"
                      src={file}
                      alt={file?.name ?? ""}
                    />
                  )} */}

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
        </section>
        <section className="w-[400px] mx-auto mt-4">
          <h3>Result</h3>
          <div>
            <div style={{ margin: "10px" }}>Original </div>
            {croppedImage && file && (
              <div className="w-[400px] h-[400px] relative">
                <img
                  src={file as string}
                  onLoad={
                    (e: React.SyntheticEvent<HTMLImageElement, Event>) =>
                      handleProcessImage(e.currentTarget)
                  }
                  alt="filtering"
                />
              </div>
            )}
          </div>
          <div>
            <div style={{ margin: "10px" }}>After</div>
            <canvas ref={grayImgRef} />
          </div>
          <div className="flex">
            <button
              type="submit"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 mt-4 ml-auto"
            >
              Download
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
