import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

async function checkSetupStatus(req: Request, token: string) {
  try {
    // Create a new request to the internal API route
    const apiUrl = new URL('/api/setup/check', req.url);
    const response = await fetch(apiUrl, {
  headers: {
    ...req.headers,
    'Authorization': `Bearer ${token}`
  }
});

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

const contentType = response.headers.get("content-type");
if (contentType && contentType.includes("application/json")) {
  const data = await response.json();
  return data;
} else {
  // Received HTML (probably login page), treat as incomplete setup
  return { complete: false, step: 1 };
}
  } catch (error) {
    console.error("Error checking setup status:", error);
    return { complete: false, step: 1 };
  }
}

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check if user is trying to access dashboard
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const setupStatus = await checkSetupStatus(req, token.sub as string);
      
      if (!setupStatus.complete) {
        // Redirect to setup with current step
        return NextResponse.redirect(
          new URL(`/setup?step=${setupStatus.step}`, req.url)
        );
      }
    }

    // Allow access to setup pages while incomplete
    if (req.nextUrl.pathname.startsWith("/setup")) {
      const setupStatus = await checkSetupStatus(req, token.sub as string);
      
      if (setupStatus.complete) {
        // If setup is complete, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setup/:path*",
    "/api/setup/:path*",
    "/api/twilio/:path*",
    "/api/subscription/:path*",
  ],
};
