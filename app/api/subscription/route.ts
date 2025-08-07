import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]";
import Stripe from "stripe";
import Restaurant from "@/model/Restaurant";
import { connectDB } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function GET(req: Request) {
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

    const subscription = await stripe.subscriptions.retrieve(restaurant.subscriptionId);
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      subscription: restaurant.subscriptionId,
    });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.customer as string,
      type: "card",
    });

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: restaurant.plan,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      upcomingInvoice: {
        amount: upcomingInvoice.amount_due,
        date: upcomingInvoice.next_payment_attempt,
      },
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: pm.id === subscription.default_payment_method,
      })),
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Error fetching subscription details" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();
    const restaurant = await Restaurant.findOne({ userId: session.user.id });

    if (!restaurant?.subscriptionId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    if (body.action === "cancel") {
      const subscription = await stripe.subscriptions.update(restaurant.subscriptionId, {
        cancel_at_period_end: true,
      });
      return NextResponse.json({ subscription });
    }

    if (body.action === "resume") {
      const subscription = await stripe.subscriptions.update(restaurant.subscriptionId, {
        cancel_at_period_end: false,
      });
      return NextResponse.json({ subscription });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Error updating subscription" },
      { status: 500 }
    );
  }
}
