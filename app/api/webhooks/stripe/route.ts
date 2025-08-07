import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Restaurant from "@/model/Restaurant";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          throw new Error("No userId in session metadata");
        }

        await connectDB();

            // Update restaurant status after successful payment
        const restaurant = await Restaurant.findOneAndUpdate(
          { userId },
          { 
            $set: { 
              subscriptionId: session.subscription as string,
              paymentStatus: "active",
              setupComplete: true,
              plan: session.metadata?.plan || "basic"
            } 
          },
          { new: true }
        );

        if (!restaurant) {
          throw new Error("Restaurant not found");
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        await connectDB();

        // Update restaurant when subscription is cancelled
        await Restaurant.findOneAndUpdate(
          { subscriptionId: subscription.id },
          { 
            $set: { 
              paymentStatus: "inactive",
              setupComplete: false
            } 
          }
        );

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
