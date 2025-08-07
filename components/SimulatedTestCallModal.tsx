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
  const [isRecording, setIsRecording] = useState(false);
  const [menu, setMenu] = useState(restaurant.menu);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Fetch latest menu from backend
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

  const speak = (text: string) => {
  speechSynthesis.cancel(); // Cancel any ongoing speech first
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang =
    restaurant.language === "Spanish"
      ? "es-ES"
      : restaurant.language === "French"
      ? "fr-FR"
      : restaurant.language === "German"
      ? "de-DE"
      : "en-US";
  speechSynthesis.speak(utterance);
};

  useEffect(() => {
    const greeting =
      `Hello! Welcome to ${restaurant.name}. Here's our menu: ` +
      menu
        .map((cat) => `${cat.category}: ${cat.items.map((i) => i.name).join(", ")}`)
        .join(" | ") +
      ". What would you like to order?";
    speak(greeting);
  }, [menu]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunks.current = [];

    recorder.ondataavailable = (e) => audioChunks.current.push(e.data);

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob);

      // Send menu to backend for accurate AI response
      formData.append("menu", JSON.stringify(menu));

      const res = await fetch("/api/simulate-order", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setTranscript(data.transcript);
      setResponse(data.reply);
      speak(data.reply);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Simulated AI Test Call</h2>
        <div className="space-y-2">
          <div>
            <strong>You said:</strong>
            <div className="border p-2 rounded min-h-[50px] text-sm">
              {transcript || "—"}
            </div>
          </div>
          <div>
            <strong>AI response:</strong>
            <div className="border p-2 rounded min-h-[50px] text-sm">
              {response || "—"}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={isRecording ? handleStopRecording : handleStartRecording}>
            {isRecording ? "Stop Recording" : "Start Talking"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SimulatedTestCallModal;
