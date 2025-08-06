import React from "react";
import { Button } from "@/components/ui/button";
import SimulatedTestCallModal from "@/components/SimulatedTestCallModal"; // 👈 import this



function GoLiveStep({ form, prevStep }: { form: any; prevStep: () => void }) {
  const [showPayment, setShowPayment] = React.useState(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);
  const [testCallStatus, setTestCallStatus] = React.useState<string | null>(null);
  const [showSimModal, setShowSimModal] = React.useState(false);

  const handleTestCall = () => {
    setTestCallStatus("Calling...");
    setTimeout(() => setTestCallStatus("Test call successful!"), 1500);
  };

  const handlePayment = async () => {
    setTestCallStatus(null);
    setShowPayment(true);
    try {
      await new Promise(res => setTimeout(res, 1200));
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, step: 5, setupComplete: true }),
      });
      if (res.ok) {
        setPaymentSuccess(true);
        setShowPayment(false);
      } else {
        setShowPayment(false);
        setTestCallStatus("Failed to save config. Please try again.");
      }
    } catch {
      setShowPayment(false);
      setTestCallStatus("Failed to save config. Please try again.");
    }
  };

  return (
    <>
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Config Summary</h3>
      <div className="bg-muted p-4 rounded">
        <div><b>Restaurant Name:</b> {form.name}</div>
        <div><b>Locations:</b> {form.locations?.join(", ")}</div>
        <div><b>Owner:</b> {form.ownerName}</div>
        <div><b>Restaurant Number:</b> {form.restaurantNumber}</div>
        <div><b>AI Number:</b> {form.aiNumber}</div>
        <div><b>POS:</b> {form.posSystem}</div>
        <div><b>Menu:</b>
          <ul className="list-disc pl-5">
            {form.menu.map((cat: any) => (
              <li key={cat.category}>{cat.category}
                <ul className="list-disc pl-5">
                  {cat.items.map((item: any, idx: number) => (
                    <li key={idx}>{item.name} - ${item.price}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div><b>Deals:</b>
          <ul className="list-disc pl-5">
            {form.deals.map((d: any, idx: number) => (
              <li key={idx}>{d.name}: {d.description}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setShowSimModal(true)} variant="secondary">
  Simulate Test Call
</Button>
        {testCallStatus && <span className="self-center text-green-600">{testCallStatus}</span>}
      </div>
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button onClick={() => setShowPayment(true)} disabled={paymentSuccess}>
          {paymentSuccess ? "Go Live Complete" : "Go Live"}
        </Button>
      </div>
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
            <h4 className="font-bold mb-2">Payment</h4>
            <div className="mb-4">Pay to go live and assign your AI number.</div>
            <Button className="w-full" onClick={handlePayment}>Simulate Payment</Button>
            <Button className="w-full mt-2" variant="outline" onClick={() => setShowPayment(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {paymentSuccess && <div className="text-green-600 font-semibold">Payment successful! Your config is saved and number assigned.</div>}
    </div>
    {showSimModal && (
  <SimulatedTestCallModal
  onClose={() => setShowSimModal(false)}
  restaurant={{
    name: form.name || "your restaurant",
    menu: form.menu,
    language: form.language,
    voice: form.voice,
    accent: form.accent,
  }}
/>
)}

    </>
  );
}

export default GoLiveStep;
