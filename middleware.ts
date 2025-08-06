import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setup/:path*",
    "/api/setup/:path*",
    "/api/twilio/:path*",
  ],
};
