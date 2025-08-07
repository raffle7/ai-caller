"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const features = [
  {
    title: "AI Voice Calling",
    description: "Advanced AI-powered calling system for automated order taking",
    href: "/features#ai-voice",
  },
  {
    title: "POS Integration",
    description: "Seamless integration with major POS systems",
    href: "/features#pos",
  },
  {
    title: "Order Management",
    description: "Efficient order processing and management system",
    href: "/features#orders",
  },
  {
    title: "Analytics",
    description: "Detailed insights and performance metrics",
    href: "/features#analytics",
  },
];

const caseStudies = [
  {
    title: "Restaurant Chain Success",
    description: "How a 50-location chain increased efficiency by 40%",
    href: "/case-studies#chain",
  },
  {
    title: "Small Business Growth",
    description: "Local restaurant saves 20 hours per week",
    href: "/case-studies#small-business",
  },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user) {
      fetch("/api/setup/check")
        .then((res) => res.json())
        .then((data) => {
          setIsSetupComplete(data.complete);
        });
    }
  }, [session]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">AI Caller</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            {!pathname.startsWith("/dashboard") && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {features.map((feature) => (
                        <li key={feature.title} className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              href={feature.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{feature.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {feature.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/pricing" className={navigationMenuTriggerStyle()}>
                      Pricing
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Case Studies</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {caseStudies.map((study) => (
                        <li key={study.title} className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              href={study.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{study.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {study.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/contact" className={navigationMenuTriggerStyle()}>
                      Contact
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}

            {pathname.startsWith("/dashboard") && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/dashboard/orders" className={navigationMenuTriggerStyle()}>
                      Orders
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/dashboard/menu" className={navigationMenuTriggerStyle()}>
                      Menu
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/dashboard/pos" className={navigationMenuTriggerStyle()}>
                      POS
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/dashboard/settings" className={navigationMenuTriggerStyle()}>
                      Settings
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <Button variant="ghost" disabled>
              Loading...
            </Button>
          ) : status === "authenticated" ? (
            <>
              <Button
                variant="default"
                asChild
              >
                {pathname.startsWith("/dashboard") ? (
                  <Link href="/dashboard/subscription">Subscription</Link>
                ) : (
                  <Link href={isSetupComplete ? "/dashboard" : "/setup"}>
                    {isSetupComplete ? "Dashboard" : "Complete Setup"}
                  </Link>
                )}
              </Button>
              <Button
                variant="ghost"
                asChild
              >
                <Link href="/api/auth/signout">Sign Out</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
