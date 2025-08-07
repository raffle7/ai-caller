"use client";

import { useEffect, useRef, useState } from "react";

export default function TestMicPage() {
  const [avgVolume, setAvgVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
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
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      mediaStreamSourceRef.current = source;

      intervalRef.current = setInterval(() => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
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
