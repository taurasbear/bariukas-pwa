import useCamera from "@/hooks/useCamera";
import { useEffect, useRef, useState } from "react";
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

  const [isCapturing, setIsCapturing] = useState(false);

  const tempCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  console.log("isCapturing:", isCapturing);
  console.log("isActive:", isActive);
  console.log("error:", error);

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const frame = await takePhoto();
      if (!frame) return;

      if (tempCanvas.current) {
        const ctx = tempCanvas.current.getContext("2d");
        ctx?.putImageData(frame, 150, 150);
      }
    } finally {
      setIsCapturing(false);
    }
  };
  return (
    <div>
      <video ref={videoRef} />
      <canvas ref={canvasRef} />
      <div>
        <Button
          size="lg"
          disabled={isCapturing && !isActive}
          onClick={handleCapture}
        >
          CLICK ME
        </Button>
      </div>
      <div>
        <canvas ref={tempCanvas} />
      </div>
    </div>
  );
};

export default CameraView;
