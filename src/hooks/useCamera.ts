import { useCallback, useRef, useState } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attachStream = useCallback(async (stream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return false;

    video.srcObject = stream;
    try {
      await video.play();
      setReady(true);
      return true;
    } catch {
      setError('Could not start video preview.');
      setReady(false);
      return false;
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Camera requires HTTPS or localhost. Use attach photos instead.',
      );
      return;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      await attachStream(stream);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Camera access denied';
      setError(
        message.includes('Permission')
          ? 'Camera permission denied. Allow camera access in browser settings.'
          : 'Camera unavailable. Use attach photos instead.',
      );
      setReady(false);
    }
  }, [attachStream]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setReady(false);
  }, []);

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && streamRef.current && node.srcObject !== streamRef.current) {
        void attachStream(streamRef.current);
      }
    },
    [attachStream],
  );

  const captureFrame = useCallback((): Blob | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const byteString = atob(dataUrl.split(',')[1]);
    const buffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      buffer[i] = byteString.charCodeAt(i);
    }
    return new Blob([buffer], { type: 'image/jpeg' });
  }, []);

  return { videoRef: setVideoRef, ready, error, captureFrame, start, stop };
}
