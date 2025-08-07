"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const [form, setForm] = useState({
    restaurantName: "",
    locations: "",
    primaryPhone: "",
    aiNumber: "",
    language: "",
    voice: "",
    accent: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save settings
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        // Show success message
      }
    } catch (error) {
      // Show error message
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant Name</label>
                <Input
                  value={form.restaurantName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      restaurantName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Locations</label>
                <Input
                  value={form.locations}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, locations: e.target.value }))
                  }
                  placeholder="Comma-separated list of locations"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Phone Number</label>
                <Input
                  type="tel"
                  value={form.primaryPhone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, primaryPhone: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">AI Phone Number</label>
                <Input
                  type="tel"
                  value={form.aiNumber}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, aiNumber: e.target.value }))
                  }
                />
              </div>

              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select
                  value={form.language}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Voice</label>
                <Select
                  value={form.voice}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, voice: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Accent</label>
                <Select
                  value={form.accent}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, accent: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">US</SelectItem>
                    <SelectItem value="uk">UK</SelectItem>
                    <SelectItem value="au">Australian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit">Save AI Settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
