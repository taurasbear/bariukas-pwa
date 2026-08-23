import type { OcrResult } from "@paddleocr/paddleocr-js";
import { PaddleOCR } from "@paddleocr/paddleocr-js";
import { useCallback, useRef, useState } from "react";

const ORT_WASM_PATHS = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";
type OcrEngine = Awaited<ReturnType<typeof PaddleOCR.create>>;

const useOcr = () => {
  const lastResult = useRef<OcrResult | null>(null);
  const ocr = useRef<OcrEngine | null>(null);
  const [ocrIsReady, setOcrIsReady] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getDemoThreadCount = (): number => {
    return self.crossOriginIsolated
      ? Math.min(4, Math.max(1, (navigator.hardwareConcurrency || 2) - 1))
      : 1;
  };

  const initializeOcrEngine = useCallback(async () => {
    setOcrIsReady(false);
    setStatus("Ruošiamas teksto atpažinimo variklis");
    try {
      if (ocr.current) {
        await ocr.current.dispose();
      }

      ocr.current = await PaddleOCR.create({
        initialize: false,
        worker: false,
        textDetectionModelName: "PP-OCRv6_tiny_det",
        textRecognitionModelName: "PP-OCRv6_tiny_rec",
        ortOptions: {
          backend: "auto",
          wasmPaths: ORT_WASM_PATHS,
          numThreads: getDemoThreadCount(),
          simd: true,
        },
      });

      await ocr.current.initialize();
      console.log("OCR initialized");
      setStatus(null);
      setOcrIsReady(true);
    } catch (err) {
      console.log(err);
      setStatus(null);
      setError("Nepavyko paruošti teksto atpažinimo variklio");
    }
  }, []);

  const runOcr = async ({ imageFile }: { imageFile: File }): Promise<void> => {
    if (!ocrIsReady || !ocr.current) {
      setStatus("Laukiama, kol teksto atpažinimo variklis bus paruoštas");
      return;
    }

    try {
      setStatus("Atpažinamas tekstas...");
      const result: OcrResult = (await ocr.current.predict(imageFile))[0];
      console.log("OCR result: ", result);
      setStatus(
        `Atpažintos: ${String(result.metrics.recognizedCount)} teksto eilutės.`,
      );
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      setStatus(null);
      setError(`Teksto atpažinimo klaida: ${message}`);
    }
  };

  return {
    lastResult,
    ocrIsReady,
    status,
    error,
    initializeOcrEngine,
    runOcr,
  };
};

export default useOcr;
