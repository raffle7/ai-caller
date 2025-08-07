"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SetupForm } from "@/types";

type Props = {
  onClose: () => void;
  restaurant: Pick<SetupForm, "name" | "menu" | "language" | "voice" | "accent">;
};

function SimulatedTestCallModal({ onClose, restaurant }: Props) {
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [menu, setMenu] = useState(restaurant.menu);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [lastRecognizedItem, setLastRecognizedItem] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      const res = await fetch("/api/setup/check");
      if (res.ok) {
        const data = await res.json();
        if (data.restaurant?.menu) setMenu(data.restaurant.menu);
      }
    }
    fetchMenu();
  }, []);

  const speak = (text: string, afterSpeak?: () => void) => {
    speechSynthesis.cancel();
    setAiSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    const lang =
      restaurant.language === "Spanish"
        ? "es-ES"
        : restaurant.language === "French"
        ? "fr-FR"
        : restaurant.language === "German"
        ? "de-DE"
        : "en-US";

    utterance.lang = lang;

    utterance.onend = () => {
      setAiSpeaking(false);
      afterSpeak?.();
    };

    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const greeting =
      `Hello! Welcome to ${restaurant.name}. Here's our menu: ` +
      menu
        .map((cat) => `${cat.category}: ${cat.items.map((i) => i.name).join(", ")}`)
        .join(" | ") +
      ". What would you like to order?";
    speak(greeting, () => startListening());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  const startListening = async () => {
    setTranscript("");
    setResponse("");
    setIsListening(true);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error("❌ Error accessing microphone:", error);
      return;
    }

    const audioContext = new AudioContext();
    if (audioContext.state === "suspended") await audioContext.resume();

    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 2048;
    const dataArray = new Uint8Array(analyser.fftSize);

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      setIsListening(false);
      audioContext.close();

      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("menu", JSON.stringify(menu || []));
      formData.append(
        "confirmed",
        awaitingConfirmation && lastRecognizedItem ? "true" : "false"
      );

      const res = await fetch("/api/simulate-order", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("❌ API error:", await res.text());
        return;
      }

      const data = await res.json();
      const cleanTranscript = data.transcript.toLowerCase().trim();
      setTranscript(data.transcript);
      setResponse(data.reply);

      // DEBUG LOGS
      console.log("🧾 Awaiting confirmation:", awaitingConfirmation);
      console.log("🗣️ User said:", cleanTranscript);

      // Handle "no" from user
      if (
        awaitingConfirmation &&
        (cleanTranscript.includes("no") || cleanTranscript.includes("not now"))
      ) {
        setAwaitingConfirmation(false);
        setLastRecognizedItem(null);
        speak("No problem! Let me know what you'd like to order.", () => startListening());
        return;
      }

      // If order is recognized but not yet confirmed
      if (data.orderPlaced && !awaitingConfirmation) {
        setAwaitingConfirmation(true);
        setLastRecognizedItem(data.orderedItem);
        speak(data.reply, () => startListening());
        return;
      }

      // If order is confirmed
      if (
        data.orderPlaced &&
        awaitingConfirmation &&
        lastRecognizedItem === data.orderedItem
      ) {
        setAwaitingConfirmation(false);
        setLastRecognizedItem(null);
        speak(data.reply); // Final response after placing order
        return;
      }

      // Default: loop back
      speak(data.reply, () => startListening());
    };

    mediaRecorderRef.current.start();

    // Auto-stop after timeout (in case of silence)
    setTimeout(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        console.warn("⏳ Forced stop due to timeout");
        mediaRecorderRef.current.stop();
      }
    }, 15000); // Increased to 15s

    // Silence detection
    let totalVolume = 0;
    let volumeChecks = 0;
    let hasUserSpoken = false;

    const checkSilence = () => {
      analyser.getByteTimeDomainData(dataArray);
      const avg =
        dataArray.reduce((sum, val) => sum + Math.abs(val - 128), 0) / dataArray.length;

      if (avg > 1) hasUserSpoken = true;

      if (hasUserSpoken) {
        totalVolume += avg;
        volumeChecks++;
        const smoothed = totalVolume / volumeChecks;

        if (smoothed < 0.5) {
          if (!silenceTimeoutRef.current) {
            silenceTimeoutRef.current = setTimeout(() => {
              if (mediaRecorderRef.current?.state === "recording") {
                mediaRecorderRef.current.stop();
              }
            }, 1500);
          }
        } else {
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        }
      }

      if (isListening) {
        requestAnimationFrame(checkSilence);
      }
    };

    requestAnimationFrame(checkSilence);
  };

  const renderAiAnimation = () => (
    <div className="flex items-center gap-2 mt-2">
      <span className="animate-bounce text-lg">●</span>
      <span className="animate-bounce text-lg" style={{ animationDelay: "0.2s" }}>
        ●
      </span>
      <span className="animate-bounce text-lg" style={{ animationDelay: "0.4s" }}>
        ●
      </span>
      <span className="ml-2 text-sm text-gray-500">AI is speaking...</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Simulated AI Test Call</h2>
        <div className="space-y-2">
          <div>
            <strong>You said:</strong>
            <div className="border p-2 rounded min-h-[50px] text-sm">
              {transcript || (isListening ? "Listening..." : "—")}
            </div>
          </div>
          <div>
            <strong>AI response:</strong>
            <div className="border p-2 rounded min-h-[50px] text-sm">
              {response || (aiSpeaking ? renderAiAnimation() : "—")}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SimulatedTestCallModal;
