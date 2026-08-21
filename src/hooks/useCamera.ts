import { useCallback, useEffect, useRef, useState } from "react";

const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageCaptureRef = useRef<ImageCapture | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (!window.isSecureContext) {
        setError("Kamerą naudoti galima tik per HTTPS");
        return;
      }
      console.log("HERE");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;

      // Set up ImageCapture for high-res photos
      const track = stream.getVideoTracks()[0];
      if (typeof ImageCapture !== "undefined") {
        imageCaptureRef.current = new ImageCapture(track);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsActive(true);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError(
          "Nebuvo suteiktas leidimas naudoti kamerą. Patikrinkite naršyklės nustatymus",
        );
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("Kamera nerasta šiame įrenginyje");
      } else {
        setError("Nepavyko pajungti kameros");
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    imageCaptureRef.current = null;
    setIsActive(false);
  }, []);

  /** Take a full-resolution photo using ImageCapture API, fallback to canvas */
  const takePhoto = useCallback(async (): Promise<ImageData | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isActive) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Try ImageCapture API for max resolution (not available on iOS Safari)
    if (imageCaptureRef.current) {
      try {
        const bitmap = await imageCaptureRef.current.grabFrame();
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();

        // Crop ROI: 80% width, 25% height, centered
        const roiWidth = canvas.width * 0.8;
        const roiHeight = canvas.height * 0.25;
        const roiX = (canvas.width - roiWidth) / 2;
        const roiY = (canvas.height - roiHeight) / 2;
        return ctx.getImageData(roiX, roiY, roiWidth, roiHeight);
      } catch {
        // Fall through to canvas fallback
      }
    }

    // Fallback: capture from video element
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const roiWidth = canvas.width * 0.8;
    const roiHeight = canvas.height * 0.25;
    const roiX = (canvas.width - roiWidth) / 2;
    const roiY = (canvas.height - roiHeight) / 2;
    return ctx.getImageData(roiX, roiY, roiWidth, roiHeight);
  }, [isActive]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    takePhoto,
  };
};

export default useCamera;
