"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
  onDetected: (code: string) => void;
  onClose: () => void;
}

const ELEMENT_ID = "barcode-scanner-region";

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(ELEMENT_ID);
    scannerRef.current = scanner;
    let stopped = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          if (!stopped) {
            stopped = true;
            onDetected(decodedText);
          }
        },
        () => {
          // ignora frames sem leitura
        }
      )
      .catch(() => {
        // Câmera indisponível ou permissão negada.
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-walnut-950/95 p-4">
      <p className="text-sm text-parchment/70">
        Aponte a câmera para o código de barras do disco
      </p>
      <div
        id={ELEMENT_ID}
        className="w-full max-w-sm overflow-hidden rounded-lg border border-walnut-700"
      />
      <button
        onClick={onClose}
        className="rounded-md border border-walnut-700 px-4 py-2 text-sm text-parchment hover:bg-walnut-800"
      >
        Cancelar
      </button>
    </div>
  );
}
