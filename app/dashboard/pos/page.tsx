"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X } from "lucide-react";

const POS_SYSTEMS = [
  {
    id: "square",
    name: "Square",
    logo: "/square-logo.png",
    description: "Connect with Square POS system",
  },
  {
    id: "clover",
    name: "Clover",
    logo: "/clover-logo.png",
    description: "Connect with Clover POS system",
  },
  {
    id: "toast",
    name: "Toast",
    logo: "/toast-logo.png",
    description: "Connect with Toast POS system",
  },
];

export default function POSConnectPage() {
  const [selectedPOS, setSelectedPOS] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"connected" | "disconnected">("disconnected");
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleConnect = async () => {
    try {
      const res = await fetch("/api/pos/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: selectedPOS, apiKey }),
      });

      if (res.ok) {
        setStatus("connected");
      }
    } catch (error) {
      // Handle error
    }
  };

  const handleTestConnection = async () => {
    try {
      const res = await fetch("/api/pos/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: selectedPOS }),
      });

      if (res.ok) {
        setTestResult("success");
      } else {
        setTestResult("error");
      }
    } catch (error) {
      setTestResult("error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">POS Integration</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select POS System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {POS_SYSTEMS.map((pos) => (
              <div
                key={pos.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPOS === pos.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedPOS(pos.id)}
              >
                <div className="font-medium mb-2">{pos.name}</div>
                <p className="text-sm text-muted-foreground">{pos.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPOS && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleConnect} disabled={!apiKey}>
                  Connect
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={status !== "connected"}
                >
                  Test Connection
                </Button>
              </div>

              {status === "connected" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  Connected successfully
                </div>
              )}

              {testResult && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    testResult === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {testResult === "success" ? (
                    <>
                      <Check className="w-4 h-4" />
                      Test successful
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Test failed
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configuration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Sync Interval</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="1min">Every minute</SelectItem>
                  <SelectItem value="5min">Every 5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Menu Sync</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select sync option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual sync</SelectItem>
                  <SelectItem value="daily">Daily sync</SelectItem>
                  <SelectItem value="auto">Auto sync on changes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
