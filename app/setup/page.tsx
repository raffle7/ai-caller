"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import GoLiveStep from "./GoLiveStep";
import MenuStep from "./MenuStep";
import AIConfigStep from "@/components/AIConfigStep";

import { SetupForm } from "@/types";


function SetupWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<SetupForm>({
    name: "",
    locations: [],
    ownerName: "",
    restaurantNumber: "",
    aiNumber: "",
    posSystem: "",
    menu: [],
    deals: []
  });

  // Fetch existing setup data when component mounts
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/setup/check")
        .then(res => res.json())
        .then(data => {
          if (data.complete) {
            router.push("/dashboard");
            return;
          }
          if (data.restaurant) {
            setForm(prev => ({
              ...prev,
              ...data.restaurant
            }));
          }
          setStep(data.step);
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);
  const [twilioNumbers, setTwilioNumbers] = React.useState<{ phoneNumber: string; friendlyName?: string }[]>([]);
  const [loadingNumbers, setLoadingNumbers] = React.useState(false);
  const [numbersError, setNumbersError] = React.useState<string | null>(null);

  // Fetch Twilio numbers when step 2 is active
  React.useEffect(() => {
    async function fetchNumbers() {
      if (loadingNumbers) return;
      
      try {
        setLoadingNumbers(true);
        console.log("[Twilio] Fetching numbers...");
        
        const res = await fetch("/api/twilio/numbers");
        console.log("[Twilio] Response status:", res.status);
        
        const data = await res.json();
        console.log("[Twilio] Data received:", data);
        
        if (data.numbers && data.numbers.length > 0) {
          setTwilioNumbers(data.numbers);
          setNumbersError(null);
          
          // Set initial AI number immediately if not set
          if (!form.aiNumber) {
            setForm(prev => ({ ...prev, aiNumber: data.numbers[0].phoneNumber }));
          }
        } else {
          setNumbersError(data.error || "No numbers available");
          console.error("[Twilio] Error:", data.error || "No numbers available");
        }
      } catch (err) {
        setNumbersError("Failed to fetch numbers");
        console.error("[Twilio] Fetch error:", err);
      } finally {
        setLoadingNumbers(false);
      }
    }

    if (step === 2 && twilioNumbers.length === 0) {
      fetchNumbers();
    }
  }, [step, form.aiNumber]);

  // Set initial AI number when Twilio numbers are loaded
  React.useEffect(() => {
    if (step === 2 && twilioNumbers.length > 0 && !form.aiNumber) {
      console.log("[Twilio] Setting initial aiNumber:", twilioNumbers[0].phoneNumber);
      setForm((prev) => ({ ...prev, aiNumber: twilioNumbers[0].phoneNumber }));
    }
  }, [twilioNumbers, step, form.aiNumber]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Save progress and move to next step
  const saveAndNext = async () => {
  try {
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, step: step + 1 }) // increment before sending
    });

    if (res.ok) {
      nextStep(); // move to next step on success
    } else {
      console.error("Failed to save progress");
    }
  } catch (err) {
    console.error("Error saving progress:", err);
  }
};

  // Validation for each step
  const canGoNext = () => {
    if (step === 1) {
      return form.name && form.locations.length > 0 && form.ownerName;
    }
    if (step === 2) {
      return form.restaurantNumber && form.aiNumber && twilioNumbers.length > 0;
    }
    if (step === 3) return form.menu.length > 0;
    if (step === 4) return form.language && form.voice && form.accent;
    return true;
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null; // useEffect will handle redirect
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Setup Wizard</h2>
        </CardHeader>
        <CardContent>
          <Tabs value={`step${step}`}> 
            <TabsList className="mb-6">
              {[1,2,3,4,5].map((n) => (
                <TabsTrigger key={n} value={`step${n}`} disabled={step!==n}>
                  Step {n}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* Step 1: Restaurant Details */}
            <TabsContent value="step1">
              <div className="space-y-4">
                <Input 
                  placeholder="Restaurant Name" 
                  value={form.name} 
                  onChange={e => setForm(f => ({...f, name: e.target.value}))} 
                />
                <Input 
                  placeholder="Restaurant Locations (comma-separated)" 
                  value={form.locations.join(', ')} 
                  onChange={e => setForm(f => ({...f, locations: e.target.value.split(',').map(loc => loc.trim())}))} 
                />
                <Input 
                  placeholder="Owner Name" 
                  value={form.ownerName} 
                  onChange={e => setForm(f => ({...f, ownerName: e.target.value}))} 
                />
                <div className="flex justify-end gap-2">
                  <Button onClick={saveAndNext} disabled={!canGoNext()}>Next</Button>
                </div>
              </div>
            </TabsContent>
            {/* Step 2: Connect with AI number */}
            <TabsContent value="step2">
  <div className="space-y-4">
    <Input
      placeholder="Restaurant Number"
      value={form.restaurantNumber}
      onChange={(e) =>
        setForm((f: any) => ({ ...f, restaurantNumber: e.target.value }))
      }
    />
    <div className="space-y-2">
      <label className="text-sm font-medium">AI Phone Number</label>
      {loadingNumbers ? (
        <div className="text-sm">Loading available numbers...</div>
      ) : numbersError ? (
        <div className="text-sm text-red-500">{numbersError}</div>
      ) : twilioNumbers.length === 0 ? (
        <div className="text-sm text-red-500">No numbers available</div>
      ) : (
        <Select
          value={form.aiNumber}
          onValueChange={(value: string) => {
            console.log("[Twilio] Selecting number:", value);
            setForm((prev) => ({ ...prev, aiNumber: value }));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI Number" />
          </SelectTrigger>
          <SelectContent>
            {twilioNumbers.map((num) => (
              <SelectItem key={num.phoneNumber} value={num.phoneNumber}>
                {num.friendlyName || num.phoneNumber} ({num.phoneNumber})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
    <div className="flex justify-between gap-2">
      <Button variant="outline" onClick={prevStep}>
        Back
      </Button>
      <Button onClick={saveAndNext} disabled={!canGoNext()}>
        Next
      </Button>
    </div>
  </div>
</TabsContent>
            {/* Step 3: Menu */}
<TabsContent value="step3">
  <MenuStep form={form} setForm={setForm} prevStep={prevStep} nextStep={saveAndNext} />
</TabsContent>

{/* Step 4: AI Configuration */}
<TabsContent value="step4">
  <AIConfigStep form={form} setForm={setForm} prevStep={prevStep} nextStep={saveAndNext} />
</TabsContent>
            {/* Step 5: Go Live */}
            <TabsContent value="step5">
              <GoLiveStep form={form} prevStep={prevStep} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default SetupWizard;
