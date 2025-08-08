
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { CreditCard, Calendar, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


interface SubscriptionDetails {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}
interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface UpcomingInvoice {
  amount: number;
  date: number;
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoice | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [setupIntent, setSetupIntent] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchSubscriptionDetails();
    }
  }, [session]);

  const fetchSubscriptionDetails = async () => {
    try {
      const res = await fetch("/api/subscription");
      const data = await res.json();

      if (res.ok) {
        setSubscription(data.subscription);
        setPaymentMethods(data.paymentMethods);
        setUpcomingInvoice(data.upcomingInvoice);
      } else {
        console.error("Error fetching subscription:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    try {
      const res = await fetch("/api/subscription/payment-method/add-card", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setSetupIntent(data.clientSecret);
        setShowAddCard(true);
      }
    } catch (error) {
      console.error("Error setting up new card:", error);
    }
  };

  const handleUpdateDefaultCard = async (paymentMethodId: string) => {
    try {
      const res = await fetch("/api/subscription/payment-method/update-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (res.ok) {
        fetchSubscriptionDetails();
      }
    } catch (error) {
      console.error("Error updating default card:", error);
    }
  };

  const handleRemoveCard = async (paymentMethodId: string) => {
    try {
      const res = await fetch("/api/subscription/payment-method/remove-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (res.ok) {
        fetchSubscriptionDetails();
      }
    } catch (error) {
      console.error("Error removing card:", error);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch("/api/subscription", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (res.ok) {
        fetchSubscriptionDetails();
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      const res = await fetch("/api/subscription", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resume" }),
      });

      if (res.ok) {
        fetchSubscriptionDetails();
      }
    } catch (error) {
      console.error("Error resuming subscription:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Subscription Management</h1>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your subscription details and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">{subscription?.plan ? subscription.plan.toUpperCase() : "N/A"} Plan</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  subscription?.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {subscription?.status}
              </span>
              {subscription?.cancelAtPeriodEnd && (
                <p className="text-sm text-red-600 mt-2">
                  Your subscription will end on{" "}
                  {subscription && subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString() : "N/A"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Next billing date: {" "}
                {upcomingInvoice && upcomingInvoice.date
                  ? new Date(upcomingInvoice.date * 1000).toLocaleDateString()
                  : "N/A"}
              </div>
              <div className="flex items-center text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Next payment: ${upcomingInvoice && typeof upcomingInvoice.amount === "number" ? (upcomingInvoice.amount / 100).toFixed(2) : "N/A"}
              </div>
            </div>
          </div>
          <div className="mt-4 space-x-4">
            {subscription?.cancelAtPeriodEnd ? (
              <Button variant="outline" onClick={handleResumeSubscription}>
                Resume Subscription
              </Button>
            ) : (
              <Button variant="outline" onClick={handleCancelSubscription}>
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your saved payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <CreditCard className="w-6 h-6" />
                  <div>
                    <p className="font-medium">
                      {method.brand} ending in {method.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                <div className="space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateDefaultCard(method.id)}
                    >
                      Make Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCard(method.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddCard}
            >
              Add New Card
            </Button>
          </div>

          {showAddCard && setupIntent && (
            <div className="mt-4">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: setupIntent,
                  appearance: { theme: "stripe" },
                }}
              >
                <AddCardForm
                  onSuccess={() => {
                    setShowAddCard(false);
                    fetchSubscriptionDetails();
                  }}
                  onCancel={() => setShowAddCard(false)}
                />
              </Elements>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past subscription payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th className="font-medium">Date</th>
                <th className="font-medium">Description</th>
                <th className="font-medium">Amount</th>
                <th className="font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* We'll implement billing history in the next iteration */}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AddCardForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error: submitError } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/subscription`,
      },
    });

    if (submitError) {
      setError(submitError.message ?? "An error occurred");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || processing}>
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing
            </>
          ) : (
            "Add Card"
          )}
        </Button>
      </div>
    </form>
  );
}

