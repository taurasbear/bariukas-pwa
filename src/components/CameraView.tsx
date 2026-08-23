import useCamera from "@/hooks/useCamera";
import useOcr from "@/hooks/useOCR";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const CameraView = () => {
  const {
    videoRef,
    canvasRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    takePhoto,
  } = useCamera();

  const {
    lastResult,
    status,
    ocrIsReady,
    error: ocrError,
    initializeOcrEngine,
    runOcr,
  } = useOcr();

  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    initializeOcrEngine();
  }, [startCamera, initializeOcrEngine]);

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      console.log("taking a picture!");
      const frame = await takePhoto();
      if (!frame) return;
      const blob = await new Promise<Blob>((res) =>
        canvasRef.current!.toBlob(res!, "image/png")!,
      );
      const file = new File([blob], "image.png");
      await runOcr({ imageFile: file });
    } finally {
      console.log("FINALLY");
      setIsCapturing(false);
    }
  };
  return (
    <div className="">
      <div className="bg-secondary absolute left-1/2 mt-8 -translate-x-1/2 rounded-2xl">
        <p className="text-borde text-center text-black">{error ?? status}</p>
      </div>

      <video ref={videoRef} />
      <canvas ref={canvasRef} />
      <Button
        size="lg"
        disabled={isCapturing && !isActive && !ocrIsReady}
        onClick={handleCapture}
        className="absolute bottom-8 left-1/2 size-16 -translate-x-1/2 rounded-full border-6 border-gray-700 bg-white shadow-md shadow-black"
      ></Button>
    </div>
  );
};

export default CameraView;
