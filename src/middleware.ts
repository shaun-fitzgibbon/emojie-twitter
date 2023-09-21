import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware();

// Stop Middleware running on static files
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
