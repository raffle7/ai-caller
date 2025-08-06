import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Restaurant from "@/model/Restaurant";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ complete: false, step: 1 });
    }

    await connectDB();

    const restaurant = await Restaurant.findOne({ userId: session.user.id });
    if (!restaurant) {
      return NextResponse.json({ complete: false, step: 1 });
    }

    // Group menu items by category
    const groupedMenu = (restaurant.menu || []).reduce((acc: any[], item: any) => {
      const existing = acc.find(cat => cat.category === item.category);
      if (existing) {
        existing.items.push(item);
      } else {
        acc.push({ category: item.category, items: [item] });
      }
      return acc;
    }, []);

    // Step detection
    let currentStep = 1;

    if (restaurant.name && restaurant.locations?.length > 0 && restaurant.ownerName) {
      currentStep = 2;
    }

    if (currentStep === 2 && restaurant.restaurantNumber && restaurant.aiNumber) {
      currentStep = 3;
    }

    // Skipping posSystem step entirely if not used
    const hasMenu =
      Array.isArray(restaurant.menu) &&
      restaurant.menu.length > 0 &&
      (restaurant.menu[0].items
        ? restaurant.menu.some((g: any) => g.items?.length > 0)
        : true);

    if (currentStep === 3 && hasMenu) {
      currentStep = 4;
    }

    if (
      currentStep === 4 &&
      restaurant.language &&
      restaurant.voice &&
      restaurant.accent
    ) {
      currentStep = 5;
    }

    const allStepsCompleted =
      restaurant.name &&
      restaurant.locations?.length > 0 &&
      restaurant.ownerName &&
      restaurant.restaurantNumber &&
      restaurant.aiNumber &&
      hasMenu &&
      restaurant.language &&
      restaurant.voice &&
      restaurant.accent &&
      restaurant.setupComplete; // ✅ must be true ONLY after Go Live


    return NextResponse.json({
      complete: allStepsCompleted,
      step: currentStep,
      restaurant: {
        name: restaurant.name,
        locations: restaurant.locations,
        ownerName: restaurant.ownerName,
        restaurantNumber: restaurant.restaurantNumber,
        aiNumber: restaurant.aiNumber,
        posSystem: restaurant.posSystem,
        menu: groupedMenu,
        deals: restaurant.deals || [],
        menuCount: groupedMenu.length,
        dealsCount: (restaurant.deals || []).length,
      },
    });
  } catch (error) {
    console.error("Setup check error:", error);
    return NextResponse.json(
      { error: "Failed to check setup status" },
      { status: 500 }
    );
  }
}
