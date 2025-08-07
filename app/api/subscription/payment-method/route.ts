// @ts-nocheck
// eslint-disable
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]";
import Stripe from "stripe";
import Restaurant from "@/model/Restaurant";
import { connectDB } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});


export async function POST(
  req: Request,
  { params }: { params: { action: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const restaurant = await Restaurant.findOne({ userId: session.user.id });

    if (!restaurant?.subscriptionId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const body = await req.json();
    const subscription = await stripe.subscriptions.retrieve(restaurant.subscriptionId);

    switch (params.action) {
      case "add-card": {
        const setupIntent = await stripe.setupIntents.create({
          customer: subscription.customer as string,
          payment_method_types: ["card"],
        });
        return NextResponse.json({ clientSecret: setupIntent.client_secret });
      }

      case "update-default": {
        if (!body.paymentMethodId) {
          return NextResponse.json({ error: "Payment method ID required" }, { status: 400 });
        }

        await stripe.subscriptions.update(subscription.id, {
          default_payment_method: body.paymentMethodId,
        });

        return NextResponse.json({ success: true });
      }

      case "remove-card": {
        if (!body.paymentMethodId) {
          return NextResponse.json({ error: "Payment method ID required" }, { status: 400 });
        }

        await stripe.paymentMethods.detach(body.paymentMethodId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing payment method:", error);
    return NextResponse.json(
      { error: "Error managing payment method" },
      { status: 500 }
    );
  }
}
