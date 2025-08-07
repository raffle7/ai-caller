"use client";

import { useEffect, useRef, useState } from "react";

export default function TestMicPage() {
  const [avgVolume, setAvgVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Force correct type for WebAudio API
  type StrictUint8Array = Uint8Array & { buffer: ArrayBuffer };
  const dataArrayRef = useRef<StrictUint8Array | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
  // Always use number for bufferLength, so Uint8Array is correct type
  const dataArray: StrictUint8Array = new Uint8Array(bufferLength) as StrictUint8Array;

      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      mediaStreamSourceRef.current = source;

      intervalRef.current = setInterval(() => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        // Defensive: only use if buffer is ArrayBuffer
        if (dataArrayRef.current.buffer instanceof ArrayBuffer) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current as unknown as Uint8Array<ArrayBuffer>);
        }
        const avg =
          dataArrayRef.current.reduce((sum, val) => sum + val, 0) / dataArrayRef.current.length;
        setAvgVolume(avg);
      }, 200);
    };

    init();

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <div
        className={`w-32 h-32 rounded-full ${
          avgVolume > 10 ? "bg-green-500" : "bg-red-500"
        } transition-all`}
      />
      <p className="mt-4 text-lg">Average Volume: {avgVolume.toFixed(2)}</p>
    </div>
  );
}
