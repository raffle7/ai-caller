"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";

const LANGUAGES = ["English", "Spanish", "French", "German"];
const VOICES = ["Male", "Female"];
const ACCENTS = ["US", "UK", "Australian", "Indian"];

function AIConfigStep({
  form,
  setForm,
  prevStep,
  nextStep
}: {
  form: any;
  setForm: any;
  prevStep: () => void;
  nextStep: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Language</h3>
        <Select
          value={form.language}
          onValueChange={(value: string) =>
            setForm((prev: any) => ({ ...prev, language: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Voice</h3>
        <Select
          value={form.voice}
          onValueChange={(value: string) =>
            setForm((prev: any) => ({ ...prev, voice: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Voice" />
          </SelectTrigger>
          <SelectContent>
            {VOICES.map((voice) => (
              <SelectItem key={voice} value={voice}>
                {voice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Accent</h3>
        <Select
          value={form.accent}
          onValueChange={(value: string) =>
            setForm((prev: any) => ({ ...prev, accent: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Accent" />
          </SelectTrigger>
          <SelectContent>
            {ACCENTS.map((acc) => (
              <SelectItem key={acc} value={acc}>
                {acc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={nextStep} disabled={!form.language || !form.voice || !form.accent}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default AIConfigStep;
