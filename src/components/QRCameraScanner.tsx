import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, RefreshCw, AlertCircle, Upload, RotateCcw, Check, Sparkles, Video, VideoOff } from 'lucide-react';

interface QRCameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isActive: boolean;
}

export const QRCameraScanner: React.FC<QRCameraScannerProps> = ({ onScanSuccess, isActive }) => {
  const [scannerStarted, setScannerStarted] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const isHandlingScanRef = useRef<boolean>(false);
  const onScanSuccessRef = useRef(onScanSuccess);
  const isMountedRef = useRef<boolean>(true);
  const isActiveRef = useRef<boolean>(isActive);

  // Serialized operation queue to prevent "already under transition" error
  const transitionLockRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const queueOperation = useCallback((operation: () => Promise<void>) => {
    transitionLockRef.current = transitionLockRef.current
      .then(operation)
      .catch((err) => {
        console.warn('Queue operation caught error:', err);
      });
    return transitionLockRef.current;
  }, []);

  // Request browser camera permissions explicitly if not yet granted
  const requestCameraPermission = async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Browser ini tidak mendukung akses kamera (WebRTC tidak tersedia).');
      return false;
    }

    try {
      setPermissionRequested(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      // Stop the test tracks immediately
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err: any) {
      console.warn('getUserMedia facingMode environment failed, trying any video stream...', err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch (innerErr: any) {
        console.error('Kamera ditolak atau tidak tersedia:', innerErr);
        if (innerErr.name === 'NotAllowedError' || innerErr.name === 'PermissionDeniedError') {
          setErrorMessage('Izin kamera ditolak di browser. Silakan izinkan akses kamera pada ikon gembok di address bar.');
        } else if (innerErr.name === 'NotFoundError' || innerErr.name === 'DevicesNotFoundError') {
          setErrorMessage('Kamera tidak ditemukan pada perangkat ini. Anda dapat mengunggah file foto QR atau memilih simulasi.');
        } else {
          setErrorMessage(`Gagal mengakses kamera: ${innerErr.message || 'Perangkat kamera sibuk atau tidak dapat dibuka.'}`);
        }
        return false;
      }
    }
  };

  // Enumerate cameras
  const refreshCameras = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const formatted = devices.map((d, index) => ({
          id: d.id,
          label: d.label || `Kamera ${index + 1}`,
        }));
        setCameras(formatted);

        // Auto select rear camera if none selected
        if (!selectedCameraId) {
          const rear = formatted.find((c) =>
            /back|rear|environment|belakang/i.test(c.label)
          );
          if (rear) {
            setSelectedCameraId(rear.id);
          } else {
            setSelectedCameraId(formatted[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Html5Qrcode.getCameras error:', err);
    }
  }, [selectedCameraId]);

  // Main lifecycle effect for starting and stopping the camera scanner
  useEffect(() => {
    isMountedRef.current = true;
    const containerId = 'reader-camera-stream';

    if (!isActive) {
      // Stop scanner gracefully if inactive
      queueOperation(async () => {
        const scanner = scannerInstanceRef.current;
        if (scanner) {
          try {
            if (scanner.isScanning) {
              await scanner.stop();
            }
          } catch (e) {
            console.warn('Error stopping scanner:', e);
          }
          try {
            scanner.clear();
          } catch (e) {
            console.warn('Error clearing container:', e);
          }
          scannerInstanceRef.current = null;
        }
        if (isMountedRef.current) {
          setScannerStarted(false);
          setIsInitializing(false);
        }
      });
      return;
    }

    // Start scanner sequentially
    queueOperation(async () => {
      if (!isMountedRef.current || !isActiveRef.current) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      if (isMountedRef.current) {
        setIsInitializing(true);
        setErrorMessage(null);
      }

      // Check camera permission first
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        if (isMountedRef.current) {
          setIsInitializing(false);
          setScannerStarted(false);
        }
        return;
      }

      // Refresh camera list now that permission is confirmed
      await refreshCameras();

      // Clean up previous instance if any
      if (scannerInstanceRef.current) {
        try {
          if (scannerInstanceRef.current.isScanning) {
            await scannerInstanceRef.current.stop();
          }
          scannerInstanceRef.current.clear();
        } catch (e) {
          console.warn('Cleanup error before new instance:', e);
        }
        scannerInstanceRef.current = null;
      }

      // Create brand new Html5Qrcode instance
      const scanner = new Html5Qrcode(containerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerInstanceRef.current = scanner;

      const config = {
        fps: 12,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
      };

      const handleSuccess = (decodedText: string) => {
        if (isHandlingScanRef.current) return;
        isHandlingScanRef.current = true;
        onScanSuccessRef.current(decodedText);

        setTimeout(() => {
          isHandlingScanRef.current = false;
        }, 1800);
      };

      const handleTick = () => {};

      // Fallback sequence to guarantee camera activation across PC, Mac, Android, and iOS
      let started = false;

      // 1. Try selectedCameraId if specified
      if (selectedCameraId) {
        try {
          await scanner.start(selectedCameraId, config, handleSuccess, handleTick);
          started = true;
        } catch (err: any) {
          console.warn('Start with selectedCameraId failed, trying fallbacks...', err);
        }
      }

      // 2. Try rear/environment camera
      if (!started) {
        try {
          await scanner.start({ facingMode: 'environment' }, config, handleSuccess, handleTick);
          started = true;
        } catch (err: any) {
          console.warn('Start with facingMode environment failed, trying user camera...', err);
        }
      }

      // 3. Try front/user camera (essential for PC/Laptop webcams!)
      if (!started) {
        try {
          await scanner.start({ facingMode: 'user' }, config, handleSuccess, handleTick);
          started = true;
        } catch (err: any) {
          console.warn('Start with facingMode user failed, trying any device ID...', err);
        }
      }

      // 4. Try any available camera device from list
      if (!started) {
        try {
          const devs = await Html5Qrcode.getCameras();
          if (devs && devs.length > 0) {
            await scanner.start(devs[0].id, config, handleSuccess, handleTick);
            started = true;
          }
        } catch (err: any) {
          console.warn('Start with first camera device failed:', err);
        }
      }

      if (isMountedRef.current) {
        setIsInitializing(false);
        if (started) {
          setScannerStarted(true);
          setErrorMessage(null);
        } else {
          setScannerStarted(false);
          setErrorMessage('Tidak dapat membuka kamera. Pastikan kamera tidak sedang dipakai aplikasi lain (Zoom/Meet) atau coba unggah foto QR.');
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      queueOperation(async () => {
        const scanner = scannerInstanceRef.current;
        if (scanner) {
          try {
            if (scanner.isScanning) {
              await scanner.stop();
            }
          } catch (e) {
            console.warn('Unmount stop error:', e);
          }
          try {
            scanner.clear();
          } catch (e) {
            console.warn('Unmount clear error:', e);
          }
          scannerInstanceRef.current = null;
        }
      });
    };
  }, [isActive, selectedCameraId, retryTrigger, queueOperation, refreshCameras]);

  // Handle image file upload for QR scanning
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('file-scanner-temp');
      const decodedResult = await html5QrCode.scanFile(file, true);
      onScanSuccessRef.current(decodedResult);
      html5QrCode.clear();
      e.target.value = '';
    } catch {
      setErrorMessage('QR Code tidak terdeteksi pada gambar yang diunggah. Pastikan gambar jelas dan tidak buram.');
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setRetryTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Hidden container for file scan */}
      <div id="file-scanner-temp" className="hidden" />

      {/* Main scanner container */}
      <div className="relative w-full aspect-square max-w-[340px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center">
        {/* Stream container rendered by Html5Qrcode */}
        <div
          id="reader-camera-stream"
          className="w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>video]:rounded-xl"
        />

        {/* Viewfinder Target Overlay when camera is actively streaming */}
        {isActive && scannerStarted && !errorMessage && !isInitializing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-60 h-60 border-2 border-indigo-400/80 rounded-2xl shadow-xl">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />

              {/* Animated Laser Scanning Line */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line shadow-[0_0_12px_#34d399]" />
            </div>

            <div className="absolute bottom-4 bg-slate-950/80 backdrop-blur-xs border border-slate-700 text-slate-200 text-[11px] font-medium px-3 py-1 rounded-full">
              Posisikan QR Code di dalam kotak
            </div>
          </div>
        )}

        {/* Initializing / Loading state */}
        {isActive && isInitializing && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-3" />
            <h4 className="text-sm font-bold text-white">Menghubungkan Kamera...</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Menyiapkan sensor pemindai QR Code sekolah
            </p>
          </div>
        )}

        {/* Inactive or Error State */}
        {(!isActive || !scannerStarted || errorMessage) && !isInitializing && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400 z-10">
            {errorMessage ? (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Kamera Belum Aktif</h4>
                <p className="text-xs text-slate-300 mb-4 max-w-[260px] leading-relaxed">
                  {errorMessage}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Coba Sambungkan Kamera</span>
                  </button>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Unggah Foto QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-300">Kamera Siap</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Klik tombol di bawah untuk menyalakan kamera QR
                </p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span>Aktifkan Kamera Sekarang</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Camera switcher & Controls */}
      <div className="w-full max-w-[340px] mt-3 flex items-center justify-between text-xs text-slate-400 gap-2">
        {cameras.length > 0 && (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-indigo-500 w-full truncate"
              title="Pilih Kamera"
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors shrink-0">
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Upload File</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
